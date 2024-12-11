import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { database, auth } from '../components/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import './RegistrationDetails.css';

function RegistrationDetails() {
    const { eventName } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [collegeName, setCollegeName] = useState('');
    const [authInitialized, setAuthInitialized] = useState(false);

    useEffect(() => {
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthInitialized(true);
            if (!user) {
                setError('Please sign in to view registrations');
                setIsLoading(false);
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!authInitialized) return; // Wait for auth to initialize
            if (!auth.currentUser) return; // Exit if no user

            try {
                setIsLoading(true);
                setError(null);

                // Fetch the user's college name using auth
                const collegeRef = ref(database, `Users/College/${auth.currentUser.uid}`);
                const collegeSnapshot = await get(collegeRef);
                const collegeData = collegeSnapshot.val();

                if (collegeData && collegeData.collegeName) {
                    setCollegeName(collegeData.collegeName);

                    // Fetch event registrations
                    const registrationsRef = ref(database, `registrations/${collegeData.collegeName}/${eventName}`);
                    const registrationsSnapshot = await get(registrationsRef);
                    const registrationsData = registrationsSnapshot.val();

                    if (registrationsData) {
                        const formattedRegistrations = Object.entries(registrationsData).map(([rollNumber, details]) => ({
                            rollNumber,
                            ...details,
                        }));
                        setRegistrations(formattedRegistrations);
                    } else {
                        setRegistrations([]);
                    }
                } else {
                    setError('College information not found');
                }
            } catch (err) {
                console.error('Error fetching registrations:', err);
                setError('Failed to load registrations');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistrations();
    }, [eventName, authInitialized]); // Add authInitialized as dependency

    if (isLoading) {
        return <div className="loading">Loading registrations...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="registrations-page">
            <h2>Registrations for {eventName}</h2>
            {registrations.length > 0 ? (
                <table className="registrations-table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Branch</th>
                            <th>Phone</th>
                            <th>Roll Number</th>
                            <th>Team Members</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map((registration) => (
                            <tr key={registration.rollNumber}>
                                <td>{registration.firstName || 'N/A'}</td>
                                <td>{registration.lastName || 'N/A'}</td>
                                <td>{registration.email || 'N/A'}</td>
                                <td>{registration.branch || 'N/A'}</td>
                                <td>{registration.phone || 'N/A'}</td>
                                <td>{registration.rollNumber || 'N/A'}</td>
                                <td>
                                    {registration.teamMembers
                                        ? registration.teamMembers.join(', ')
                                        : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No registrations found for this event.</p>
            )}
        </div>
    );
}

export default RegistrationDetails;