import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaArrowCircleRight } from 'react-icons/fa';
import { auth, database } from '../components/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './Event.css';

function Event() {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedEvents, setLikedEvents] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [collegeName, setCollegeName] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const MAX_RETRIES = 3;
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchData(user.uid);
            } else {
                setIsLoading(false);
                setEvents([]);
            }
        });

        const timer = setInterval(() => {
            setEvents((prevEvents) => prevEvents.map(updateEventStatus));
        }, 1000);

        return () => {
            unsubscribeAuth();
            clearInterval(timer);
        };
    }, []);

    const fetchData = async (userId) => {
        let unsubscribeStudent = null;
        let unsubscribeCollege = null;

        const studentRef = ref(database, `Users/Students/${userId}/collegeName`);
        const collegeRepRef = ref(database, `Users/College/${userId}/collegeName`);

        unsubscribeStudent = onValue(studentRef, (snapshot) => {
            const studentCollegeName = snapshot.val();
            if (studentCollegeName) {
                setCollegeName(studentCollegeName);
                if (unsubscribeCollege) unsubscribeCollege();
                fetchEvents(studentCollegeName);
            } else {
                unsubscribeCollege = onValue(collegeRepRef, (snapshot) => {
                    const collegeRepCollegeName = snapshot.val();
                    if (collegeRepCollegeName) {
                        setCollegeName(collegeRepCollegeName);
                        fetchEvents(collegeRepCollegeName);
                    } else {
                        setIsLoading(false);
                    }
                });
            }
        });
    };

    const fetchEvents = (collegeNameValue) => {
        if (!collegeNameValue) return;

        const eventsRef = ref(database, `events/${collegeNameValue}`);

        return onValue(eventsRef, async (snapshot) => {
            const eventData = snapshot.val();
            if (eventData) {
                const eventsWithRegistrations = await Promise.all(
                    Object.keys(eventData).map(async (name) => {
                        const eventDetails = eventData[name];
                        const registrationsRef = ref(database, `registrations/${collegeNameValue}/${name}`);
                        return new Promise((resolve) => {
                            onValue(
                                registrationsRef,
                                (registrationSnapshot) => {
                                    const registrationData = registrationSnapshot.val();
                                    const registrationCount = registrationData ? Object.keys(registrationData).length : 0;

                                    resolve(
                                        updateEventStatus({
                                            id: name,
                                            ...eventDetails,
                                            registered: registrationCount,
                                        })
                                    );
                                },
                                {
                                    onlyOnce: true,
                                }
                            );
                        });
                    })
                );

                const validEvents = eventsWithRegistrations.filter(Boolean);
                setEvents(validEvents);
                setRetryCount(0);
            } else {
                setEvents([]);
                if (retryCount < MAX_RETRIES) {
                    setTimeout(() => {
                        handleRefresh();
                        setRetryCount((prev) => prev + 1);
                    }, 2000);
                }
            }
            setIsLoading(false);
        });
    };

    const updateEventStatus = (event) => {
        if (!event) return null;

        const now = new Date();
        const eventDate = new Date(event.date + ' ' + event.time);
        const timeDiff = eventDate - now;
        const hoursDiff = timeDiff / (1000 * 3600);
        const daysDiff = hoursDiff / 24;

        if (daysDiff < -1) {
            return { ...event, status: 'PAST', countdown: 'Event has ended' };
        } else if (daysDiff < 0 || (daysDiff === 0 && hoursDiff <= 0)) {
            return {
                ...event,
                status: 'LIVE',
                countdown: (
                    <div className="live-symbol-container">
                        <div className="live-symbol">LIVE</div>
                    </div>
                ),
            };
        } else if (daysDiff < 1) {
            const seconds = Math.floor(timeDiff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const countdown = `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
            return {
                ...event,
                status: 'COUNTDOWN',
                countdown: countdown,
            };
        } else {
            const daysLeft = Math.floor(daysDiff);
            return {
                ...event,
                status: 'UPCOMING',
                countdown: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`,
            };
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setIsLoading(true);

        const user = auth.currentUser;
        if (user) {
            await fetchData(user.uid);
        }

        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const toggleLike = (eventId) => {
        setLikedEvents((prev) =>
            prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
        );
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category]
        );
    };

    const handleEventClick = async (eventId, eventName) => {
        const user = auth.currentUser;
        if (!user) return;

        const userEmail = user.email;
        const studentRef = ref(database, `Users/Students/${user.uid}`);
        const collegeRepRef = ref(database, `Users/College/${user.uid}`);

        let role = null;

        await new Promise((resolve) => {
            onValue(
                studentRef,
                (snapshot) => {
                    const studentData = snapshot.val();
                    if (studentData && studentData.email === userEmail) {
                        role = 'student';
                    }
                    resolve();
                },
                { onlyOnce: true }
            );
        });

        if (!role) {
            await new Promise((resolve) => {
                onValue(
                    collegeRepRef,
                    (snapshot) => {
                        const collegeRepData = snapshot.val();
                        if (collegeRepData && collegeRepData.collegeEmail === userEmail) {
                            role = 'clg-representative';
                        }
                        resolve();
                    },
                    { onlyOnce: true }
                );
            });
        }

        if (role === 'student') {
            navigate(`/event/${eventId}`);
        } else if (role === 'clg-representative') {
            navigate(`/registration/${eventName}`);
        } else {
            console.error('Role not found for the current user.');
        }
    };

    const filteredEvents = events.filter(
        (event) =>
            event &&
            event.eventName &&
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );  

    useEffect(() => {
        if (filteredEvents.length === 0 && retryCount < MAX_RETRIES) {
            const timeout = setTimeout(() => {
                handleRefresh();
                setRetryCount((prev) => prev + 1);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [filteredEvents, retryCount]);

    return (
        <div className="event-page">
            <div className="event-filter-section">
                <input
                    className="event-search-input"
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="event-category-filter">
                    <button className="event-category-button">Filter</button>
                    <div className="event-category-dropdown">
                        {['workshop', 'seminar', 'webinar', 'conference'].map(category => (
                            <label key={category}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                />
                                {category}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="event-scrollable-wrapper">
                <div className="event-container">
                    {isLoading ? (
                        <div className="event-loading-animation">Loading...</div>
                    ) : filteredEvents.length > 0 ? (
                        filteredEvents.map(event => (
                            <div key={event.id} className="event-item-card">
                                <div className="event-heart-icon" onClick={() => toggleLike(event.id)}>
                                    {likedEvents.includes(event.id) ? (
                                        <FaHeart className="event-heart event-liked" />
                                    ) : (
                                        <FaRegHeart className="event-heart" />
                                    )}
                                </div>
                                <div className="event-image-container">
                                    <img src={event.thumbnail} alt={event.name} className="event-logo-img" />
                                </div>
                                <div className="event-info-container">
                                    <h3>{event.name}</h3>
                                    <p>{event.registered} Registered</p>
                                    <div className={`event-status ${event.status.toLowerCase()}`}>
                                        {event.status === 'COUNTDOWN' && event.countdown === '00:00:00'
                                            ? <div className="live-symbol-container">
                                                <div className="live-symbol">LIVE</div>
                                            </div>
                                            : event.countdown}
                                    </div>
                                    <span className="event-category-tag">{event.category}</span>
                                </div>
                                <div className="event-action-buttons">
                                    <FaArrowCircleRight
                                        className="event-arrow-icon"
                                        onClick={() => handleEventClick(event.id, event.name)}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No events found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Event;