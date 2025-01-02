import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { database, auth } from './firebaseConfig';
import { ref, onValue, off } from 'firebase/database';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HomeEvents.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaRegClock } from 'react-icons/fa';

const HomeEvents = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [visibleEvents, setVisibleEvents] = useState(3);
  const navigate = useNavigate();
  const [collegeLogos, setCollegeLogos] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Authentication State Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Fetch Events from Firebase
  useEffect(() => {
    let collegeRef, eventsRef;

    const fetchCollegeLogosAndEvents = () => {
      setIsLoading(true);
      
      // Fetch College Logos
      collegeRef = ref(database, 'Users/College/');
      onValue(collegeRef, (snapshot) => {
        try {
          if (snapshot.exists()) {
            const logos = {};
            snapshot.forEach((userSnapshot) => {
              const collegeData = userSnapshot.val();
              if (collegeData.collegeName && collegeData.collegeLogo) {
                logos[collegeData.collegeName] = collegeData.collegeLogo;
              }
            });
            setCollegeLogos(logos);

            // Fetch Events after updating logos
            fetchEvents(logos);
          } else {
            console.warn('No college logos found');
            fetchEvents({});
          }
        } catch (error) {
          console.error('Error processing college logos:', error);
          toast.error("Error loading college information");
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Error fetching college logos:', error);
        toast.error("Failed to load college logos");
        setIsLoading(false);
      });
    };

    const fetchEvents = (logos) => {
      eventsRef = ref(database, 'events');
      onValue(eventsRef, (snapshot) => {
        try {
          const fetchedEvents = [];
          snapshot.forEach((collegeSnapshot) => {
            const collegeName = collegeSnapshot.key;
            collegeSnapshot.forEach((eventSnapshot) => {
              const eventData = eventSnapshot.val();
              if (!eventData.isCollegeEvent || eventData.isCollegeEvent === "false") {
                fetchedEvents.push({
                  ...eventData,
                  id: eventSnapshot.key,
                  collegeName: collegeName,
                  collegeLogo: logos[collegeName] || 'https://i.ibb.co/090FD9p/image.png',
                });
              }
            });
          });

          fetchedEvents.sort((a, b) => (a.isCollegeEvent === false ? -1 : 1));
          setEvents(fetchedEvents);
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing events:', error);
          toast.error("Error loading events");
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Error fetching events:', error);
        toast.error("Failed to load events");
        setIsLoading(false);
      });
    };

    fetchCollegeLogosAndEvents();

    // Cleanup function
    return () => {
      if (collegeRef) off(collegeRef);
      if (eventsRef) off(eventsRef);
    };
  }, []);

  // Memoized event click handler to view event details
  const handleEventClick = useCallback((event) => {
    if (!user) {
      toast.error("Please login to view event details", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    navigate(`/event/${encodeURIComponent(event.id)}`);
  }, [user, navigate]);

  // Memoized register handler
  const handleRegister = useCallback((event, e) => {
    // Prevent event bubbling to avoid triggering event details view
    e.stopPropagation();

    if (!user) {
      toast.error("Please login before registering", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    navigate(`/event/${encodeURIComponent(event.id)}`);
  }, [user, navigate]);

  // Handle Show More Button with safe increment
  const handleShowMore = useCallback(() => {
    setVisibleEvents((prevVisibleEvents) => 
      Math.min(prevVisibleEvents + 3, events.length)
    );
  }, [events.length]);

  // Render loading state
  if (isLoading) {
    return <div className="loading">Loading events...</div>;
  }

  // Render empty state
  if (events.length === 0) {
    return <div className="no-events">No events available</div>;
  }

  return (
    <div className="home-events">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="thumbnails">
        {events.slice(0, visibleEvents).map((event, index) => (
          <div
            key={event.id || index}
            className="thumbnail"
            onClick={() => handleEventClick(event)}
          >
            <div className="thumbnail-content">
              <img src={event.thumbnail} alt={event.name} />
              <div className="overlay">
                <div className="type">
                  {!event.category || event.category.trim() === ''
                    ? 'National Level'
                    : event.category}
                </div>
              </div>
            </div>
            <div className="info">
              <div className="title-and-type">
                <h3 className="title">{event.name}</h3>
              </div>
              <div className="details">
                <div className="detail">
                  <FaMapMarkerAlt />
                  <span
                    className={`location-text ${event.location.length > 9 ? 'small-text' : ''}`}
                  >
                    {event.location.length > 12
                      ? `${event.location.substring(0, 12)}...`
                      : event.location}
                  </span>
                </div>
                <div className="detail">
                  <FaCalendarAlt />
                  <span>{event.date}</span>
                </div>
                <div className="detail">
                  <FaRegClock />
                  <span>{event.time}</span>
                </div>
              </div>
              <div className="college">
                <img src={event.collegeLogo} alt="College Logo" />
                <span>Conducted by: {event.collegeName}</span>
              </div>
              <button
                className="register"
                onClick={(e) => handleRegister(event, e)}
              >
                Register
              </button>
            </div>
          </div>
        ))}
      </div>
      {visibleEvents < events.length && (
        <button
          className="see-more"
          onClick={handleShowMore}
        >
          See More
        </button>
      )}
    </div>
  );
};

export default HomeEvents;