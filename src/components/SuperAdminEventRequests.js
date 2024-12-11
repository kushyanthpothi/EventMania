import React, { useState, useEffect } from 'react';
import './SuperAdminEventRequests.css';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import './firebaseConfig'; // Ensure this file initializes Firebase

export const SuperAdminEventRequests = () => {
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const db = getDatabase();
    const eventRequestsRef = ref(db, 'AdminEventRequest');

    // Fetch events from Firebase
    onValue(eventRequestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedEvents = Object.entries(data).flatMap(([collegeName, events]) =>
          Object.entries(events).map(([eventName, details]) => ({
            id: `${collegeName}-${eventName}`, // Unique ID based on path
            name: details.name,
            college: collegeName,
            department: `${details.date || ''} ${details.time || ''}`, // Date and time
            location: details.location,
            description : details.description,
            category: details.category,
            collegeThumbnail: details.thumbnail,
            status: details.status,
            firebasePath: `AdminEventRequest/${collegeName}/${eventName}`,
            savePath: `events/${collegeName}/${eventName}`,
          }))
        );
        setEvents(formattedEvents);
      }
    });
  }, []);

  const handleApprove = (id) => {
    const db = getDatabase();
    const event = events.find((event) => event.id === id);
  
    if (event) {
      // Update only the necessary fields
      const updates = {};
      updates[`${event.firebasePath}/status`] = 'Approved';
      updates[`${event.firebasePath}/registered`] = 0; // Keep this if needed
      updates[event.savePath] = {
        name: event.name,
        college: event.college,
        location: event.location,
        description: event.description,
        category: event.category,
        date: event.department.split(' ')[0], // Extract date
        time: event.department.split(' ')[1], // Extract time
        thumbnail: event.collegeThumbnail,
        status: 'Approved',
        registered: 0, // Keep this if relevant
      };
  
      update(ref(db), updates)
        .then(() => {
          setEvents((prevEvents) =>
            prevEvents.map((e) =>
              e.id === id
                ? { ...e, status: 'Approved' } // Only update the status
                : e
            )
          );
        })
        .catch((error) => console.error('Error approving event:', error));
    }
  };
  

  const handleReject = (id) => {
    const db = getDatabase();
    const event = events.find((event) => event.id === id);

    if (event) {
      // Update status to rejected in Firebase
      const updates = {};
      updates[`${event.firebasePath}/status`] = 'Rejected';

      update(ref(db), updates)
        .then(() => {
          setEvents((prevEvents) =>
            prevEvents.map((e) =>
              e.id === id ? { ...e, status: 'Rejected' } : e
            )
          );
        })
        .catch((error) => console.error('Error rejecting event:', error));
    }
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

  const filteredEvents = events.filter((event) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const statusMatch =
      statusFilter === 'All' || event.status === statusFilter;

    return (
      statusMatch &&
      (event.name.toLowerCase().includes(lowerCaseQuery) ||
        event.college.toLowerCase().includes(lowerCaseQuery) ||
        event.status.toLowerCase().includes(lowerCaseQuery))
    );
  });

  return (
    <div className="super-admin-event-request-container">
      <h2 className="super-admin-event-request-title">Event Access Requests</h2>
      <div className="super-admin-event-request-filters">
        <input
          type="text"
          placeholder="Search by name, college, or status..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="super-admin-event-request-search"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="super-admin-event-request-select"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      <div className="super-admin-event-request-grid">
        {filteredEvents.slice(0, visibleCount).map((event) => (
          <div className="super-admin-event-request-card" key={event.id}>
            <div className="super-admin-event-request-card-header">
              <img
                src={event.collegeThumbnail}
                alt={`${event.college} Thumbnail`}
                className="super-admin-event-request-image"
              />
              <span
                className={`super-admin-event-request-status super-admin-event-request-status-${event.status.toLowerCase()}`}
              >
                {event.status}
              </span>
            </div>
            <div className="super-admin-event-request-card-body">
              <h3 className="super-admin-event-request-event-name">{event.name}</h3>
              <p className="super-admin-event-request-college">{event.college}</p>
              <p className="super-admin-event-request-department">{event.department}</p>
            </div>
            <div className="super-admin-event-request-card-footer">
              <button
                onClick={() => handleApprove(event.id)}
                className="super-admin-event-request-button super-admin-event-request-button-approve"
                disabled={event.status !== 'pending'}
              >
                Approve
              </button>

              <button
                onClick={() => handleReject(event.id)}
                className="super-admin-event-request-button super-admin-event-request-button-reject"
                disabled={event.status !== 'pending'}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length > visibleCount && (
        <button
          className="super-admin-event-request-button super-admin-event-request-button-show-more"
          onClick={showMore}
        >
          Show More
        </button>
      )}
    </div>
  );
};
