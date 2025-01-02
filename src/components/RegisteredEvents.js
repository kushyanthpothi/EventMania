import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database, auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import './RegisteredEvents.css';

const RegisteredEvents = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      if (user) {
        fetchRegisteredEvents(user);
      } else {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const fetchRegisteredEvents = async (user) => {
    try {
      // Fetch user details
      const userRef = ref(database, `Users/Students/${user.uid}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const { collegeName, email } = userData;

        // Fetch all registrations for the college
        const registrationsRef = ref(database, `registrations/${collegeName}`);
        const registrationsSnapshot = await get(registrationsRef);

        if (registrationsSnapshot.exists()) {
          const registrations = registrationsSnapshot.val();
          const userEvents = [];

          // Check each event's registrations
          for (const [eventName, eventRegistrations] of Object.entries(registrations)) {
            for (const [rollNumber, registrationData] of Object.entries(eventRegistrations)) {
              if (registrationData.email === email) {
                // Fetch event details
                const eventRef = ref(database, `events/${collegeName}/${eventName}`);
                const eventSnapshot = await get(eventRef);
                if (eventSnapshot.exists()) {
                  const eventData = eventSnapshot.val();
                  userEvents.push({
                    name: eventName,
                    ...eventData,
                    registrationDetails: registrationData
                  });
                }
                break; // Break inner loop once we find the user's registration
              }
            }
          }

          setRegisteredEvents(userEvents);
        }
      }
    } catch (error) {
      console.error("Error fetching registered events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading until auth state is checked
  if (!authChecked) {
    return <div className="loading">Initializing...</div>;
  }

  // Show loading while fetching data
  if (loading) {
    return <div className="loading">Loading your registered events...</div>;
  }

  // Show login message if not authenticated
  if (!auth.currentUser) {
    return <div className="loading">Please log in to view your registered events.</div>;
  }

  return (
    <div className="registered-events-container">
      <h1>Your Registered Events</h1>
      {registeredEvents.length === 0 ? (
        <p className="no-events">You haven't registered for any events yet.</p>
      ) : (
        <div className="events-grid">
          {registeredEvents.map((event, index) => (
            <div key={index} className="event-card">
              <img src={event.thumbnail} alt={event.name} className="event-thumbnail" />
              <div className="event-details">
                <h2>{event.name}</h2>
                <p className="event-date"><strong>Date : </strong>{formatDate(event.date)}</p>
                <p className="event-time"><strong>Time : </strong>{event.time}</p>
                <p className="event-category"><strong>Category : </strong>{event.category}</p>
              </div>
              <div className="registration-details">
                <h3>Your Registration</h3>
                <p>Roll Number: {event.registrationDetails.rollNumber}</p>
                <p>Branch: {event.registrationDetails.branch}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};  

export default RegisteredEvents;