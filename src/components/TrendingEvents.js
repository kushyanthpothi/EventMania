import React, { useState, useEffect } from 'react';
import { FaArrowCircleRight } from 'react-icons/fa';
import { database, auth } from '../components/firebaseConfig';
import { ref, onValue, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TrendingEvents.css';

function TrendingEvents() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCollege, setUserCollege] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userRef = ref(database, `Users/Students/${user.uid}`);
                    const snapshot = await get(userRef);
                    const userData = snapshot.val();
                    
                    if (userData && userData.collegeName) {
                        setUserCollege(userData.collegeName);
                        fetchTrendingEvents();
                    } else {
                        setError('College information not found');
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setError('Failed to fetch user information');
                    setIsLoading(false);
                }
            } else {
                setError('Please login to view events');
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchTrendingEvents = () => {
        const eventsRef = ref(database, 'events/SuperAdmin');

        onValue(eventsRef, (snapshot) => {
            try {
                const eventData = snapshot.val();
                if (eventData) {
                    const eventsArray = Object.entries(eventData).map(([eventName, details]) => {
                        if (!details || !details.date || !details.time) return null;

                        const eventDateTime = new Date(`${details.date}T${details.time}`);
                        const currentTime = new Date();
                        const timeDiff = eventDateTime - currentTime;
                        const daysLeft = Math.floor(timeDiff / (1000 * 3600 * 24));

                        return {
                            id: eventName,
                            eventName,
                            ...details,
                            eventDateTime,
                            daysLeft,
                            timeDiff,
                            isCompleted: timeDiff < 0,
                            isLive: timeDiff <= 0 && timeDiff > -3600000
                        };
                    }).filter(event => event !== null);

                    setEvents(eventsArray);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error('Error processing events:', error);
                setError('Failed to load events');
            } finally {
                setIsLoading(false);
            }
        }, (error) => {
            console.error('Error fetching events:', error);
            setError('Failed to load events');
            setIsLoading(false);
        });
    };

    const calculateCountdown = (timeDiff) => {
        if (!timeDiff || isNaN(timeDiff)) return '0h 0m 0s';
        
        const hours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
        const minutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handleNavigateToEvent = (event) => {
        if (!event.eventName) return;

        // Check if event is completed before navigating
        if (event.isCompleted) {
            toast.error('Event has ended', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        navigate(`/event/${event.eventName}`);
    };

    if (error) {
        return (
            <div className="trending-events-page">
                <div className="error-message">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="trending-events-page">
            <ToastContainer />
            <h2 className="trending-events-title">Trending Events</h2>
            
            <div className="trending-events-container">
                {isLoading ? (
                    <div className="trending-events-loading">Loading...</div>
                ) : events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} className="trending-events-card">
                            <div className="trending-events-image-container">
                                <img 
                                    src={event.thumbnail || '/placeholder-image.jpg'} 
                                    alt={event.name || 'Event'} 
                                    className="trending-events-thumbnail"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                                {event.isLive ? (
                                    <div className="live-badge">LIVE</div>
                                ) : event.isCompleted ? (
                                    <div className="completed-badge">COMPLETED</div>
                                ) : event.daysLeft < 1 && event.timeDiff > 0 ? (
                                    <div className="countdown-badge">
                                        {calculateCountdown(event.timeDiff)}
                                    </div>
                                ) : null}
                            </div>
                            
                            <div className="trending-events-content">
                                <h3 className="trending-events-name">{event.name || 'Unnamed Event'}</h3>
                                <div className="trending-events-details">
                                    <p className="trending-events-location">
                                        📍 {event.location || 'Location TBA'}
                                    </p>
                                    <p className="trending-events-time">
                                        🕒 {event.isCompleted ? 'Event Ended' : 
                                            event.isLive ? 'Live Now' : 
                                            `${event.daysLeft} days left`}
                                    </p>
                                </div>
                                
                                <div 
                                    className="trending-events-arrow-button"
                                    onClick={() => handleNavigateToEvent(event)}
                                >
                                    <FaArrowCircleRight />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="trending-events-empty">No trending events available.</p>
                )}
            </div>
        </div>
    );
}

export default TrendingEvents;