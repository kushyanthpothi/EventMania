import React, { useState } from 'react';
import './AdminRequestList.css'; // Import CSS file

const AdminRequestList = () => {
  // Sample admin data array
  const sampleAdmins = [
      { _id: '1', userName: 'John Doe', collegeName: 'Harvard University', status: 'pending' },
      { _id: '2', userName: 'Jane Smith', collegeName: 'Stanford University', status: 'pending' },
      { _id: '3', userName: 'Samuel Green', collegeName: 'MIT', status: 'pending' },
      { _id: '4', userName: 'Alice Brown', collegeName: 'UC Berkeley', status: 'pending' },
      { _id: '5', userName: 'Emily White', collegeName: 'Yale University', status: 'pending' },
      { _id: '6', userName: 'Michael Black', collegeName: 'Princeton University', status: 'pending' },
      { _id: '7', userName: 'Olivia Johnson', collegeName: 'Columbia University', status: 'pending' },
      { _id: '8', userName: 'James Wilson', collegeName: 'University of Chicago', status: 'pending' }
  ];

  // State to manage the admin requests
  const [requests, setRequests] = useState(sampleAdmins);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // State for the status filter

  // Function to handle accept or reject
  const handleAction = (id, action) => {
    setRequests(requests.map(request =>
      request._id === id ? { ...request, status: action } : request
    ));
  };

  // Function to handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Function to handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Filter requests based on status and search term
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.collegeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-requests-container">
      <h2>Admin Requests</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or college..."
          value={searchTerm}
          onChange={handleSearch}
        />
        
        <select value={statusFilter} onChange={handleStatusFilterChange} className="status-filter">
          <option value="All">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="requests-container">
        {filteredRequests.map(request => (
          <div className="request-card" key={request._id}>
            <div className="request-info">
              <p><strong>Admin Name:</strong> {request.userName}</p>
              <p><strong>College Name:</strong> {request.collegeName}</p>
              <p><strong>Status:</strong> {request.status}</p>
            </div>
            <div className="action-buttons">
              {request.status === 'accepted' ? (
                <button className="accepted-btn">Accepted</button>
              ) : request.status === 'rejected' ? (
                <button className="rejected-btn">Rejected</button>
              ) : (
                <>
                  <button
                    className="accept-btn"
                    onClick={() => handleAction(request._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleAction(request._id, 'rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRequestList;
