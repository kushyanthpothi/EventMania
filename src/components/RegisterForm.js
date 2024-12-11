import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, set, get, runTransaction } from 'firebase/database';
import { database, auth } from './firebaseConfig';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faGraduationCap, faIdCard, faUsers } from '@fortawesome/free-solid-svg-icons';
import './RegisterForm.css';

const RegisterForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [teamCount, setTeamCount] = useState(4); // Default to 4 if not found
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    branch: '',
    rollNumber: '',
    teamMembers: []
  });
  const [collegeName, setCollegeName] = useState('');
  const [eventName, setEventName] = useState('');
  const [isSuperAdminEvent, setIsSuperAdminEvent] = useState(false);

  useEffect(() => {
    const fetchUserAndEventInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `Users/Students/${user.uid}/collegeName`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const collegeNameValue = snapshot.val();
          setCollegeName(collegeNameValue);

          // Check if the event exists in SuperAdmin collection
          const superAdminEventRef = ref(database, `events/SuperAdmin/${eventId}`);
          const superAdminEventSnapshot = await get(superAdminEventRef);

          if (superAdminEventSnapshot.exists()) {
            setIsSuperAdminEvent(true);
            setEventName(superAdminEventSnapshot.val().name);
            
            // Try to get teamCount from SuperAdmin event
            const teamCountRef = ref(database, `events/SuperAdmin/${eventId}/teamCount`);
            const teamCountSnapshot = await get(teamCountRef);
            if (teamCountSnapshot.exists()) {
              setTeamCount(teamCountSnapshot.val());
            }
          } else {
            // Fallback to the college-specific event
            const collegeEventRef = ref(database, `events/${collegeNameValue}/${eventId}`);
            const collegeEventSnapshot = await get(collegeEventRef);
            if (collegeEventSnapshot.exists()) {
              setEventName(collegeEventSnapshot.val().name);
              
              // Get teamCount from college-specific event
              const teamCountRef = ref(database, `events/${collegeNameValue}/${eventId}/teamCount`);
              const teamCountSnapshot = await get(teamCountRef);
              if (teamCountSnapshot.exists()) {
                setTeamCount(teamCountSnapshot.val());
              }
            }
          }
        }
      }
    };
    fetchUserAndEventInfo();
  }, [eventId]);

  useEffect(() => {
    // Update the team members array when teamCount changes
    setFormData(prevState => ({
      ...prevState,
      teamMembers: Array.from({ length: teamCount }, (_, index) => prevState.teamMembers[index] || '')
    }));
  }, [teamCount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleTeamMemberChange = (index, value) => {
    const updatedTeamMembers = [...formData.teamMembers];
    updatedTeamMembers[index] = value;
    setFormData(prevState => ({
      ...prevState,
      teamMembers: updatedTeamMembers
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rollNumber } = formData;

    if (!collegeName || !eventName) {
      alert('Error: College name or event name not found');
      return;
    }

    if (!rollNumber) {
      alert('Error: Roll Number is required');
      return;
    }

    if (formData.teamMembers.some(member => member.trim() === '')) {
      alert('Please fill in all team member names.');
      return;
    }

    const registrationPath = isSuperAdminEvent
      ? `registrations/SuperAdmin/${eventName}/${collegeName}/${rollNumber}`
      : `registrations/${collegeName}/${eventName}/${rollNumber}`;

    const eventRefPath = isSuperAdminEvent
      ? `events/SuperAdmin/${eventName}/registered`
      : `events/${collegeName}/${eventName}/registered`;

    try {
      await set(ref(database, registrationPath), formData);
      await runTransaction(ref(database, eventRefPath), (currentValue) => (currentValue || 0) + 1);

      alert('Registration successful!');
      navigate('/college-events');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className='register-form-body'>
      <div className="register-form-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="register-form-card"
        >
          <h1 className="form-title">Register for {eventName}</h1>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  required
                  className="form-input"
                />
              </div>
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="form-input"
              />
            </div>
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faPhone} className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
                className="form-input"
              />
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faGraduationCap} className="input-icon" />
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="Branch"
                  required
                  className="form-input"
                />
              </div>
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faIdCard} className="input-icon" />
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="Roll Number"
                  required
                  className="form-input"
                />
              </div>
            </div>
            <h2 className="team-members-title">
              <FontAwesomeIcon icon={faUsers} className="section-icon" />
              Team Members (Max {teamCount})
            </h2>
            <div className="team-members-grid">
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="input-wrapper">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                    placeholder={`Team Member ${index + 1}`}
                    className="form-input"
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="submit-button">Register</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterForm;
