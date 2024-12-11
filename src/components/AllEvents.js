import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaArrowCircleRight } from 'react-icons/fa';
import { auth, database } from '../components/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Event.css';

function AllEvents() {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedEvents, setLikedEvents] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const MAX_RETRIES = 3;

    useEffect(() => {
        fetchAllEvents();
        // Update current time every second for real-time countdown
        const interval = setInterval(() => {
            setEvents(prevEvents =>
                prevEvents.map(event => {
                    const eventDateTime = new Date(`${event.date}T${event.time}`);
                    const currentTime = new Date();
                    const timeDiff = eventDateTime - currentTime;
                    const daysLeft = Math.floor(timeDiff / (1000 * 3600 * 24));

                    return {
                        ...event,
                        eventDateTime,
                        daysLeft,
                        timeDiff,
                        isCompleted: timeDiff < 0,
                        isLive: timeDiff <= 0 && timeDiff > -3600000, // Live if within 1 hour
                    };
                })
            );
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const fetchRegistrationCount = (collegeName, eventName) => {
        return new Promise((resolve) => {
            const registrationsRef = ref(database, `registrations/${collegeName}/${eventName}`);
            onValue(registrationsRef, (snapshot) => {
                const registrationData = snapshot.val();
                const count = registrationData ? Object.keys(registrationData).length : 0;
                resolve(count);
            }, {
                onlyOnce: true
            });
        });
    };

    const fetchAllEvents = () => {
        const eventsRef = ref(database, 'events');

        onValue(eventsRef, async (snapshot) => {
            const eventData = snapshot.val();
            if (eventData) {
                const eventsPromises = [];
                Object.keys(eventData).forEach(collegeName => {
                    Object.keys(eventData[collegeName]).forEach(eventName => {
                        const eventDetails = eventData[collegeName][eventName];
                        const eventDateTime = new Date(`${eventDetails.date}T${eventDetails.time}`);
                        const currentTime = new Date();
                        const timeDiff = eventDateTime - currentTime;
                        const daysLeft = Math.floor(timeDiff / (1000 * 3600 * 24));

                        // Create a promise that resolves with the complete event object including registration count
                        const eventPromise = fetchRegistrationCount(collegeName, eventName)
                            .then(registrationCount => ({
                                id: `${collegeName}_${eventName}`,
                                collegeName,
                                ...eventDetails,
                                registered: registrationCount, // Add registration count
                                eventDateTime,
                                daysLeft,
                                timeDiff,
                                isCompleted: timeDiff < 0,
                                isLive: timeDiff <= 0 && timeDiff > -3600000
                            }));

                        eventsPromises.push(eventPromise);
                    });
                });

                // Wait for all registration counts to be fetched
                const eventsArray = await Promise.all(eventsPromises);
                setEvents(eventsArray);
                setRetryCount(0);
                setIsLoading(false);
            } else {
                setEvents([]);
                setIsLoading(false);
                if (retryCount < MAX_RETRIES) {
                    setTimeout(() => {
                        handleRefresh();
                        setRetryCount(prev => prev + 1);
                    }, 2000);
                }
            }
        });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setIsLoading(true);
        try {
            await fetchAllEvents();
            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
        } catch (error) {
            console.error('Error refreshing events:', error);
            setIsRefreshing(false);
        }
    };

    const toggleLike = (eventId) => {
        setLikedEvents(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        );
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(cat => cat !== category)
                : [...prev, category]
        );
    };

    const calculateCountdown = (timeDiff) => {
        const hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
        const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const filteredEvents = events.filter(event => {
        return (
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (selectedCategories.length === 0 || selectedCategories.includes(event.category))
        );
    });

    useEffect(() => {
        if (filteredEvents.length === 0 && retryCount < MAX_RETRIES) {
            const timeout = setTimeout(() => {
                handleRefresh();
                setRetryCount(prev => prev + 1);
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
                                    {event.isLive ? (
                                        <div className="live-symbol-container">
                                            <div className="live-symbol">LIVE</div>
                                        </div>
                                    ) : event.isCompleted ? (
                                        <div className="completed-symbol-container">
                                            <div className="completed-symbol">COMPLETED</div>
                                        </div>
                                    ) : event.daysLeft < 1 && event.timeDiff > 0 ? (
                                        <p>{calculateCountdown(event.timeDiff)} left</p>
                                    ) : (
                                        <p>{event.daysLeft} days left</p>
                                    )}
                                    <span className="event-category-tag">{event.category}</span>
                                    <p>College: {event.collegeName}</p>
                                </div>
                                <div className="event-action-buttons">
                                    <FaArrowCircleRight className="event-arrow-icon" />
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

export default AllEvents;