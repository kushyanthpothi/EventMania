import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaArrowCircleRight } from 'react-icons/fa';
import { auth, database } from '../components/firebaseConfig';
import { ref, onValue, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './Event.css';

function CollegeEvents() {
    const [searchQuery, setSearchQuery] = useState('');
    const [likedEvents, setLikedEvents] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCollege, setUserCollege] = useState('');
    const [authChecked, setAuthChecked] = useState(false);

    const navigate = useNavigate();

    // Auth state monitoring
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserCollege(user.uid);
            } else {
                setIsLoading(false);
                setError('Please login to view events');
                setAuthChecked(true);
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch user's college details
    const fetchUserCollege = async (userId) => {
        try {
            const userRef = ref(database, `Users/College/${userId}`);
            const snapshot = await get(userRef);
            const userData = snapshot.val();
            
            if (userData && userData.collegeName) {
                setUserCollege(userData.collegeName);
                setAuthChecked(true);
            } else {
                setError('College information not found');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error fetching user college:', error);
            setError('Failed to fetch college information');
            setIsLoading(false);
        }
    };

    // Fetch registration count safely
    const fetchRegistrationCount = async (collegeName, eventName) => {
        if (!collegeName || !eventName) return 0;
        
        try {
            const registrationsRef = ref(database, `registrations/${collegeName}/${eventName}`);
            const snapshot = await get(registrationsRef);
            const registrationData = snapshot.val();
            return registrationData ? Object.keys(registrationData).length : 0;
        } catch (error) {
            console.error('Error fetching registration count:', error);
            return 0;
        }
    };

    // Main events fetching logic
    useEffect(() => {
        let eventsUnsubscribe;

        if (authChecked && userCollege) {
            setIsLoading(true);
            setError(null);

            const eventsRef = ref(database, `events/${userCollege}`);
            
            eventsUnsubscribe = onValue(
                eventsRef,
                async (snapshot) => {
                    try {
                        const eventData = snapshot.val();
                        if (eventData) {
                            const processedEvents = await Promise.all(
                                Object.entries(eventData).map(async ([eventName, details]) => {
                                    if (!details || !details.date || !details.time) {
                                        return null;
                                    }

                                    try {
                                        const eventDateTime = new Date(`${details.date}T${details.time}`);
                                        const currentTime = new Date();
                                        const timeDiff = eventDateTime - currentTime;
                                        const daysLeft = Math.floor(timeDiff / (1000 * 3600 * 24));
                                        
                                        const registrationCount = await fetchRegistrationCount(userCollege, eventName);
                                        
                                        return {
                                            id: `${userCollege}_${eventName}`,
                                            collegeName: userCollege,
                                            eventName,
                                            ...details,
                                            registered: registrationCount,
                                            eventDateTime,
                                            daysLeft,
                                            timeDiff,
                                            isCompleted: timeDiff < 0,
                                            isLive: timeDiff <= 0 && timeDiff > -3600000
                                        };
                                    } catch (error) {
                                        console.error(`Error processing event ${eventName}:`, error);
                                        return null;
                                    }
                                })
                            );

                            // Filter out any null events from processing errors
                            const validEvents = processedEvents.filter(event => event !== null);
                            setEvents(validEvents);
                        } else {
                            setEvents([]);
                        }
                    } catch (error) {
                        console.error('Error processing events:', error);
                        setError('Failed to load events');
                    } finally {
                        setIsLoading(false);
                    }
                },
                (error) => {
                    console.error('Error fetching events:', error);
                    setError('Failed to load events');
                    setIsLoading(false);
                }
            );
        }

        return () => {
            if (eventsUnsubscribe) {
                eventsUnsubscribe();
            }
        };
    }, [userCollege, authChecked]);

    const handleRefresh = async () => {
        if (!isRefreshing && userCollege) {
            setIsRefreshing(true);
            setIsLoading(true);
            setError(null);

            try {
                const eventsRef = ref(database, `events/${userCollege}`);
                const snapshot = await get(eventsRef);
                const eventData = snapshot.val();
                
                if (eventData) {
                    const processedEvents = await Promise.all(
                        Object.entries(eventData).map(async ([eventName, details]) => {
                            if (!details || !details.date || !details.time) return null;

                            try {
                                const eventDateTime = new Date(`${details.date}T${details.time}`);
                                const currentTime = new Date();
                                const timeDiff = eventDateTime - currentTime;
                                const daysLeft = Math.floor(timeDiff / (1000 * 3600 * 24));
                                
                                const registrationCount = await fetchRegistrationCount(userCollege, eventName);
                                
                                return {
                                    id: `${userCollege}_${eventName}`,
                                    collegeName: userCollege,
                                    eventName,
                                    ...details,
                                    registered: registrationCount,
                                    eventDateTime,
                                    daysLeft,
                                    timeDiff,
                                    isCompleted: timeDiff < 0,
                                    isLive: timeDiff <= 0 && timeDiff > -3600000
                                };
                            } catch (error) {
                                console.error(`Error processing event ${eventName}:`, error);
                                return null;
                            }
                        })
                    );

                    const validEvents = processedEvents.filter(event => event !== null);
                    setEvents(validEvents);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error('Error refreshing events:', error);
                setError('Failed to refresh events');
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }
    };

    const toggleLike = (eventId) => {
        if (!eventId) return;
        setLikedEvents(prev =>
            prev.includes(eventId)
                ? prev.filter(id => id !== eventId)
                : [...prev, eventId]
        );
    };

    const handleCategoryChange = (category) => {
        if (!category) return;
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(cat => cat !== category)
                : [...prev, category]
        );
    };

    const calculateCountdown = (timeDiff) => {
        if (!timeDiff || isNaN(timeDiff)) return '0h 0m 0s';
        
        const hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
        const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Safe filtering of events
    const filteredEvents = events.filter(event => {
        if (!event || !event.name) return false;
        
        const nameMatch = event.name.toLowerCase().includes((searchQuery || '').toLowerCase());
        const categoryMatch = selectedCategories.length === 0 || 
            (event.category && selectedCategories.includes(event.category));
        
        return nameMatch && categoryMatch;
    });

    const handleNavigateToRegistration = (eventName) => {
        if (!eventName) return;
        navigate(`/registration/${encodeURIComponent(eventName)}`)
    };

    if (error) {
        return (
            <div className="event-page">
                <div className="error-message">
                    {error}
                    {error !== 'Please login to view events' && (
                        <button 
                            className="retry-button"
                            onClick={handleRefresh} 
                            disabled={isRefreshing}
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

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
                    ) : filteredEvents && filteredEvents.length > 0 ? (
                        filteredEvents.map(event => {
                            if (!event || !event.id) return null;
                            
                            return (
                                <div key={event.id} className="event-item-card">
                                    <div className="event-heart-icon" onClick={() => toggleLike(event.id)}>
                                        {likedEvents.includes(event.id) ? (
                                            <FaHeart className="event-heart event-liked" />
                                        ) : (
                                            <FaRegHeart className="event-heart" />
                                        )}
                                    </div>
                                    <div className="event-image-container">
                                        <img 
                                            src={event.thumbnail || '/placeholder-image.jpg'} 
                                            alt={event.name || 'Event'} 
                                            className="event-logo-img"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className="event-info-container">
                                        <h3>{event.name || 'Unnamed Event'}</h3>
                                        <p>{(event.registered || 0)} Registered</p>
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
                                            <p>{event.daysLeft || 0} days left</p>
                                        )}
                                        <span className="event-category-tag">
                                            {event.category || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <div 
                                        className="event-action-buttons" 
                                        onClick={() => handleNavigateToRegistration(event.eventName)}
                                    >
                                        <FaArrowCircleRight className="event-arrow-icon" />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No events found for your college.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CollegeEvents;