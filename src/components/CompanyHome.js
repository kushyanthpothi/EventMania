import React, { useState, useEffect } from "react";
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import "./CompanyHome.css";

const COMPANIES = [
  { id: 2, name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
  { id: 3, name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { id: 4, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 5, name: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png' },
  { id: 6, name: 'IBM', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
  { id: 8, name: 'Oracle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
  { id: 10, name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg' },
  { id: 12, name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Adobe_Corporate_Logo.png' },
];

const EVENTS = [
  { id: 1, name: 'Tech Innovation Hackathon', description: 'A 48-hour hackathon focusing on cutting-edge technological solutions', date: 'August 15-17, 2024', participants: 250 },
  { id: 2, name: 'AI and Machine Learning Bootcamp', description: 'Intensive training program on advanced AI and ML technologies', date: 'September 5-10, 2024', participants: 180 },
  { id: 3, name: 'Cybersecurity Challenge', description: 'Student-focused cybersecurity competition and learning event', date: 'October 20-22, 2024', participants: 200 },
  { id: 4, name: 'Cloud Computing Summit', description: 'Comprehensive conference on cloud technologies and strategies', date: 'November 12-14, 2024', participants: 220 },
  { id: 5, name: 'Data Science Symposium', description: 'Advanced conference on data science and analytics', date: 'December 8-10, 2024', participants: 190 },
];

const CompanyHome = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Set up Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', checkMobile);
      unsubscribe(); // Unsubscribe from auth listener when component unmounts
    };
  }, []);

  const handleNextEvent = () => {
    setCurrentEventIndex((prevIndex) =>
      prevIndex < EVENTS.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePrevEvent = () => {
    setCurrentEventIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  const handleRegistration = () => {
    // Handle registration logic here
    console.log("Registration clicked");
    navigate('/companylogin?mode=register');
  };

  const handleLogin = () => {
    // Handle login logic here
    navigate('/companylogin?mode=login');
  };

  const renderCompanyLogos = () => {
    if (isMobile) {
      return (
        <div className="scrolling-row">
          {COMPANIES.map((company) => (
            <div key={company.id} className="company-card">
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="company-logo"
              />
              <div className="company-name">{company.name}</div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <>
          <div className="scrolling-row row-1">
            {COMPANIES.map((company) => (
              <div key={company.id} className="company-card">
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="company-logo"
                />
                <div className="company-name">{company.name}</div>
              </div>
            ))}
          </div>
          <div className="scrolling-row row-2">
            {COMPANIES.map((company) => (
              <div key={company.id} className="company-card">
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="company-logo"
                />
                <div className="company-name">{company.name}</div>
              </div>
            ))}
          </div>
          <div className="scrolling-row row-3">
            {COMPANIES.map((company) => (
              <div key={company.id} className="company-card">
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="company-logo"
                />
                <div className="company-name">{company.name}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <div className="events-container">
          <h2 className="header">Upcoming Company Events</h2>
          {isMobile ? (
            <div className="events-mobile-scroll">
              <button
                className="event-nav-btn prev"
                onClick={handlePrevEvent}
                disabled={currentEventIndex === 0}
              >
                &#10094;
              </button>
              <div className="event-card">
                <h3>{EVENTS[currentEventIndex].name}</h3>
                <p>{EVENTS[currentEventIndex].description}</p>
                <p>Date: {EVENTS[currentEventIndex].date}</p>
                <p>Participants: {EVENTS[currentEventIndex].participants}</p>
              </div>
              <button
                className="event-nav-btn next"
                onClick={handleNextEvent}
                disabled={currentEventIndex === EVENTS.length - 1}
              >
                &#10095;
              </button>
            </div>
          ) : (
            <div className="events-desktop-scroll">
              {EVENTS.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                  <p>Date: {event.date}</p>
                  <p>Participants: {event.participants}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="scrolling-container">
          <h2 className="header">Our Corporate Partners</h2>
          {renderCompanyLogos()}
        </div>
      </div>
      
      {/* Only show registration container if user is not logged in */}
      {!user && (
        <div className="registration-container">
          <div className="buttons-wrapper">
            <button className="registration-button" onClick={handleRegistration}>
              <span className="button-text">Register Your Company</span>
              <span className="button-icon">→</span>
            </button>
            <button className="login-button" onClick={handleLogin}>
              <span className="button-text">Login Your Company</span>
              <span className="button-icon">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyHome;