import React, { useState, useEffect, useRef } from 'react';
import { ref, set, get, remove, update } from 'firebase/database';
import { database, auth } from './firebaseConfig';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import './EventCreation.css';

const EventCreation = () => {
  const [view, setView] = useState('creation');
  const [editMode, setEditMode] = useState(false);
  const [originalEventName, setOriginalEventName] = useState(null);
  const [eventData, setEventData] = useState({
    eventName: '',
    eventCategory: '',
    eventDate: '',
    eventTime: '',
    location: '',
    description: '',
    thumbnail: null,
    isCollegeEvent: true,
    hasTeamLeader: false,
    teamCount: ''
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collegeName, setCollegeName] = useState(null);
  const imgbbApiKey = '24a158e16943c30a375e4a1d261051a8';

  // Fetch college name on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchCollegeName(user.uid);
      } else {
        setCollegeName(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch events when college name is available
  useEffect(() => {
    if (collegeName) {
      fetchEvents();
    }
  }, [collegeName]);

  const fetchCollegeName = async (userId) => {
    const userRef = ref(database, `Users/College/${userId}/collegeName`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const collegeNameValue = snapshot.val();
        setCollegeName(collegeNameValue);
      } else {
        console.error('College name not found for the current user');
      }
    } catch (error) {
      console.error('Error fetching college name:', error);
    }
  };

  const fetchEvents = async () => {
    if (collegeName) {
      const eventsRef = ref(database, `events/${collegeName}`);
      const requestsRef = ref(database, `AdminEventRequest/${collegeName}`);
      try {
        setLoading(true);
        const [eventsSnapshot, requestsSnapshot] = await Promise.all([
          get(eventsRef),
          get(requestsRef),
        ]);
        const eventsData = eventsSnapshot.exists() ? eventsSnapshot.val() : {};
        const requestsData = requestsSnapshot.exists() ? requestsSnapshot.val() : {};
  
        const eventsArray = [
          ...Object.keys(eventsData).map((eventKey) => ({
            id: eventKey,
            ...eventsData[eventKey],
            canEdit: true,
          })),
          // Only include requests that are still pending
          ...Object.keys(requestsData)
            .filter(requestKey => requestsData[requestKey].status === 'pending')
            .map((requestKey) => ({
              id: requestKey,
              ...requestsData[requestKey],
              canEdit: false,
            })),
        ];
        setEvents(eventsArray);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleThumbnailUpload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, formData);
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === 'hasTeamLeader') {
      setEventData(prev => ({
        ...prev,
        hasTeamLeader: checked,
        // Clear team leader contact if switch is turned off
        teamCount: checked ? prev.teamCount : ''
      }));
      return;
    }

    if (name === 'teamCount') {
      // Only allow numbers and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setEventData(prev => ({
        ...prev,
        teamCount: numericValue
      }));
      return;
    }

    setEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        type === 'file' ? files[0] : value
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!collegeName) {
        throw new Error('College name is not set');
      }

      if (editMode) {
        await handleEditSubmit();
        return;
      }

      const thumbnailUrl = await handleThumbnailUpload(eventData.thumbnail);
      const newEvent = {
        name: eventData.eventName,
        category: eventData.eventCategory,
        date: eventData.eventDate,
        time: eventData.eventTime,
        location: eventData.location,
        thumbnail: thumbnailUrl,
        description: eventData.description,
        isCollegeEvent: eventData.isCollegeEvent,
        status: eventData.isCollegeEvent ? 'approved' : 'pending',
        ...(eventData.isCollegeEvent ? {} : { collegeName }),
        ...(eventData.hasTeamLeader ? {
          teamCount: eventData.teamCount
        } : {})
      };
      const eventPath = eventData.isCollegeEvent
        ? `events/${collegeName}/${eventData.eventName}`
        : `AdminEventRequest/${collegeName}/${eventData.eventName}`;
      const eventRef = ref(database, eventPath);

      await set(eventRef, newEvent);
      fetchEvents();
      if (eventData.isCollegeEvent) {
        toast.success('Event created and published!');
      } else {
        toast.success('Event request sent to admin!');
      }
      // Reset form after successful creation
      resetForm();
      setEventData({
        eventName: '',
        eventCategory: '',
        eventDate: '',
        eventTime: '',
        location: '',
        description: '',
        thumbnail: null,
        isCollegeEvent: true,
        hasTeamLeader: false,
        teamCount: ''
      });
    } catch (error) {
      console.error('Failed to create event:', error.message);
      toast.error(`Failed to create event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      let thumbnailUrl = null;
  
      if (eventData.thumbnail instanceof File) {
        thumbnailUrl = await handleThumbnailUpload(eventData.thumbnail);
      }
  
      const updatedEvent = {
        name: eventData.eventName,
        category: eventData.eventCategory,
        date: eventData.eventDate,
        time: eventData.eventTime,
        location: eventData.location,
        thumbnail: thumbnailUrl || events.find(event => event.name === originalEventName)?.thumbnail,
        description: eventData.description,
        isCollegeEvent: eventData.isCollegeEvent,
        status: eventData.isCollegeEvent ? 'approved' : 'pending',
        ...(eventData.isCollegeEvent ? {} : { collegeName }),
        ...(eventData.hasTeamLeader ? {
          teamCount: eventData.teamCount
        } : {})
      };
  
      // If it's a college event or was approved from a request
      if (eventData.isCollegeEvent) {
        // Remove from AdminEventRequest if it exists
        const requestRef = ref(database, `AdminEventRequest/${collegeName}/${originalEventName}`);
        await remove(requestRef);
      }
  
      const eventPath = `events/${collegeName}/${eventData.eventName}`;
      const eventRef = ref(database, eventPath);
      await set(eventRef, updatedEvent);
  
      fetchEvents();
      toast.success('Event updated successfully!');
      resetForm();
      setView('events');
    } catch (error) {
      console.error('Failed to update event:', error.message);
      toast.error(`Failed to update event: ${error.message}`);
    }
  };

  const renderEventNameInput = () => {
    return (
      <motion.div
        className="form-group"
        whileFocus={{ scale: 1.02 }}
      >
        <input
          type="text"
          name="eventName"
          placeholder="Event Name"
          value={eventData.eventName}
          onChange={handleInputChange}
          required
          readOnly={editMode}  // Add this line to make it read-only in edit mode
          className={editMode ? 'read-only-input' : ''}  // Optional: add a style for read-only state
        />
        {editMode && (
          <small className="edit-name-note">
            Event name cannot be changed after creation
          </small>
        )}
      </motion.div>
    );
  };

  const handleDeleteEvent = async (eventNameToDelete) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
    if (confirmDelete) {
      try {
        const eventRef = ref(database, `events/${collegeName}/${eventNameToDelete}`);
        await remove(eventRef);
        fetchEvents();
        toast.success('Event deleted successfully!');
      } catch (error) {
        console.error('Failed to delete event:', error.message);
        toast.error(`Failed to delete event: ${error.message}`);
      }
    }
  };

  const handleEditEvent = (event) => {
    setEditMode(true);
    setOriginalEventName(event.name);
    setEventData({
      eventName: event.name,
      eventCategory: event.category,
      eventDate: event.date,
      eventTime: event.time,
      location: event.location || '',
      description: event.description,
      isCollegeEvent: event.isCollegeEvent ?? false,
      thumbnail: null,
      hasTeamLeader: !!event.teamCount,
      teamCount: event.teamCount || ''
    });
    setView('creation');
  };

  const handleCancelEdit = () => {
    resetForm();
    setView('events');
  };

  const resetForm = () => {
    setEventData({
      eventName: '',
      eventCategory: '',
      eventDate: '',
      eventTime: '',
      location: '',
      description: '',
      thumbnail: null,
      isCollegeEvent: true,
      hasTeamLeader: false,
      teamCount: ''
    });
    setEditMode(false);
    setOriginalEventName(null);
  };


  const renderSubmitButton = () => {
    if (editMode) {
      return (
        <div className="edit-buttons">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Event'}
          </motion.button>
          <motion.button
            type="button"
            onClick={handleCancelEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cancel-button"
          >
            Cancel
          </motion.button>
        </div>
      );
    }
    return (
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Event'}
      </motion.button>
    );
  };

  const renderThumbnailInput = () => {
    if (editMode) {
      return (
        <div className="form-row">
          <motion.div
            className="form-group file"
            whileFocus={{ scale: 1.02 }}
          >
            <input
              type="file"
              name="thumbnail"
              onChange={handleInputChange}
              accept="image/*"
              placeholder="Optional: Change thumbnail"
            />
            <small>Leave blank to keep existing thumbnail</small>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="form-row">
        <motion.div
          className="form-group file"
          whileFocus={{ scale: 1.02 }}
        >
          <input
            type="file"
            name="thumbnail"
            onChange={handleInputChange}
            accept="image/*"
            required
          />
        </motion.div>
      </div>
    );
  };

  const toggleView = () => {
    setView(prev => prev === 'creation' ? 'events' : 'creation');
  };

  const pageVariants = {
    initial: {
      rotateY: 90,
      opacity: 0
    },
    in: {
      rotateY: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    out: {
      rotateY: -90,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="modern-event-container">
      <div className="view-toggle">
        <motion.button
          onClick={toggleView}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flip-button"
        >
          {view === 'creation' ? '➡️ View Events' : '⬅️ Create Event'}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'creation' ? (
          <motion.div
            key="creation"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="event-creation-view"
          >
            <div className="modern-form-container">
              <motion.form
                onSubmit={handleCreateEvent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2>{editMode ? 'Edit Event' : 'Create New Event'}</h2>

                {renderEventNameInput()}

                <motion.div
                  className="form-group"
                  whileFocus={{ scale: 1.02 }}
                >
                  <select
                    name="eventCategory"
                    value={eventData.eventCategory}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="webinar">Webinar</option>
                    <option value="conference">Conference</option>
                  </select>
                </motion.div>

                <div className="form-row side-by-side">
                  <motion.div
                    className="form-group half"
                    whileFocus={{ scale: 1.02 }}
                  >
                    {/* <label htmlFor="eventDate">Date</label> */}
                    <input
                      type="date"
                      name="eventDate"
                      id="eventDate"
                      value={eventData.eventDate}
                      onChange={handleInputChange}
                      required
                    />
                  </motion.div>
                  <motion.div
                    className="form-group half"
                    whileFocus={{ scale: 1.02 }}
                  >
                    {/* <label htmlFor="eventTime">Time</label> */}
                    <input
                      type="time"
                      name="eventTime"
                      id="eventTime"
                      value={eventData.eventTime}
                      onChange={handleInputChange}
                      required
                    />
                  </motion.div>
                </div>


                <motion.div
                  className="form-group"
                  whileFocus={{ scale: 1.02 }}
                >
                  <input
                    type="text"
                    name="location"
                    placeholder="Event Location"
                    value={eventData.location}
                    onChange={handleInputChange}
                    required
                  />
                </motion.div>

                <motion.div
                  className="form-group"
                  whileFocus={{ scale: 1.02 }}
                >
                  <textarea
                    name="description"
                    placeholder="Event Description"
                    value={eventData.description}
                    onChange={handleInputChange}
                    required
                  />
                </motion.div>

                <div className="form-row toggle-switches">
                  <div className="form-group checkbox-container">
                    <label className="form-group switch-container">
                      <span>College Event</span>
                      <input
                        type="checkbox"
                        name="isCollegeEvent"
                        id="collegeEvent"
                        checked={eventData.isCollegeEvent}
                        onChange={handleInputChange}
                        className="switch-input"
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                    <div className="form-group checkbox-container">
                      <label className="form-group switch-container">
                        <span>Teams</span>
                        <input
                          type="checkbox"
                          name="hasTeamLeader"
                          id="hasTeamLeader"
                          checked={eventData.hasTeamLeader}
                          onChange={handleInputChange}
                          className="switch-input"
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    {eventData.hasTeamLeader && (
                      <motion.div
                        className="form-group team-leader-contact"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <input
                          type="tel"
                          name="teamCount"
                          placeholder="Team Count"
                          value={eventData.teamCount}
                          onChange={handleInputChange}
                          pattern="[1-9]*"
                          maxLength="10"
                          required={eventData.hasTeamLeader}
                        />
                      </motion.div>
                    )}
                    </div>
                  
                    {renderThumbnailInput()}

{renderSubmitButton()}
                
              </motion.form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="events"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="events-view"
          >
            <div className="events-grid">
              {loading ? (
                <div className="loading-spinner"></div>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    className="event-card"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="event-card-header">
                      <h3>{event.name}</h3>
                      <span className="event-category">{event.category}</span>
                    </div>
                    <div className="event-card-body">
                      <img
                        src={event.thumbnail}
                        alt={event.name}
                        className="event-thumbnail"
                      />
                      <div className="event-details">
                        <p><strong>Date:</strong> {event.date}</p>
                        <p><strong>Time:</strong> {event.time}</p>
                        <p><strong>Location:</strong> {event.location}</p>
                        <p><strong>Description:</strong> {event.description}</p>
                        <p><strong>Team Count:</strong> {event.teamCount || '-'}</p>
                      
                      </div>
                    </div>
                    {event.canEdit && (
                      <div className="event-card-actions">
                        <button onClick={() => handleEditEvent(event)}>Edit</button>
                        <button onClick={() => handleDeleteEvent(event.name)}>Delete</button>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="no-events-message">No events found.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventCreation;