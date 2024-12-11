import React, { useState, useEffect } from 'react';
import { auth, database } from './firebaseConfig';
import { ref, onValue, update, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import './AdminRequests.css';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [userCollege, setUserCollege] = useState('');

    useEffect(() => {
        const fetchData = async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch admin's college
                const userRef = ref(database, `Users/College/${user.uid}`);
                const userSnapshot = await get(userRef);
                if (!userSnapshot.exists()) {
                    setLoading(false);
                    return;
                }
                const userData = userSnapshot.val();
                const adminCollege = userData.collegeName;
                setUserCollege(adminCollege);

                // Fetch and filter requests
                const requestsRef = ref(database, 'CollegeChangeRequest');
                const unsubscribe = onValue(requestsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const requestsData = snapshot.val();
                        const requestsArray = Object.entries(requestsData)
                            .map(([id, request]) => ({
                                id,
                                ...request,
                                status: request.status || 'pending'
                            }))
                            .filter(request => request.collegeName === adminCollege);
                        
                        requestsArray.sort((a, b) => b.timestamp - a.timestamp);
                        setRequests(requestsArray);
                    } else {
                        setRequests([]);
                    }
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchData(user);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleRequestUpdate = async (requestId, newStatus) => {
        setProcessingId(requestId);
        const request = requests.find(req => req.id === requestId);
        
        try {
            // Update request status
            const requestRef = ref(database, `CollegeChangeRequest/${requestId}`);
            await update(requestRef, { status: newStatus });

            // If accepted, update student's college
            if (newStatus === 'accepted') {
                const studentRef = ref(database, `Users/Students/${request.studentId}`);
                await update(studentRef, {
                    collegeName: request.collegeName
                });
            }

            // Add success animation class
            const card = document.querySelector(`#request-${requestId}`);
            if (card) {
                card.classList.add(newStatus === 'accepted' ? 'slide-right' : 'slide-left');
            }

        } catch (error) {
            console.error('Error updating request:', error);
            alert('Failed to process request. Please try again.');
        } finally {
            setTimeout(() => {
                setProcessingId(null);
            }, 500);
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'accepted':
                return <div className="status-badge accepted">Accepted</div>;
            case 'rejected':
                return <div className="status-badge rejected">Rejected</div>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="admin-requests-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!auth.currentUser) {
        return (
            <div className="admin-requests-container">
                <p>Please log in to view requests.</p>
            </div>
        );
    }

    return (
        <div className="admin-requests-container">
            <div className="admin-header">
                <h1>College Change Requests for {userCollege}</h1>
                <p>{requests.length} {requests.length === 1 ? 'request' : 'requests'}</p>
            </div>

            {requests.length === 0 ? (
                <div className="no-requests">
                    <div className="no-requests-icon">📩</div>
                    <p>No requests at this time</p>
                </div>
            ) : (
                <div className="requests-grid">
                    {requests.map((request) => (
                        <div 
                            key={request.id} 
                            id={`request-${request.id}`}
                            className={`request-card ${processingId === request.id ? 'processing' : ''}`}
                        >
                            <div className="request-header">
                                <div className="profile-section">
                                    <img 
                                        src={request.profileImg || 'default-profile-url'} 
                                        alt={request.fullName}
                                        className="profile-image"
                                    />
                                    <div className="user-info">
                                        <h3>{request.fullName}</h3>
                                        <p>{request.email}</p>
                                    </div>
                                </div>
                                <div className="timestamp">
                                    {new Date(request.timestamp).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="college-change-info">
                                <div className="college from">
                                    <label>From</label>
                                    <p>{request.previousCollegeName}</p>
                                </div>
                                <div className="arrow">➜</div>
                                <div className="college to">
                                    <label>To</label>
                                    <p>{request.collegeName}</p>
                                </div>
                            </div>

                            <div className="request-actions">
                                {request.status === 'pending' ? (
                                    <>
                                        <button
                                            className="accept-button"
                                            onClick={() => handleRequestUpdate(request.id, 'accepted')}
                                            disabled={processingId === request.id}
                                        >
                                            {processingId === request.id ? 'Processing...' : 'Accept'}
                                        </button>
                                        <button
                                            className="reject-button"
                                            onClick={() => handleRequestUpdate(request.id, 'rejected')}
                                            disabled={processingId === request.id}
                                        >
                                            {processingId === request.id ? 'Processing...' : 'Reject'}
                                        </button>
                                    </>
                                ) : (
                                    getStatusDisplay(request.status)
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminRequests;