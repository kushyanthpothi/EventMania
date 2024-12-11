import React, { useState, useEffect, useRef } from 'react';
import { Link as ScrollLink,scroller } from 'react-scroll';
import { Link } from 'react-router-dom'; // Use this for routing to the Dashboard page
import { auth, database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Navbar.css';
import Login from './Login';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const location = useLocation();
  const [profileImage, setProfileImage] = useState(null); // State to store profile image
  const sidebarRef = useRef(null); // Ref for the sidebar to detect clicks outside

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsOpen(false); // Close the sidebar if clicked outside
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('click', handleClickOutside); // Add click event listener to the window

    if (location.state?.scrollTo) {
      scroller.scrollTo(location.state.scrollTo, {
        smooth: true,
        duration: 500,
      });
    }

    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        let isStudent = false;
        let isCollegeRep = false;

        // Fetch student details
        const studentRef = ref(database, `Users/Students/${currentUser.uid}`);
        onValue(studentRef, snapshot => {
          const studentData = snapshot.val();
          if (studentData && studentData.email === currentUser.email) {
            isStudent = true;
            setUserDetails({
              fullname: studentData.fullname,
              role: 'student'
            });
            setProfileImage(studentData.profileImg || 'https://i.ibb.co/vX6LtBV/Event-Mania-1.png'); // Set default image if not present
          }
        },[location]);

        // Fetch college representative details
        const collegeRef = ref(database, `Users/College/${currentUser.uid}`);
        onValue(collegeRef, snapshot => {
          const collegeData = snapshot.val();
          if (collegeData && collegeData.collegeEmail === currentUser.email) {
            isCollegeRep = true;
            setUserDetails({
              facultyName: collegeData.facultyName,
              role: 'clg-representative'
            });
            setProfileImage(collegeData.profileImg || 'https://i.ibb.co/4M0Qw22/e5226ce43ed9629b6a79162fd70756ee-1.png'); // Set default image if not present
          }
        });

        if (!isStudent && !isCollegeRep) {
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
        setProfileImage(null); // Reset profile image when logged out
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClickOutside); // Cleanup click event listener
      unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsLoginModalOpen(true);
  };

  const closeModal = () => {
    setIsLoginModalOpen(false);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setUserDetails(null);
    setProfileImage(null); // Clear profile image on logout
    navigate('/'); // Redirects to homepage after logout
  };

  return (
    <>
      {/* Sidebar for desktop */}
      {!isMobile && (
        <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
          <div className="logo-details">
            <i className='fa-solid fa-e icon'></i>
            <div className="logo_name">EventMania</div>
            <i className='bx bx-menu' id="btn" onClick={toggleSidebar}></i>
          </div>
          <ul className="nav-list">
            <li>
              <ScrollLink to="headerContainer" smooth={true} duration={500}>
                <Link to="/">
                  <i className='bx bx-home-alt'></i>
                  <span className="links_name">Home</span>
                </Link>
              </ScrollLink>
              <span className="tooltip">Home</span>
            </li>
            <li>
              {location.pathname === '/' ? (
                <ScrollLink to="aboutContainer" smooth={true} duration={500}>
                  <i className='bx bx-user'></i>
                  <span className="links_name">About Us</span>
                </ScrollLink>
              ) : (
                <Link to="/" state={{ scrollTo: 'aboutContainer' }}>
                  <i className='bx bx-user'></i>
                  <span className="links_name">About Us</span>
                </Link>
              )}
              <span className="tooltip">About Us</span>
            </li>
            <li>
              {location.pathname === '/' ? (
                <ScrollLink to="footer" smooth={true} duration={500}>
                  <i className='bx bx-envelope'></i>
                  <span className="links_name">Contact Us</span>
                </ScrollLink>
              ) : (
                <Link to="/" state={{ scrollTo: 'footer' }}>
                  <i className='bx bx-envelope'></i>
                  <span className="links_name">Contact Us</span>
                </Link>
              )}
              <span className="tooltip">Contact us</span>
            </li>

            {/* Conditional rendering based on user authentication */}
            {!user ? (
              // eslint-disable-next-line
              <li>
                
                <a className="login-link" onClick={handleLoginClick}>
                  <i className='bx bx-log-in'></i>
                  <span className="links_name">Login</span>
                </a>
                <span className="tooltip">Login</span>
              </li>
            ) : (
              <>
                {/* Dashboard Button */}
                <li>
                  <Link to={userDetails && userDetails.role === 'clg-representative' ? "/dashboard" : "/dashboard"}>
                    <i className='bx bxs-dashboard'></i>
                    <span className="links_name">
                      {userDetails && userDetails.role === 'clg-representative' ? 'Admin Dashboard' : 'Dashboard'}
                    </span>
                  </Link>
                  <span className="tooltip">
                    {userDetails && userDetails.role === 'clg-representative' ? 'Admin Dashboard' : 'Dashboard'}
                  </span>
                </li>

                {/* Profile Section */}
                <li className="profile">
                  <div className="profile-details">
                    <img src={profileImage} alt="profileImg" /> {/* Display the profile image */}
                    <div className="name_job">
                      <div className="name">
                        {userDetails ? (
                          userDetails.role === 'student'
                            ? userDetails.fullname
                            : userDetails.role === 'clg-representative'
                              ? userDetails.facultyName || 'User'
                              : 'User'
                        ) : 'User'}
                      </div>
                      <div className="job">
                        {userDetails ? (userDetails.role === 'clg-representative' ? 'College Representative' : userDetails.role) : 'Guest'}
                      </div>
                    </div>
                  </div>
                  <i className='bx bx-log-out' id="log_out" onClick={handleLogout} style={{ cursor: 'pointer' }}></i>
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Top Navbar for Mobile */}
      {isMobile && (
        <div className="top-navbar-mobile">
          <div className="mobile-logo-name">EventMania</div>
          {user && (
            <div className="mobile-profile-photo">
              <Link to="/account-details">
                <img src={profileImage} alt="profileImg" /> {/* Display the profile image */}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Bottom navigation for mobile */}
      {isMobile && (
        <div className="bottom-nav">
          <ScrollLink to="headerContainer" smooth={true} duration={500}>
            <Link to="/">
              <i className='bx bx-home-alt'></i>
            </Link>
          </ScrollLink>
          <ScrollLink to="aboutContainer" smooth={true} duration={500}>
            <i className='bx bx-user'></i>
          </ScrollLink>
          <ScrollLink to="footer" smooth={true} duration={500}>
            <i className='bx bxs-contact'></i>
          </ScrollLink>

          {!user ? (
            <a href="#" className="login-link" onClick={handleLoginClick}>
              <i className='bx bx-log-in'></i>
            </a>
          ) : (
            <>
              {/* Dashboard Button for mobile */}
              <Link to={userDetails && userDetails.role === 'clg-representative' ? "/dashboard" : "/dashboard"}>
                <i className='bx bxs-dashboard'></i>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Render the Login Modal */}
      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Login closeModal={closeModal} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
