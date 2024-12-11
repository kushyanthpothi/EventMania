import React, { useState, useEffect } from "react";
import "./SuperAdminHome.css";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate
import { database } from "./firebaseConfig";
import { ref, get, child } from "firebase/database";
import { getAuth, signOut } from "firebase/auth"; // Add signOut
import { LogOut } from "lucide-react"; // Import LogOut icon

const EventCard = ({ event }) => (
  <div className="super-admin-home-event-card">
    <img
      src={event.thumbnail || "https://via.placeholder.com/150"}
      alt={event.name}
      className="super-admin-home-event-image"
    />
    <div className="super-admin-home-event-details">
      <h3>{event.name}</h3>
      <p className="super-admin-home-event-college">{event.college}</p>
      <p className="super-admin-home-event-category">{event.category}</p>
    </div>
  </div>
);

const EventCategory = ({ title, eventList }) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const showMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  return (
    <div className="super-admin-home-event-category">
      <h2>{title}</h2>
      <div className="super-admin-home-event-grid">
        {eventList.slice(0, visibleCount).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {eventList.length > visibleCount && (
        <button className="super-admin-home-btn super-admin-home-btn-show-more" onClick={showMore}>
          Show More
        </button>
      )}
    </div>
  );
};

export const SuperAdminHome = () => {
  const [events, setEvents] = useState({ ongoing: [], upcoming: [], completed: [] });
  const [adminPendingRequests, setAdminPendingRequests] = useState(0);
  const [eventPendingRequests, setEventPendingRequests] = useState(0);
  const [facultyName, setFacultyName] = useState("");

  const auth = getAuth();
  const navigate = useNavigate(); // Add navigate hook

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Navigate to home page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const dbRef = ref(database);
      try {
        const snapshot = await get(child(dbRef, "events"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const allEvents = [];
          const today = new Date();

          Object.keys(data).forEach((collegeName) => {
            const collegeEvents = data[collegeName];
            Object.keys(collegeEvents).forEach((eventId) => {
              const event = collegeEvents[eventId];
              event.college = collegeName;
              allEvents.push(event);
            });
          });

          const ongoing = [];
          const upcoming = [];
          const completed = [];

          allEvents.forEach((event) => {
            const eventDate = new Date(event.date);
            if (eventDate.toDateString() === today.toDateString()) {
              ongoing.push(event);
            } else if (eventDate > today) {
              upcoming.push(event);
            } else {
              completed.push(event);
            }
          });

          setEvents({ ongoing, upcoming, completed });
        } else {
          console.error("No events data found.");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const fetchAdminPendingRequests = async () => {
      const dbRef = ref(database, "AdminRequests");
      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          let pendingCount = 0;
          Object.keys(data).forEach((requestId) => {
            if (data[requestId].status === "pending") {
              pendingCount++;
            }
          });
          setAdminPendingRequests(pendingCount);
        } else {
          console.error("No admin requests data found.");
        }
      } catch (error) {
        console.error("Error fetching admin requests:", error);
      }
    };

    const fetchEventPendingRequests = async () => {
      const dbRef = ref(database, "AdminEventRequest");
      try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          let pendingCount = 0;

          Object.keys(data).forEach((collegeName) => {
            const collegeEvents = data[collegeName];
            Object.keys(collegeEvents).forEach((eventId) => {
              if (collegeEvents[eventId].status === "pending") {
                pendingCount++;
              }
            });
          });

          setEventPendingRequests(pendingCount);
        } else {
          console.error("No event requests data found.");
        }
      } catch (error) {
        console.error("Error fetching event requests:", error);
      }
    };

    const fetchFacultyName = async () => {
      const user = auth.currentUser;
      if (user) {
        const dbRef = ref(database, `Users/College/${user.uid}`);
        try {
          const snapshot = await get(dbRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.collegeEmail === user.email) {
              setFacultyName(userData.facultyName);
            }
          } else {
            console.error("No user data found.");
          }
        } catch (error) {
          console.error("Error fetching faculty name:", error);
        }
      }
    };

    fetchEvents();
    fetchAdminPendingRequests();
    fetchEventPendingRequests();
    fetchFacultyName();

  }, [auth.currentUser]);

  return (
    <div className="super-admin-home-container">
      <div className="super-admin-home-background-animation"></div>
      <header className="super-admin-home-header">
        <div className="super-admin-home-header-content">
          <h1>Super Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="super-admin-home-logout-btn"
            aria-label="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>
      <main className="super-admin-home-main">
        <section className="super-admin-home-intro-section">
          <div className="super-admin-home-intro-content">
            <h2>Welcome, {facultyName || "Super Admin"}</h2>
            <p>
              Your central hub for managing the entire system. Oversee administrative requests, event publications, and
              maintain platform integrity with ease.
            </p>
            <div className="super-admin-home-stats">
              <div className="super-admin-home-stat-item">
                <span className="super-admin-home-stat-value">{adminPendingRequests}</span>
                <span className="super-admin-home-stat-label">Admin Pending Requests</span>
              </div>
              <div className="super-admin-home-stat-item">
                <span className="super-admin-home-stat-value">{eventPendingRequests}</span>
                <span className="super-admin-home-stat-label">Event Pending Requests</span>
              </div>
              <div className="super-admin-home-stat-item">
                <span className="super-admin-home-stat-value">{events.ongoing.length}</span>
                <span className="super-admin-home-stat-label">Ongoing Events</span>
              </div>
            </div>
          </div>
          <div className="super-admin-home-action-buttons">
            <Link to="/super-admin-requests" className="super-admin-home-btn super-admin-home-btn-blue">
              <span className="super-admin-home-btn-icon">🔐</span>
              Admin Requests
            </Link>
            <Link to="/super-event-requests" className="super-admin-home-btn super-admin-home-btn-green">
              <span className="super-admin-home-btn-icon">📅</span>
              Event Requests
            </Link>
            <Link to="/super-event-creation" className="super-admin-home-btn super-admin-home-btn-purple">
              <span className="super-admin-home-btn-icon">✨</span>
              Create Event
            </Link>
          </div>
        </section>
        <section className="super-admin-home-events-section">
          <EventCategory title="Ongoing Events" eventList={events.ongoing} />
          <EventCategory title="Upcoming Events" eventList={events.upcoming} />
          <EventCategory title="Completed Events" eventList={events.completed} />
        </section>
      </main>
    </div>
  );
};