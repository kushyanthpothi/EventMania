import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, HomeIcon, Ticket } from 'lucide-react';
import './Error404Page.css';

const EventMania404 = () => {
  const navigate = useNavigate();
  
  return (
    <div className="error-page">
      {/* Animated Background */}
      <div className="animated-bg">
        {[...Array(20)].map((_, index) => (
          <Ticket
            key={index}
            className="floating-ticket"
            size={24}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
        <div className="gradient-overlay"></div>
      </div>

      {/* Circles Background */}
      <div className="circles">
        {[...Array(10)].map((_, index) => (
          <div 
            key={index} 
            className="circle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="error-content">
        <Calendar className="calendar-icon" size={48} />
        
        <div className="error-text">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>Oops! Looks like this event page doesn't exist.</p>
        </div>

        <div className="button-group">
          <button 
            className="home-button"
            onClick={() => navigate('/')}
          >
            <HomeIcon size={20} />
            Return Home
          </button>
          {/* <button 
            className="events-button"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft size={20} />
            View Events
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default EventMania404;