import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { auth, database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import './Dashboard.css';
import blueVerifiedIcon from './images/blue-verified.png'; // Blue verified icon for students
import goldVerifiedIcon from './images/gold-verified.png'; // Gold verified icon for college reps

// Default profile image if none exists in the database
const defaultProfileImage = 'https://i.ibb.co/vX6LtBV/Event-Mania-1.png';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        // Retrieve student details
        const studentRef = ref(database, `Users/Students/${currentUser.uid}`);
        onValue(studentRef, snapshot => {
          const studentData = snapshot.val();
          if (studentData && studentData.email === currentUser.email) {
            setUserDetails({
              fullname: studentData.fullname,
              role: 'Student',
              verifiedIcon: blueVerifiedIcon,
              profileImg: studentData.profileImg || defaultProfileImage, // Retrieve profile image
            });
          }
        });

        // Retrieve college representative details
        const collegeRef = ref(database, `Users/College/${currentUser.uid}`);
        onValue(collegeRef, snapshot => {
          const collegeData = snapshot.val();
          if (collegeData && collegeData.collegeEmail === currentUser.email) {
            setUserDetails({
              fullname: collegeData.facultyName,
              role: 'College Representative',
              verifiedIcon: goldVerifiedIcon,
              profileImg: collegeData.profileImg || defaultProfileImage, // Retrieve profile image
            });
          }
        });
      } else {
        setUserDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setUserDetails(null);
    navigate('/'); // Redirects to homepage after logout
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        {userDetails ? (
          <>
            <div className="dashboard-profile">
              <img
                src={userDetails.profileImg} // Display profile image
                alt="profile"
                className="dashboard-profile-image"
              />
              <div className="dashboard-profile-info">
                <h2>{userDetails.fullname}</h2>
                <p style={{marginTop:'-15px'}}>
                  {userDetails.role}{' '}
                  <img
                    src={userDetails.verifiedIcon}
                    alt="verified"
                    className="verified-icon"
                  />
                </p>
              </div>
              <h1 className="event-mania-title-dashboard">EventMania</h1>
            </div>
            <div className="dashboard-menu">
              <p>Dashboard</p>
              <ul>
                {userDetails.role === 'College Representative' ? (
                  <>
                    <li onClick={() => navigate('/account-details')}>Account Details</li>
                    <li onClick={() => navigate('/event-creation')}>Event Creation</li>
                    {/* <li onClick={() => navigate('/event-requesting-admin')}>Event Request to admin</li> */}
                    <li onClick={() => navigate('/user-requests')}>User Requests</li>
                    <li onClick={() => navigate('/college-event')}>All Events</li>
                    <li onClick={() => navigate('/data-visualization')}>Data Visualization</li>
                    <li onClick={handleLogout}>Signout</li>
                  </>
                ) : (
                  <>
                    <li onClick={() => navigate('/account-details')}>Account Details</li>
                    <li onClick={() => navigate('/college-events')}>College Events</li>
                    <li onClick={() => navigate('/registered-events')}>Registered Events</li>
                    <li onClick={() => navigate('/trending-events')}>Trending Events</li>
                    <li onClick={handleLogout}>Signout</li>
                  </>
                )}
              </ul>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
