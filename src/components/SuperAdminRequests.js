import React, { useState, useEffect } from 'react';
import { database } from './firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import './SuperAdminRequests.css';

export const SuperAdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [profileImages, setProfileImages] = useState({});

  const defaultImage = 'https://i.ibb.co/JmdSpY2/DALL-E-2024-11-14-23-43-08-A-universal-simple-icon-representing-a-college-building-symbol-The-design.webp'; // Path to default image for pending/rejected statuses

  // Fetch all requests from the Realtime Database on component mount
  useEffect(() => {
    const requestsRef = ref(database, 'AdminRequests');
    onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setRequests(requestData);
      }
    });
  }, []);

  // Fetch profile images for approved requests
  useEffect(() => {
    requests.forEach((request) => {
      if (request.status === 'Approved') {
        const userImageRef = ref(database, `Users/College/${request.id}/profileImage`);
        onValue(userImageRef, (snapshot) => {
          const imageUrl = snapshot.val();
          setProfileImages((prevImages) => ({
            ...prevImages,
            [request.id]: imageUrl || defaultImage,
          }));
        });
      }
    });
  }, [requests]);

  const handleApprove = (id, request) => {
    const requestRef = ref(database, `AdminRequests/${id}`);
    const userRef = ref(database, `Users/College/${id}`);

    update(requestRef, { status: 'Approved', isAdmin: true });
    update(userRef, { ...request, status: 'Approved', isAdmin: true });

    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status: 'Approved', isAdmin: true } : req
      )
    );
  };

  const handleReject = (id) => {
    const requestRef = ref(database, `AdminRequests/${id}`);

    update(requestRef, { status: 'Rejected' });

    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status: 'Rejected' } : req
      )
    );
  };

  const showMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredRequests = requests.filter((request) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    // Ensure that the properties are defined and not null
    const facultyNameMatch = request.facultyName && request.facultyName.toLowerCase().includes(lowerCaseQuery);
    const collegeNameMatch = request.collegeName && request.collegeName.toLowerCase().includes(lowerCaseQuery);
    const collegeEmailMatch = request.collegeEmail && request.collegeEmail.toLowerCase().includes(lowerCaseQuery);
  
    const statusMatch = statusFilter === 'All' || request.status === statusFilter;
  
    return statusMatch && (facultyNameMatch || collegeNameMatch || collegeEmailMatch);
  });  

  return (
    <div className="super-admin-request-container">
      <h2 className="super-admin-request-title">Admin Access Requests</h2>
      <div className="super-admin-request-controls">
        <input
          type="text"
          placeholder="Search by faculty name, college name, or college email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="super-admin-request-search"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="super-admin-request-filter"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      <div className="super-admin-request-grid">
        {filteredRequests.slice(0, visibleCount).map((request) => {
          // Get the profile image from state
          const profileImage = profileImages[request.id] || defaultImage;

          return (
            <div className="super-admin-request-card" key={request.id}>
              <div className="super-admin-request-card-front">
                <img
                  src={profileImage}
                  alt={`${request.collegeName} Thumbnail`}
                  className="super-admin-request-image"
                />
                <span
                className={`super-admin-event-request-status super-admin-event-request-status-${request.status.toLowerCase()}`}
              >
                {request.status}
              </span>
                <div className="super-admin-request-details">
                  <h3 className="super-admin-request-name">{request.facultyName}</h3>
                  <p className="super-admin-request-college">{request.collegeName}</p>
                  <p className="super-admin-request-email">{request.collegeEmail}</p>
                  {/* <p className="super-admin-request-status">Status: {request.status}</p>   */}
                </div>
              </div>
              <div className="super-admin-request-card-back">
                <button
                  onClick={() => handleApprove(request.id, request)}
                  className="super-admin-request-button super-admin-request-approve"
                  disabled={request.status !== 'pending'}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="super-admin-request-button super-admin-request-reject"
                  disabled={request.status !== 'pending'}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {filteredRequests.length > visibleCount && (
        <button className="super-admin-request-show-more" onClick={showMore}>
          Show More
        </button>
      )}
    </div>
  );
};

export default SuperAdminRequests;
