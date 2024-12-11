import React from 'react';
import './Footer.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { auth } from './firebaseConfig'; // Adjust the import path as needed

const Footer = () => {
  const navigate = useNavigate();

  // Handle College Events Navigation
  const handleCollegeEventsNavigation = () => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      toast.error("Please login before to see College Events", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      navigate('/college-events');
    }
  };

  // Handle Explore Events Navigation
  const handleExploreEventsNavigation = () => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      toast.error("Please login before to see Explore All Events", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      navigate('/explore-events');
    }
  };

  return (
    <section className="footer">
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="footer-row">
        <div className="footer-col">
          <h4>Info</h4>
          <ul className="links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Want to collaborate</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Events</h4>
          <ul className="links">
            <li>
              <span 
                onClick={handleCollegeEventsNavigation} 
                style={{cursor: 'pointer'}}
              >
                College Events
              </span>
            </li>
            <li>
              <span 
                onClick={handleExploreEventsNavigation} 
                style={{cursor: 'pointer'}}
              >
                Explore All Events
              </span>
            </li>
            <li><a href="#">Event Mania Presents</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Want to collaborate</h4>
          <p>
            Submit your details to contact you if you are interested
          </p>
          <form action="#">
            <input type="email" placeholder="College email" required />
            <input type="phone" placeholder="College phone number" required />
            <input type="text" placeholder="College name" required />
            <button type="submit">SUBSCRIBE</button>
          </form>
          <div className="icons">
            <i className="fa-brands fa-facebook-f"></i>
            <i className="fa-brands fa-twitter"></i>
            <i className="fa-brands fa-linkedin"></i>
            <i className="fa-brands fa-github"></i>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;