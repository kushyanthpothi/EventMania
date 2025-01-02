import React, { useState, useEffect, useRef } from 'react';
import { ref, set, get, remove } from 'firebase/database';
import { database, auth } from './firebaseConfig';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getEventNameSuggestions, generateEventDescription } from './geminiService';
import { Check, RefreshCw } from 'lucide-react';
import './EventCreation.css';
// import { GoogleGenerativeAI } from "@google/generative-ai";


const EventCreation = () => {
  const [view, setView] = useState('creation');
  const [editMode, setEditMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const [aiMode, setAiMode] = useState(false);
  const [inputDescription, setInputDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [aiDescMode, setAiDescMode] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [showRegenerateDesc, setShowRegenerateDesc] = useState(false);
  const [descGenerated, setDescGenerated] = useState(false);
  const [savedPrompt, setSavedPrompt] = useState('');
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
  // const genAI = new GoogleGenerativeAI("AIzaSyD_xI_TNAXLeI2IloqvVnfIeDu7mNk0Cc8");
  // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handleGenerateDescription = async () => {
    if (!tempDescription.trim() || isGeneratingDesc) return;
    
    setIsGeneratingDesc(true);
    try {
      // Save the prompt before generating description
      setSavedPrompt(tempDescription);
      const description = await generateEventDescription(tempDescription);
      setEventData(prev => ({
        ...prev,
        description
      }));
      setDescGenerated(true);
      setShowRegenerateDesc(true);
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleRegenerateDescription = async () => {
    setIsGeneratingDesc(true);
    try {
      // Use the saved prompt instead of tempDescription
      const description = await generateEventDescription(savedPrompt);
      setEventData(prev => ({
        ...prev,
        description
      }));
      setDescGenerated(true);
    } catch (error) {
      console.error('Error regenerating description:', error);
      toast.error('Failed to regenerate description');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleDescriptionKeyPress = (e) => {
    if (e.key === 'Enter' && aiDescMode) {
      e.preventDefault();
      handleGenerateDescription();
    }
  };

  const renderDescriptionInput = () => (
    <motion.div className="form-group event-name-container" >
      {/* <div className="description-input-container" > */}
      <input
          type="text"
          name="description"
          placeholder={aiDescMode ? "Enter a brief description of your event to generate a detailed one" : "Event Description"}
          value={aiDescMode ? (descGenerated ? eventData.description : tempDescription) : eventData.description}
          onChange={(e) => {
            if (aiDescMode && !descGenerated) {
              setTempDescription(e.target.value);
            } else if (!aiDescMode) {
              handleInputChange(e);
            }
          }}
          onKeyPress={handleDescriptionKeyPress}
          required
          className={`description-input expanded-input ${aiDescMode ? 'ai-mode-active' : ''}`}
          readOnly={aiDescMode && descGenerated}
        />
        
        <div className="description-button-group">
          {aiDescMode && (
            <>
              {descGenerated ? (
                <button
                  className="check-button"
                  onClick={() => {
                    setAiDescMode(false);
                    setShowRegenerateDesc(false);
                    setDescGenerated(false);
                    setTempDescription('');
                    setSavedPrompt('');
                  }}
                >
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button
                  className={`arrow-button ${tempDescription.length > 0 ? 'active' : ''}`}
                  onClick={() => {
                    if (tempDescription.length > 0 && !isGeneratingDesc) {
                      handleGenerateDescription();
                    }
                  }}
                  disabled={tempDescription.length === 0 || isGeneratingDesc}
                >
                  {isGeneratingDesc ? (
                    <div className="arrow-spinner" />
                  ) : (
                    '➜'
                  )}
                </button>
              )}
            </>
          )}
          
          <button
            className="ai-logo-button"
            onClick={() => {
              setAiDescMode(!aiDescMode);
              if (!aiDescMode) {
                setTempDescription('');
                setSavedPrompt('');
                setDescGenerated(false);
                setShowRegenerateDesc(false);
              }
            }}
            disabled={isGeneratingDesc}
          >
            <img src="https://i.ibb.co/b7HX4kz/AI-Logo.png" alt="AI" />
          </button>
        </div>
        
        {showRegenerateDesc && (
          <div className="regenerate-container">
            <div className="saved-prompt">
              <small>Original prompt: {savedPrompt}</small>
            </div>
            <button
              className="regenerate-button"
              onClick={handleRegenerateDescription}
              disabled={isGeneratingDesc}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </button>
          </div>
        )}
      {/* </div> */}
    </motion.div>
  );

  const generateAISuggestions = async (description) => {
    if (!description.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setShowSuggestions(true);
    
    try {
      const suggestions = await getEventNameSuggestions(description);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && aiMode) {
      e.preventDefault(); // Prevent form submission
      generateAISuggestions(inputDescription);
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

  const getGeminiSuggestions = async (input) => {
    setIsGenerating(true);
    try {
      const suggestions = await getEventNameSuggestions(input);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsGenerating(false);
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

  const debouncedGetSuggestions = debounce(getGeminiSuggestions, 300);

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

    if (name === 'eventName') {
      if (value.trim().length >= 3) { // Only get suggestions if input is 3 or more characters
        debouncedGetSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
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

  const handleSuggestionClick = (suggestion) => {
    setEventData(prev => ({
      ...prev,
      eventName: suggestion
    }));
    setShowSuggestions(false);
    setAiMode(false);
    setInputDescription('');
  };

  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const generateSuggestions = (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const commonEventTypes = [
      'Workshop on', 'Seminar on', 'Conference on', 'Training in',
      'Hackathon', 'Competition', 'Symposium on', 'Tech Talk on',
      'Webinar on', 'Meeting about'
    ];

    const suggestedEvents = commonEventTypes
      .map(type => `${type} ${input}`)
      .filter(suggestion =>
        suggestion.toLowerCase().includes(input.toLowerCase()) ||
        input.toLowerCase().includes(suggestion.toLowerCase())
      );

    const techEvents = [
      `${input} Programming Workshop`,
      `${input} Development Training`,
      `${input} Technology Summit`,
      `Advanced ${input} Techniques`,
      `${input} Masterclass`
    ];

    const allSuggestions = [...suggestedEvents, ...techEvents]
      .filter(suggestion => suggestion.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestions(allSuggestions);
    setShowSuggestions(true);
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
        className="form-group event-name-container"
        whileFocus={{ scale: 1.02 }}
        ref={suggestionsRef}
      >
        <div className="event-name-input-container">
          <input
            type="text"
            name="eventName"
            placeholder={aiMode ? "Describe your event to generate titles" : "Event Name"}
            value={aiMode ? inputDescription : eventData.eventName}
            onChange={(e) => {
              if (aiMode) {
                setInputDescription(e.target.value);
              } else {
                handleInputChange(e);
              }
            }}
            onKeyPress={handleKeyPress}
            required
            readOnly={editMode}
            className={`event-name-input ${editMode ? 'read-only-input' : ''} ${aiMode ? 'ai-mode-active' : ''}`}
          />
          
          <div className="button-group">
          {aiMode && (
            <button
              className={`arrow-button ${inputDescription.length > 0 ? 'active' : ''}`}
              onClick={() => {
                if (inputDescription.length > 0 && !isGenerating) {
                  generateAISuggestions(inputDescription);
                }
              }}
              disabled={inputDescription.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <div className="arrow-spinner" />
              ) : (
                '➜'
              )}
            </button>
          )}
          
          <button
            className="ai-logo-button"
            onClick={() => {
              setAiMode(!aiMode);
              if (!aiMode) {
                setInputDescription('');
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            disabled={isGenerating}
          >
            <img src="https://i.ibb.co/b7HX4kz/AI-Logo.png" alt="AI" />
          </button>
        </div>
        </div>
  
        {showSuggestions && !editMode && (
          <div className="suggestions-container">
            {isGenerating ? (
              <div className="suggestion-item loading" style={{marginTop: '0.1rem'}}>
                Generating...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    handleSuggestionClick(suggestion);
                    setAiMode(false);
                    setInputDescription('');
                  }}
                >
                  {suggestion}
                </div>
              ))
            ) : (
              <div className="suggestion-item no-results">
                No suggestions found
              </div>
            )}
          </div>
        )}
        
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
                  {renderDescriptionInput()}
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
                    <div className="event-card-header-1">
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