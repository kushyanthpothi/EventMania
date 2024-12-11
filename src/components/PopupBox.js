import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig"; // Adjust path as per your file structure
import "./PopupBox.css";

const PopupBox = () => {
  const [events, setEvents] = useState([]);
  const [openPopups, setOpenPopups] = useState({});

  // Fetch data from Firebase
  useEffect(() => {
    const eventsRef = ref(database, "events/SuperAdmin");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const currentDate = new Date();
        const formattedEvents = Object.entries(data)
          .map(([eventName, eventData]) => {
            // Ensure eventData.date exists and is valid
            const eventDate = eventData.date ? new Date(eventData.date) : null;
            return eventDate && !isNaN(eventDate)
              ? {
                  eventName,
                  thumbnail: eventData.thumbnail,
                  eventDate,
                }
              : null;
          })
          .filter((event) => event && event.eventDate > currentDate); // Filter valid upcoming events

        setEvents(formattedEvents);
        setOpenPopups(
          formattedEvents.reduce((acc, event) => {
            acc[event.eventName] = true;
            return acc;
          }, {})
        );
      }
    });
  }, []);

  // Close individual popup
  const handleClosePopup = (eventName) => {
    setOpenPopups((prev) => ({
      ...prev,
      [eventName]: false,
    }));
  };

  return (
    <div className="popup-container">
      {events.map((event) =>
        openPopups[event.eventName] ? (
          <div key={event.eventName} className="popup-overlay">
            <div className="popup-box">
              <button
                className="popup-close-btn"
                onClick={() => handleClosePopup(event.eventName)}
              >
                ✖
              </button>
              <img
                src={event.thumbnail}
                alt={event.eventName}
                className="popup-image"
              />
              {/* <h3 className="popup-title">{event.eventName}</h3>
              <p className="popup-date">
                Event Date: {event.eventDate.toLocaleDateString()}
              </p> */}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default PopupBox;
