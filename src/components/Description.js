import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database, auth } from '../components/firebaseConfig';
import './Description.css';

const Description = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Decode the URL-encoded eventId
        const decodedEventId = decodeURIComponent(eventId);
  
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
        });
  
        const user = auth.currentUser;
        if (user) {
          // Comprehensive event search across all colleges and SuperAdmin
          const collegesRef = ref(database, 'events');
          const collegesSnapshot = await get(collegesRef);
  
          if (collegesSnapshot.exists()) {
            let foundEvent = null;
  
            // Iterate through all colleges
            collegesSnapshot.forEach((collegeSnapshot) => {
              const collegeName = collegeSnapshot.key;
              
              // Check if event exists in this college's events
              const eventInCollegeRef = ref(database, `events/${collegeName}/${decodedEventId}`);
              const eventSnapshot = collegeSnapshot.child(decodedEventId);
  
              if (eventSnapshot.exists()) {
                foundEvent = {
                  id: decodedEventId,
                  collegeName: collegeName,
                  ...eventSnapshot.val()
                };
              }
            });
  
            if (foundEvent) {
              setEvent(foundEvent);
              setCollegeName(foundEvent.collegeName);
            } else {
              setError('Event not found in any college');
              console.log('Event ID searched:', decodedEventId);
            }
          } else {
            setError('No events found in database');
          }
        } else {
          setError('Please login to view event details');
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [eventId]);

  const handleRegister = () => {
    if (isChecked) {
      // Use encoded event ID for navigation to maintain consistency
      navigate(`/register/${encodeURIComponent(event.id)}`);
    } else {
      alert('Please accept the terms and conditions before registering.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!event) {
    return <div className="error">Event not found</div>;
  }

  return (
    <div className="description-container">
      <div className="event-details-container">
        <div className="description-event-image-container">
          <img 
            src={event.thumbnail || '/placeholder-image.jpg'} 
            alt={event.name} 
            className="event-image" 
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
        <div className="event-info">
          <h1 className="event-name">{event.name}</h1>
          <p className="event-date"><strong>Date:</strong> {event.date}</p>
          <p className="event-time"><strong>Time:</strong> {event.time}</p>
          <p className="event-category"><strong>Category:</strong> {event.category || 'Uncategorized'}</p>
        </div>
      </div>
      <div className="event-description-container">
        <h2>Description</h2>
        <div className="description-content">
          <p>{event.description || 'No description available.'}</p>
        </div>
        <div className="terms-container">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <span className="checkmark"></span>
            I have read and accept all terms and conditions
          </label>
        </div>
        <button 
          onClick={handleRegister} 
          className="register-button"
          disabled={!isChecked}
        >
          Register for Event
        </button>
      </div>
    </div>
  );
};

export default Description;