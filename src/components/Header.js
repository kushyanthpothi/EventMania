import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <div className="headerContainer">
      <h1 className="fade-in-header">Welcome to Event Mania</h1>
      <p className="fade-in">
        Event Mania is a platform designed to connect students with college events. It helps students participate in events at different colleges. 
        We collect registrations and act as the middleware between students and colleges, providing services for both.
      </p>
    </div>
  );
};

export default Header;
