import React, { useState, useEffect } from "react";
import { database } from "./firebaseConfig"; // Import Firebase database
import { ref, set } from "firebase/database";
import { uploadImageToImgbb } from "./imgbbUpload"; // Import the imgbb upload function
import "./SuperAdminEventCreation.css";

export const SuperAdminEventCreation = () => {
  const [event, setEvent] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
    thumbnail: "", // To store the uploaded image URL
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        const thumbnail = await uploadImageToImgbb(file); // Upload to imgbb
        setEvent((prevEvent) => ({ ...prevEvent, thumbnail })); // Set image URL
        setIsUploading(false);
        alert("Image uploaded successfully!");
      } catch (error) {
        setIsUploading(false);
        alert("Image upload failed.");
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const eventPath = `/events/SuperAdmin/${event.name}`; // Path in Firebase

    try {
      const eventRef = ref(database, eventPath);
      await set(eventRef, event); // Store the event data in Firebase
      alert("Event created successfully!");
      setEvent({
        name: "",
        date: "",
        time: "",
        location: "",
        description: "",
        thumbnail: "",
      });
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to create event.");
    }
  };

  // Check form validity whenever event data or upload status changes
  useEffect(() => {
    const { name, date, time, location, description, thumbnail } = event;
    setIsFormValid(name && date && time && location && description && thumbnail);
  }, [event]);

  return (
    <div className="super-admin-event-creation-container">
      <div className="super-admin-event-creation-wrapper">
        <h2 className="super-admin-event-creation-title">Create New Event</h2>
        <form onSubmit={handleSubmit} className="super-admin-event-creation-form">
          <div className="super-admin-event-creation-form-group">
            <label htmlFor="name" className="super-admin-event-creation-label">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={event.name}
              onChange={handleChange}
              required
              className="super-admin-event-creation-input"
            />
          </div>
          <div className="super-admin-event-creation-form-group">
            <label htmlFor="date" className="super-admin-event-creation-label">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={event.date}
              onChange={handleChange}
              required
              className="super-admin-event-creation-input"
            />
          </div>
          <div className="super-admin-event-creation-form-group">
            <label htmlFor="time" className="super-admin-event-creation-label">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={event.time}
              onChange={handleChange}
              required
              className="super-admin-event-creation-input"
            />
          </div>
          <div className="super-admin-event-creation-form-group">
            <label htmlFor="location" className="super-admin-event-creation-label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={event.location}
              onChange={handleChange}
              required
              className="super-admin-event-creation-input"
            />
          </div>
          <div className="super-admin-event-creation-form-group">
            <label htmlFor="description" className="super-admin-event-creation-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={event.description}
              onChange={handleChange}
              rows="4"
              className="super-admin-event-creation-textarea"
            ></textarea>
          </div>
          <div className="super-admin-event-creation-form-group" style={{ alignItems: "center" }}>
            <label htmlFor="thumbnail" className="super-admin-event-creation-label">Event Thumbnail</label>
            <div className="futuristic-photo-upload">
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={handleImageChange}
                className="super-admin-event-creation-input-file"
                disabled={isUploading} // Disable while uploading
              />
              <span className="futuristic-photo-label">
                {isUploading ? "Uploading..." : "Choose an image"}
              </span>
            </div>
          </div>
          <div className="super-admin-event-creation-form-group">
            <button
              type="submit"
              className="super-admin-event-creation-button"
              style={{ backgroundColor: isFormValid ? "red" : "grey" }}
              disabled={!isFormValid || isUploading}
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
