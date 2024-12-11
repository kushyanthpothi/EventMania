import React, { useState, useEffect } from 'react';
import { auth, database } from './firebaseConfig';
import { ref, onValue, update, push, remove } from 'firebase/database';
import { uploadImageToImgbb } from './imgbbUpload';
import './AccountDetails.css';
import blueVerifiedIcon from './images/blue-verified.png';
import goldVerifiedIcon from './images/gold-verified.png';

const defaultProfileImage = 'https://i.ibb.co/vX6LtBV/Event-Mania-1.png';
const defaultCollegeLogo = 'https://i.ibb.co/GHpDg5k/University.png';

const AccountDetails = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedDetails, setEditedDetails] = useState({});
    const [profileImg, setProfileImage] = useState(defaultProfileImage);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [collegeNames, setCollegeNames] = useState([]);
    const [previousCollegeName, setPreviousCollegeName] = useState('');
    const [requestStatus, setRequestStatus] = useState(null);
    const [isImageMarkedForDeletion, setIsImageMarkedForDeletion] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);

    const [collegeLogo, setCollegeLogo] = useState(defaultCollegeLogo);
    const [tempCollegeLogo, setTempCollegeLogo] = useState(null);
    const [selectedLogoFile, setSelectedLogoFile] = useState(null);
    const [isLogoUploading, setIsLogoUploading] = useState(false);
    const [isLogoUploadSuccess, setIsLogoUploadSuccess] = useState(false);
    const [isImageRotated, setIsImageRotated] = useState(false);
    const [isLogoMarkedForDeletion, setIsLogoMarkedForDeletion] = useState(false);

    // Add these new state variables after your existing useState declarations
    const [tempProfileImage, setTempProfileImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [departments, setDepartments] = useState([
        '-', 'CSE', 'ECE', 'EEE', 'IT', 'CSD', 'CAI', 'MECH', 'CIVIL', 'CAI&ML', 'CML', 'Other'
    ]);
    const [years, setYears] = useState([
        '-', '1st Year', '2nd Year', '3rd Year', '4th Year'
    ]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(currentUser => {
            if (currentUser) {
                const studentRef = ref(database, `Users/Students/${currentUser.uid}`);
                onValue(studentRef, snapshot => {
                    const studentData = snapshot.val();
                    if (studentData && studentData.email === currentUser.email) {
                        setUserDetails({
                            fullname: studentData.fullname,
                            role: 'Student',
                            email: studentData.email,
                            collegeName: studentData.collegeName || '-',
                            phoneNumber: studentData.phoneNumber || '-',
                            location: studentData.location || '-',
                            profileImg: studentData.profileImg || defaultProfileImage,
                            collegeLogo: studentData.collegeLogo || defaultCollegeLogo,
                            verifiedIcon: blueVerifiedIcon,
                            department: studentData.department || '-',
                            year: studentData.year || '-',
                        });
                        setProfileImage(studentData.profileImg || defaultProfileImage);
                        setCollegeLogo(studentData.collegeLogo || defaultCollegeLogo);
                        setPreviousCollegeName(studentData.collegeName);

                        setEditedDetails({
                            fullname: studentData.fullname,
                            collegeName: studentData.collegeName,
                            phoneNumber: studentData.phoneNumber,
                            location: studentData.location,
                            department: studentData.department || '-',
                            year: studentData.year || '-',
                        });
                    }
                });

                const collegeRef = ref(database, `Users/College/${currentUser.uid}`);
                onValue(collegeRef, snapshot => {
                    const collegeData = snapshot.val();
                    if (collegeData && collegeData.collegeEmail === currentUser.email) {
                        setUserDetails({
                            fullname: collegeData.facultyName,
                            role: 'College Representative',
                            email: collegeData.collegeEmail,
                            collegeName: collegeData.collegeName,
                            phoneNumber: collegeData.phoneNumber || '-',
                            location: collegeData.location || '-',
                            collegeLogo: collegeData.collegeLogo || defaultCollegeLogo,
                            profileImg: collegeData.profileImg || defaultProfileImage,
                            verifiedIcon: goldVerifiedIcon
                        });
                        setProfileImage(collegeData.profileImg || defaultProfileImage);
                        setCollegeLogo(collegeData.collegeLogo || defaultCollegeLogo);
                    }
                });



                const collegesRef = ref(database, 'Users/College');
                onValue(collegesRef, snapshot => {
                    const collegesData = snapshot.val();
                    if (collegesData) {
                        const names = ['-', ...Object.values(collegesData)
                            .filter(college => !college.superAdmin)
                            .map(college => college.collegeName)];
                        setCollegeNames(names);
                    }
                });

                const requestsRef = ref(database, 'CollegeChangeRequest');
                onValue(requestsRef, snapshot => {
                    const requestsData = snapshot.val();
                    if (requestsData) {
                        let foundRequest = false;
                        Object.entries(requestsData).forEach(([key, request]) => {
                            if (request.email === currentUser.email) {
                                foundRequest = true;
                                setRequestStatus(request.status);
                                setCurrentRequestId(key);

                                if (request.status === 'accepted') {
                                    const studentRef = ref(database, `Users/Students/${currentUser.uid}`);
                                    update(studentRef, {
                                        collegeName: request.collegeName
                                    }).then(() => {
                                        remove(ref(database, `CollegeChangeRequest/${key}`));
                                        setRequestStatus(null);
                                        setCurrentRequestId(null);
                                        setPreviousCollegeName(request.collegeName);
                                    });
                                } else if (request.status === 'rejected') {
                                    remove(ref(database, `CollegeChangeRequest/${key}`));
                                    setRequestStatus(null);
                                    setCurrentRequestId(null);
                                    // Optionally, add a notification about the rejected request
                                }
                            }
                        });

                        if (!foundRequest) {
                            setRequestStatus(null);
                            setCurrentRequestId(null);
                        }
                    }
                });
            } else {
                setUserDetails(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleCollegeLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedLogoFile(file);
            // Create a temporary URL for preview
            const tempUrl = URL.createObjectURL(file);
            setTempCollegeLogo(tempUrl);
        }
    };

    const handleEditToggle = () => {
        setEditMode(!editMode);
        if (!editMode) {
            setEditedDetails({
                fullname: userDetails.fullname,
                collegeName: userDetails.collegeName || '-', // Add this line
                phoneNumber: userDetails.phoneNumber || '',  // Changed to empty string
                location: userDetails.location || '',
                department: userDetails.department || '-',
                year: userDetails.year || '-',
            });
        } else {
            // Reset all temporary states when canceling edit
            setTempProfileImage(null);
            setSelectedFile(null);
            setIsImageMarkedForDeletion(false);
            setTempCollegeLogo(null);
            setSelectedLogoFile(null);
            setIsLogoMarkedForDeletion(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails(prevDetails => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const hasChanges = () => {
        // Check if image was changed
        if (selectedFile || isImageMarkedForDeletion) return true;

        // Check if any field was changed
        return Object.keys(editedDetails).some(key => {
            const currentValue = userDetails[key] || '';
            const editedValue = editedDetails[key] || '';
            return currentValue !== editedValue;
        });
    };

    const handleSave = async () => {
        // Validate the "Name" field
        if (!editedDetails.fullname || editedDetails.fullname.trim() === '') {
            alert('Name field cannot be empty.');
            return;
        }

        // Check if any changes were made
        if (!hasChanges()) {
            setEditMode(false);
            return;
        }

        setIsUploading(true);

        let logoUrl = collegeLogo;

        if (isLogoMarkedForDeletion) {
            // Explicitly set logoUrl to null when deletion is marked
            logoUrl = null;
        } else if (selectedLogoFile) {
            setIsLogoUploading(true);
            try {
                logoUrl = await uploadImageToImgbb(selectedLogoFile);

                // Update collegeLogo in database
                const userRef = ref(database, `Users/${userDetails.role === 'Student' ? 'Students' : 'College'}/${auth.currentUser.uid}`);
                await update(userRef, {
                    collegeLogo: logoUrl
                });

                setIsLogoUploadSuccess(true);
                setTimeout(() => setIsLogoUploadSuccess(false), 2000);
            } catch (error) {
                console.error('Error uploading college logo:', error);
                alert('Failed to upload college logo');
            } finally {
                setIsLogoUploading(false);
            }
        }

        try {
            let imageUrl = profileImg;


            // Handle image changes
            if (isImageMarkedForDeletion) {
                imageUrl = defaultProfileImage;
            } else if (selectedFile) {
                imageUrl = await uploadImageToImgbb(selectedFile);
            }

            const previousCollegeName = userDetails.collegeName || '-';
            const newCollegeName = editedDetails.collegeName || '-';

            // Conditions to send a college change request
            const shouldSendCollegeChangeRequest =
                userDetails.role === 'Student' &&
                (
                    // Case 1: Changing from '-' to a specific college
                    (previousCollegeName === '-' && newCollegeName !== '-') ||
                    // Case 2: Changing from one specific college to another
                    (previousCollegeName !== '-' && newCollegeName !== '-' && previousCollegeName !== newCollegeName)
                );

            const shouldRemoveRequest =
                userDetails.role === 'Student' &&
                // Case 3: Changing to '-' from a specific college
                (previousCollegeName !== '-' && newCollegeName === '-');

            if (shouldSendCollegeChangeRequest) {
                if (currentRequestId) {
                    await remove(ref(database, `CollegeChangeRequest/${currentRequestId}`));
                }

                const requestRef = ref(database, 'CollegeChangeRequest');
                const newRequest = {
                    profileImg: imageUrl,
                    fullName: userDetails.fullname,
                    email: userDetails.email,
                    collegeName: newCollegeName,
                    previousCollegeName: previousCollegeName,
                    status: 'pending',
                    studentId: auth.currentUser.uid,
                    timestamp: Date.now()
                };

                try {
                    await push(requestRef, newRequest);
                    alert(`Request to change college from ${previousCollegeName} to ${newCollegeName} is pending.`);
                } catch (error) {
                    console.error('Error creating request:', error);
                    throw new Error('Failed to submit college change request');
                }
            } else if (shouldRemoveRequest && currentRequestId) {
                // Remove any existing request if changing to '-'
                await remove(ref(database, `CollegeChangeRequest/${currentRequestId}`));
                alert('College change request cancelled.');
            }

            // Only update fields that have changed
            const updates = {};

            if (logoUrl !== collegeLogo) {
                updates.collegeLogo = logoUrl;
            }


            Object.keys(editedDetails).forEach(key => {
                // Exclude college name update when changing to '-'
                if (key !== 'collegeName' &&
                    (key !== 'collegeName' ||
                        (previousCollegeName === '-' && newCollegeName !== '-') ||
                        (previousCollegeName !== '-' && newCollegeName !== '-' && previousCollegeName !== newCollegeName)) &&
                    editedDetails[key] !== userDetails[key]) {
                    updates[key] = editedDetails[key];
                }
            });

            // Add profile image to updates if it changed
            if (imageUrl !== profileImg) {
                updates.profileImg = imageUrl;
            }

            // Only proceed with update if there are changes
            if (Object.keys(updates).length > 0) {
                const userRef = ref(database, `Users/${userDetails.role === 'Student' ? 'Students' : 'College'}/${auth.currentUser.uid}`);
                await update(userRef, updates);
            }

            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Failed to update profile');
        } finally {
            setIsUploading(false);
            setEditMode(false);
        }

        setTempProfileImage(null);
        setSelectedFile(null);
        setIsImageMarkedForDeletion(false);
        setTempCollegeLogo(null);
        setSelectedLogoFile(null);
        setIsLogoMarkedForDeletion(false);
        setTempCollegeLogo(null);
        setSelectedLogoFile(null);
        setIsLogoMarkedForDeletion(false);

        if (isImageMarkedForDeletion) {
            alert('Profile picture has been deleted successfully');
        }
    };


    const handleDeleteImage = () => {
        const confirmDelete = window.confirm('Are you sure you want to mark this profile picture for deletion? The changes will take effect when you click Save.');
        if (confirmDelete) {
            setIsImageMarkedForDeletion(true);
            setTempProfileImage(defaultProfileImage);
        }
    };

    const handleDeleteCollegeLogo = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete the college logo?');
        if (confirmDelete) {
            setIsLogoMarkedForDeletion(true);
            setTempCollegeLogo(defaultCollegeLogo);
        }
    };

    const handleRotateImage = () => {
        setIsImageRotated(!isImageRotated);
    };

    const renderImageControls = () => {
        // If not in edit mode, don't show any controls
        if (!editMode) return null;

        // For students
        if (userDetails.role === 'Student') {
            return (
                <div className="image-controls">
                    {profileImg !== defaultProfileImage && !isImageMarkedForDeletion && (
                        <div
                            className="delete-image-button"
                            onClick={handleDeleteImage}
                            title="Delete profile picture"
                        >
                            🗑️
                        </div>
                    )}
                    <label htmlFor="profile-image-upload" className="profile-edit-icon">
                        <input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleProfileImageChange}
                        />
                        {isUploading ? (
                            <div className="loading-spinner-icon"></div>
                        ) : uploadSuccess ? (
                            <div className="tick-symbol">✔</div>
                        ) : (
                            <div className="pencil-icon">✏️</div>
                        )}
                    </label>
                </div>
            );
        }

        // For college representatives
        if (userDetails.role === 'College Representative') {
            return (
                <div className="image-controls">
                    {/* Controls for current displayed image */}
                    {isImageRotated ? (
                        // College Logo Controls
                        <>
                            {collegeLogo !== defaultCollegeLogo && !isLogoMarkedForDeletion && (
                                <div
                                    className="delete-logo-button"
                                    onClick={handleDeleteCollegeLogo}
                                    title="Delete college logo"
                                >
                                    🗑️
                                </div>
                            )}
                            <label htmlFor="college-logo-upload" className="logo-edit-icon">
                                <input
                                    type="file"
                                    id="college-logo-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleCollegeLogoChange}
                                />
                                {isLogoUploading ? (
                                    <div className="loading-spinner-icon"></div>
                                ) : isLogoUploadSuccess ? (
                                    <div className="tick-symbol">✔</div>
                                ) : (
                                    <div className="pencil-icon">✏️</div>
                                )}
                            </label>
                        </>
                    ) : (
                        // Profile Image Controls
                        <>
                            {profileImg !== defaultProfileImage && !isImageMarkedForDeletion && (
                                <div
                                    className="delete-image-button"
                                    onClick={handleDeleteImage}
                                    title="Delete profile picture"
                                >
                                    🗑️
                                </div>
                            )}
                            <label htmlFor="profile-image-upload" className="profile-edit-icon">
                                <input
                                    type="file"
                                    id="profile-image-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleProfileImageChange}
                                />
                                {isUploading ? (
                                    <div className="loading-spinner-icon"></div>
                                ) : uploadSuccess ? (
                                    <div className="tick-symbol">✔</div>
                                ) : (
                                    <div className="pencil-icon">✏️</div>
                                )}
                            </label>
                        </>
                    )}
                </div>
            );
        }

        return null;
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a temporary URL for preview
            const tempUrl = URL.createObjectURL(file);
            setTempProfileImage(tempUrl);
        }
    };

    return (
        <div className="account-details-wrapper">
            <div className="account-details-container">
                {userDetails ? (
                    <>
                        <div className="account-header">
                            <div className="account-info">
                                <div className="profile-image-wrapper">
                                    <img
                                        src={
                                            editMode && tempCollegeLogo
                                                ? tempCollegeLogo
                                                : (isImageRotated
                                                    ? (tempCollegeLogo || collegeLogo || defaultCollegeLogo)
                                                    : (tempProfileImage || profileImg))
                                        }
                                        alt={isImageRotated ? "College Logo" : "Profile"}
                                        className={`account-profile-image ${isImageRotated ? 'rotated-image' : ''}`}
                                        style={{ transform: 'none' }}
                                    />
                                    {renderImageControls()}

                                    {userDetails.role === 'College Representative' && (
                                        <div
                                            className="rotation-button"
                                            onClick={handleRotateImage}
                                            title={isImageRotated ? "Show Profile Picture" : "Show College Logo"}
                                        >
                                            🔄
                                        </div>
                                    )}
                                </div>
                                <div className="user-info">
                                    <h2 style={{ marginBottom: '3px' }}>{userDetails.fullname}</h2>
                                    {userDetails.role === 'Student' && <p>{userDetails.email}</p>}
                                    <p>
                                        {userDetails.role}{' '}
                                        <img
                                            src={userDetails.verifiedIcon}
                                            alt="verified"
                                            className="account-verified-icon"
                                        />
                                    </p>
                                </div>
                            </div>
                            <h1 className="event-mania-title">EventMania</h1>
                        </div>
                        <div className="account-details-grid">
                            <div className="account-detail-row">
                                <div className="account-detail-column">
                                    <strong>Name:</strong>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="fullname"
                                            value={editedDetails.fullname}
                                            onChange={handleInputChange}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={userDetails.fullname}
                                            disabled
                                        />
                                    )}
                                </div>
                                {userDetails.role === 'Student' ? (
                                    <>
                                        <div className="account-detail-column">
                                            <strong>Department:</strong>
                                            {editMode && userDetails.department === '-' ? (
                                                <select
                                                    name="department"
                                                    value={editedDetails.department}
                                                    onChange={handleInputChange}
                                                >
                                                    {departments.map((department) => (
                                                        <option key={department} value={department}>
                                                            {department}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" value={userDetails.department} disabled />
                                            )}
                                        </div>
                                        <div className="account-detail-column">
                                            <strong>Year:</strong>
                                            {editMode && userDetails.year === '-' ? (
                                                <select
                                                    name="year"
                                                    value={editedDetails.year}
                                                    onChange={handleInputChange}
                                                >
                                                    {years.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input type="text" value={userDetails.year} disabled />
                                            )}
                                        </div>

                                    </>
                                ) : (
                                    <>
                                        <div className="account-detail-row">
                                            <div className="account-detail-column">
                                                <strong>Role:</strong>
                                                <input
                                                    type="text"
                                                    value={userDetails.role}
                                                    disabled
                                                />
                                            </div>
                                            <div className="account-detail-column">
                                                <strong>Email:</strong>
                                                <input
                                                    type="email"
                                                    value={userDetails.email}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="account-detail-row">
                                <div className="account-detail-column">
                                    <strong>College Name:</strong>
                                    {editMode && userDetails.role === 'Student' ? (
                                        <select
                                            name="collegeName"
                                            value={editedDetails.collegeName || '-'}
                                            onChange={handleInputChange}
                                        >
                                            {collegeNames.map(name => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={requestStatus === 'pending' ?
                                                `${previousCollegeName} (Change Pending)` :
                                                userDetails.collegeName
                                            }
                                            disabled
                                        />
                                    )}
                                </div>
                                <div className="account-detail-column">
                                    <strong>Phone Number:</strong>
                                    {editMode ? (
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={editedDetails.phoneNumber || ''}  // Use empty string in edit mode
                                            onChange={handleInputChange}
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <input
                                            type="tel"
                                            value={userDetails.phoneNumber || '-'}  // Show '-' when disabled and empty
                                            disabled
                                        />
                                    )}
                                </div>
                                <div className="account-detail-column">
                                    <strong>Location:</strong>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="location"
                                            value={editedDetails.location || ''}  // Use empty string in edit mode
                                            onChange={handleInputChange}
                                            placeholder="Enter location"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={userDetails.location || '-'}  // Show '-' when disabled and empty
                                            disabled
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="account-detail-row">
                                {editMode ? (
                                    <div className="account-actions">
                                        <button className="save-button" onClick={handleSave}>
                                            Save
                                        </button>
                                        <button className="cancel-button" onClick={handleEditToggle}>
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button className="edit-button" onClick={handleEditToggle}>
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading user details...</p>
                )}
            </div>
        </div>
    );
};

export default AccountDetails;