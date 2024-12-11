import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

// Define route permissions for each role
const roleRoutes = {
  student: [
    '/dashboard',
    '/account-details',
    '/college-events',
    '/registered-events',
    '/trending-events'
  ],
  collegeRep: [
    '/dashboard',
    '/account-details',
    '/event-creation',
    '/user-requests',
    '/college-event',
    '/data-visualization',
    '/registration/:eventName'
  ],
  superAdmin: [
    '/super-admin-home',
    '/super-admin-requests',
    '/super-event-requests',
    '/super-event-creation'
  ]
};

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // First, check if user is in Students path
          const studentRef = ref(db, `Users/Students/${user.uid}`);
          const studentSnapshot = await get(studentRef);

          if (studentSnapshot.exists()) {
            setUserRole('student');
          } else {
            // If not in Students, check College path
            const collegeRef = ref(db, `Users/College/${user.uid}`);
            const collegeSnapshot = await get(collegeRef);

            if (collegeSnapshot.exists()) {
              // Check if user is superAdmin
              const isSuperAdmin = collegeSnapshot.val().superAdmin === true;
              setUserRole(isSuperAdmin ? 'superAdmin' : 'collegeRep');
            }
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  if (loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  // If user is not authenticated, redirect to login
  if (!auth.currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has permission to access the current route
  const currentPath = location.pathname;
  const hasPermission = userRole && (
    roleRoutes[userRole].some(route => 
      currentPath.startsWith(route.replace(':eventName', '')) ||
      currentPath.startsWith(route) || 
      (route === '/college-events' && currentPath.startsWith('/event/')) ||
      (route === '/college-events' && currentPath.startsWith('/register/'))
    )
  );

  if (!hasPermission) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      student: '/dashboard',
      collegeRep: '/dashboard',
      superAdmin: '/super-admin-home'
    };
    return <Navigate to={dashboardRoutes[userRole] || '/'} replace />;
  }

  return children;
};

export const wrapWithPrivateRoute = (component, allowedRoles = []) => {
  return (
    <PrivateRoute allowedRoles={allowedRoles}>
      {component}
    </PrivateRoute>
  );
};

export default PrivateRoute;