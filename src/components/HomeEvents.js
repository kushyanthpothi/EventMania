import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database, auth } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HomeEvents.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaRegClock } from 'react-icons/fa';

const HomeEvents = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [visibleEvents, setVisibleEvents] = useState(3);
  const navigate = useNavigate();
  // eslint-disable-next-line
  const [collegeLogos, setCollegeLogos] = useState({});



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
    const fetchCollegeLogosAndEvents = () => {
      // Fetch College Logos
      const collegeRef = ref(database, 'Users/College/');
      onValue(collegeRef, (snapshot) => {
        if (snapshot.exists()) {
          const logos = {};
          snapshot.forEach((userSnapshot) => {
            const collegeData = userSnapshot.val();
            if (collegeData.collegeName && collegeData.collegeLogo) {
              logos[collegeData.collegeName] = collegeData.collegeLogo;
            }
          });
          setCollegeLogos(logos); // Update logos

          // Fetch Events after updating logos
          fetchEvents(logos);
        } else {
          console.error('No college logos found');
        }
      });
    };

    const fetchEvents = (logos) => {
      const eventsRef = ref(database, 'events');
      onValue(eventsRef, (snapshot) => {
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
                collegeLogo: logos[collegeName] || 'https://i.ibb.co/090FD9p/image.png', // Use logos from fetched data
              });
            }
          });
        });
        fetchedEvents.sort((a, b) => (a.isCollegeEvent === false ? -1 : 1));
        setEvents(fetchedEvents); // Update events
      }, (error) => {
        console.error('Error fetching events:', error);
        toast.error("Failed to load events");
      });
    };

    fetchCollegeLogosAndEvents(); // Execute the combined function
  }, []);


  // Handle Event Click (Navigate to Description)
  const handleEventClick = (event) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to view event details", {
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

    // Create URL-friendly event name
    // eslint-disable-next-line
    const eventUrlName = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric characters with hyphens
      .replace(/^-+|-+$/g, '');  // Remove leading and trailing hyphens

    // Navigate to event description page
    navigate(`/event/${encodeURIComponent(event.id)}`);
  };

  // Handle Register Button Click
  const handleRegister = (event) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login before registering", {
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

    // Create URL-friendly event name for registration
    // eslint-disable-next-line
    const eventUrlName = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Navigate to registration page
    navigate(`/event/${encodeURIComponent(event.id)}`);
  };

  // Handle Show More Button
  const handleShowMore = () => {
    setVisibleEvents(prevVisibleEvents => prevVisibleEvents + 3);
  };

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
            key={index}
            className="thumbnail"
            
          >
            <div className="thumbnail-content">
              <img src={event.thumbnail} alt={event.title} />
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
                onClick={(e) => {
                  e.stopPropagation(); // Prevent thumbnail click when registering
                  handleRegister(event);
                }}
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