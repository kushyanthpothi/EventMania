import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AccountDetails from "./components/AccountDetails";
import CollegeEvents from "./components/Event";
import EventCreation from "./components/EventCreation";
import AdminRequests from "./components/AdminRequests";
// import AllEvents from "./components/AllEvents";
import RegistrationDetails from "./components/RegistrationDetails";
import CollegeEvent from "./components/CollegeEvents";
import TrendingEvents from "./components/TrendingEvents";
import Description from "./components/Description"; // Import the Description component
import RegisterForm from "./components/RegisterForm"; // Import the RegisterForm component
import RegisteredEvents from "./components/RegisteredEvents";
import TabSwitcher from "./components/DataVisualization";
import PopupBox from "./components/PopupBox"; // Import the PopupBox component

import { SuperAdminHome } from "./components/SuperAdminHome";
import { SuperAdminRequests } from "./components/SuperAdminRequests";
import { SuperAdminEventCreation } from "./components/SuperAdminEventCreation";
import { SuperAdminEventRequests } from "./components/SuperAdminEventRequests";
import PrivateRoute from "./components/PrivateRouting";

import EnhancedError404Page from "./components/Error404Page"; // Add this import


import CompanyAuth from "./components/CompanyAuth";

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = [
    "/super-admin-home",
    "/super-admin-requests",
    "/super-event-requests",
    "/super-event-creation",
    // "/companylogin",  
  ];

  const [showPopups, setShowPopups] = React.useState(() => {
    return !localStorage.getItem("popupsDisplayed");
  });

  const handleClosePopup = () => {
    setShowPopups(false);
    localStorage.setItem("popupsDisplayed", "true");
  };

  return (
    <div className="App">
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      {location.pathname === "/" && showPopups && <PopupBox onClose={handleClosePopup} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/companylogin" element={
          <CompanyAuth
            initialMode={new URLSearchParams(window.location.search).get('mode') || 'login'}
          />
        } />

        {/* Student & College Rep Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/account-details" element={
          <PrivateRoute>
            <AccountDetails />
          </PrivateRoute>
        } />

        {/* Student-only Routes */}
        <Route path="/college-events" element={
          <PrivateRoute>
            <CollegeEvents />
          </PrivateRoute>
        } />
        <Route path="/trending-events" element={
          <PrivateRoute>
            <TrendingEvents />
          </PrivateRoute>
        } />
        <Route path="/registered-events" element={
          <PrivateRoute>
            <RegisteredEvents />
          </PrivateRoute>
        } />
        <Route path="/event/:eventId" element={
          <PrivateRoute>
            <Description />
          </PrivateRoute>
        } />
        <Route path="/register/:eventId" element={
          <PrivateRoute>
            <RegisterForm />
          </PrivateRoute>
        } />

        {/* College Rep Routes */}
        <Route path="/event-creation" element={
          <PrivateRoute>
            <EventCreation />
          </PrivateRoute>
        } />
        <Route path="/user-requests" element={
          <PrivateRoute>
            <AdminRequests />
          </PrivateRoute>
        } />
        <Route path="/college-event" element={
          <PrivateRoute>
            <CollegeEvent />
          </PrivateRoute>
        } />
        <Route path="/registration/:eventName" element={
          <PrivateRoute>
            <RegistrationDetails />
          </PrivateRoute>
        } />
        <Route path="/data-visualization" element={
          <PrivateRoute>
            <TabSwitcher />
          </PrivateRoute>
        } />

        {/* Super Admin Routes */}
        <Route path="/super-admin-home" element={
          <PrivateRoute>
            <SuperAdminHome />
          </PrivateRoute>
        } />
        <Route path="/super-admin-requests" element={
          <PrivateRoute>
            <SuperAdminRequests />
          </PrivateRoute>
        } />
        <Route path="/super-event-requests" element={
          <PrivateRoute>
            <SuperAdminEventRequests />
          </PrivateRoute>
        } />
        <Route path="/super-event-creation" element={
          <PrivateRoute>
            <SuperAdminEventCreation />
          </PrivateRoute>
        } />

        <Route path="*" element={<EnhancedError404Page />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;