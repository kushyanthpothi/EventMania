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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
        });

        const user = auth.currentUser;
        if (user) {
          const userRef = ref(database, `Users/Students/${user.uid}/collegeName`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const collegeNameValue = snapshot.val();
            setCollegeName(collegeNameValue);
            const eventRef = ref(database, `events/${collegeNameValue}/${eventId}`);
            const eventSnapshot = await get(eventRef);
            if (eventSnapshot.exists()) {
              setEvent({ id: eventId, ...eventSnapshot.val() });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleRegister = () => {
    if (isChecked) {
      navigate(`/register/${eventId}`);
    } else {
      alert('Please accept the terms and conditions before registering.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!event) {
    return <div className="error">Event not found</div>;
  }

  return (
    <div className="description-container">
      <div className="event-details-container">
        <div className="description-event-image-container">
          <img src={event.thumbnail} alt={event.name} className="event-image" />
        </div>
        <div className="event-info">
          <h1 className="event-name">{event.name}</h1>
          <p className="event-date"><strong>Date:</strong> {event.date}</p>
          <p className="event-time"><strong>Time:</strong> {event.time}</p>
          <p className="event-category"><strong>Category:</strong> {event.category}</p>
        </div>
      </div>
      <div className="event-description-container">
        <h2>Description</h2>
        <div className="description-content">
          <p>{event.description}</p>
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
        <button onClick={handleRegister} className="register-button">
          Register for Event
        </button>
      </div>
    </div>
  );
};

export default Description;