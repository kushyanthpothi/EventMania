'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { PageLoader } from '../components/common/Loader';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { showToast } from '../components/common/Toast';
import { USER_ROLES, COLLECTIONS } from '../lib/utils/constants';
import { queryDocuments, getDocument, updateDocument } from '../lib/firebase/firestore';
import { uploadImage } from '../lib/imgbb/upload';
import {
    IoCalendar, IoPeople, IoTrophy, IoCheckmarkCircle, IoTimeOutline,
    IoAddCircle, IoSchool, IoAlertCircle, IoHourglass, IoMail, IoLocation,
    IoPerson, IoGlobe, IoIdCard, IoBusiness, IoShieldCheckmark, IoCall,
    IoPencil, IoCheckmark, IoClose, IoCamera, IoArrowForward
} from 'react-icons/io5';
import Link from 'next/link';
import { motion } from 'framer-motion';

// --- Profile Helper Components ---
const InfoCard = ({ icon: Icon, label, value, subLabel, className = "" }) => (
    <div className={`card-theme p-4 rounded-xl shadow-sm transition-colors duration-300 ${className}`}>
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
                <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-lg">
                    <Icon size={20} />
                </div>
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-xs font-medium text-theme-secondary mb-0.5">{label}</p>
                <h4 className="text-base font-bold text-theme truncate">{value || 'Not provided'}</h4>
                {subLabel && <p className="text-[10px] text-theme-secondary/70 mt-0.5">{subLabel}</p>}
            </div>
        </div>
    </div>
);

const RoleBadge = ({ role }) => {
    const config = {
        [USER_ROLES.SUPER_ADMIN]: { label: 'Super Administrator', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
        [USER_ROLES.COLLEGE_ADMIN]: { label: 'College Admin', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
        [USER_ROLES.COMPANY]: { label: 'Company Partner', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
        [USER_ROLES.STUDENT]: { label: 'Student', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    };
    const { label, color } = config[role] || config[USER_ROLES.STUDENT];

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
            {label}
        </span>
    );
};

const StatusBadge = ({ verified, approved }) => {
    if (verified || approved) {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                <IoCheckmarkCircle className="mr-1" size={14} /> Verified
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <IoTimeOutline className="mr-1" size={14} /> Pending
        </span>
    );
};

export default function DashboardPage() {
    const { user, userData, loading, refreshUser } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        createdEvents: [],
        pendingRequests: [],
        pendingEvents: [],
        studentRegistrations: [],
        collegeName: '',
        collegeLocation: ''
    });

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState({});
    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const fetchData = async () => {
        if (!user || !userData) return;

        if (userData.role === USER_ROLES.COLLEGE_ADMIN) {
            const { data: createdEvents } = await queryDocuments(COLLECTIONS.EVENTS, [
                { field: 'createdBy', operator: '==', value: user.uid }
            ]);
            const collegeId = `college_${user.uid}`;

            // Fetch college details directly from colleges collection
            const { data: collegeData } = await getDocument(COLLECTIONS.COLLEGES, collegeId);

            const { data: students } = await queryDocuments(COLLECTIONS.USERS, [
                { field: 'collegeId', operator: '==', value: collegeId },
                { field: 'role', operator: '==', value: USER_ROLES.STUDENT }
            ]);
            const pendingRequests = students?.filter(s => !s.verified) || [];
            const verifiedStudents = students?.filter(s => s.verified) || [];
            const pendingEvents = createdEvents?.filter(e => e.status === 'pending') || [];
            
            // Fetch total registrations for all events
            let totalRegistrations = 0;
            if (createdEvents && createdEvents.length > 0) {
                const eventIds = createdEvents.map(e => e.id);
                for (const eventId of eventIds) {
                    const { data: registrations } = await queryDocuments(COLLECTIONS.REGISTRATIONS, [
                        { field: 'eventId', operator: '==', value: eventId }
                    ]);
                    totalRegistrations += registrations?.length || 0;
                }
            }
            
            setStats({
                createdEvents: createdEvents || [],
                pendingRequests: pendingRequests || [],
                verifiedStudents: verifiedStudents || [],
                pendingEvents: pendingEvents,
                totalRegistrations: totalRegistrations,
                collegeName: collegeData?.name || userData?.collegeName,
                collegeLocation: collegeData?.location || userData?.collegeLocation
            });
        } else if (userData.role === USER_ROLES.STUDENT) {
            // Fetch student's registrations
            const { data: registrations } = await queryDocuments(COLLECTIONS.REGISTRATIONS, [
                { field: 'studentId', operator: '==', value: user.uid }
            ]);

            // Fetch college details if we have collegeId
            let collegeName = 'Unknown College';
            let collegeLocation = 'Unknown Location';
            if (userData.collegeId) {
                const { data: college } = await getDocument(COLLECTIONS.COLLEGES, userData.collegeId);
                if (college) {
                    collegeName = college.name;
                    collegeLocation = college.location;
                }
            }

            setStats(prev => ({
                ...prev,
                studentRegistrations: registrations || [],
                collegeName: collegeName,
                collegeLocation: collegeLocation
            }));
        } else if (userData.role === USER_ROLES.SUPER_ADMIN) {
            // Fetch all users for Super Admin stats
            const { data: allUsers } = await queryDocuments(COLLECTIONS.USERS);
            setStats(prev => ({
                ...prev,
                totalUsers: allUsers?.length || 0
            }));
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, userData]);

    const handleEditStart = () => {
        setEditData({
            name: userData.name || '',
            phoneNumber: userData.phoneNumber || '',
            registrationNumber: userData.registrationNumber || '',
            collegeName: stats.collegeName || userData.collegeName || '',
            collegeLocation: stats.collegeLocation || userData.collegeLocation || '',
            companyName: userData.companyName || '',
            companyWebsite: userData.companyWebsite || ''
        });
        setProfilePreview(userData.profileImg || null);
        setProfileFile(null);
        setIsEditing(true);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setProfileFile(null);
        setProfilePreview(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast.error("Image size too large (max 5MB)");
                return;
            }
            setProfileFile(file);
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let photoURL = userData.profileImg;

            // 1. Upload new profile pic if selected
            if (profileFile) {
                const { url, error } = await uploadImage(profileFile);
                if (error) throw new Error("Image upload failed: " + error);
                photoURL = url;
            }

            // 2. Prepare User Updates
            const userUpdates = {
                name: editData.name,
                phoneNumber: editData.phoneNumber,
                updatedAt: new Date()
            };

            if (photoURL !== userData.profileImg) {
                userUpdates.profileImg = photoURL;
            }

            if (userData.role === USER_ROLES.STUDENT) {
                userUpdates.registrationNumber = editData.registrationNumber;
            } else if (userData.role === USER_ROLES.COMPANY) {
                userUpdates.companyName = editData.companyName;
                userUpdates.companyWebsite = editData.companyWebsite;
            }

            // Update User Doc
            const { error: userError } = await updateDocument(COLLECTIONS.USERS, user.uid, userUpdates);
            if (userError) throw new Error(userError);

            // 3. Prepare College Updates (If College Admin)
            if (userData.role === USER_ROLES.COLLEGE_ADMIN) {
                const collegeId = `college_${user.uid}`;
                // Only update if changes were made
                const collegeUpdates = {};
                // Compare with current displayed stats to minimize writes? 
                // Just writing is safer to ensure sync.
                if (editData.collegeName) collegeUpdates.name = editData.collegeName;
                if (editData.collegeLocation) collegeUpdates.location = editData.collegeLocation;

                if (Object.keys(collegeUpdates).length > 0) {
                    const { error: collegeError } = await updateDocument(COLLECTIONS.COLLEGES, collegeId, collegeUpdates);
                    if (collegeError) throw new Error("Failed to update college details: " + collegeError);
                }
            }

            // Success
            showToast.success("Profile updated successfully!");
            setIsEditing(false);

            // Refresh user data to update UI instantly
            await refreshUser();
            // Re-fetch local dashboard stats
            fetchData();

        } catch (error) {
            console.error(error);
            showToast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pb-20">
                {/* 1. HERO & PROFILE SECTION (From Profile Page) */}
                <div className="relative h-80 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="card-theme rounded-3xl shadow-xl overflow-hidden mb-8 transition-colors duration-300 relative"
                    >
                        {/* Edit Toggle Button */}
                        <div className="absolute top-6 right-6 z-20">
                            <div className="flex gap-2">
                                {userData?.role === USER_ROLES.COLLEGE_ADMIN && !isEditing && (
                                    <Link
                                        href="/dashboard/events/create"
                                        className="p-2 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all flex items-center gap-2 px-4"
                                        title="Create Event"
                                    >
                                        <IoAddCircle size={20} />
                                        <span className="text-sm font-semibold">Create Event</span>
                                    </Link>
                                )}

                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleEditCancel}
                                            className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                            title="Cancel"
                                            disabled={isSaving}
                                        >
                                            <IoClose size={20} />
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="p-2 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                            title="Save Changes"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <IoHourglass size={20} className="animate-spin" /> : <IoCheckmark size={20} />}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleEditStart}
                                        className="p-2 rounded-full bg-theme-surface border border-theme hover:border-indigo-500/50 text-theme-secondary hover:text-indigo-500 transition-all"
                                        title="Edit Profile"
                                    >
                                        <IoPencil size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Profile Header */}
                        <div className="p-8 pb-0">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="flex-shrink-0 relative group">
                                    <div className="w-32 h-32 rounded-full border-4 border-theme shadow-2xl overflow-hidden bg-theme-surface ring-4 ring-indigo-500/20 relative">
                                        {(isEditing && profilePreview) || userData?.profileImg ? (
                                            <img src={isEditing ? profilePreview : userData.profileImg} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                                <IoPerson size={64} className="text-indigo-400" />
                                            </div>
                                        )}

                                        {/* Edit Overlay */}
                                        {isEditing && (
                                            <div
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <IoCamera size={32} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="flex-grow text-center md:text-left pt-2 w-full md:w-auto">
                                    {isEditing ? (
                                        <div className="mb-4 max-w-sm">
                                            <Input
                                                label="Full Name"
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="mb-0"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-3xl font-bold text-theme tracking-tight mb-2">
                                            {userData?.name}
                                        </h1>
                                    )}

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                        <RoleBadge role={userData?.role} />
                                        <StatusBadge verified={userData?.verified} approved={userData?.approvedBySuper} />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 text-theme-secondary text-sm font-medium">
                                        <div className="flex items-center">
                                            <IoMail className="mr-2 text-theme-secondary/70" size={16} />
                                            {userData?.email}
                                        </div>

                                        {/* Phone Number Logic */}
                                        {(isEditing || userData?.phoneNumber) && (
                                            <div className="flex items-center">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <IoCall className="text-theme-secondary/70" size={16} />
                                                        <input
                                                            type="text"
                                                            value={editData.phoneNumber}
                                                            onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                                            className="bg-transparent border-b border-theme focus:border-indigo-500 outline-none text-theme px-1 py-0.5 w-32"
                                                            placeholder="Phone Number"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <IoCall className="mr-2 text-theme-secondary/70" size={16} />
                                                        {userData?.phoneNumber}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {(userData?.role === USER_ROLES.COLLEGE_ADMIN) && (
                                            <div className="flex items-center">
                                                <IoLocation className="mr-2 text-theme-secondary/70" size={16} />
                                                {stats.collegeLocation || userData?.collegeLocation || 'Location not set'}
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <IoTimeOutline className="mr-2 text-theme-secondary/70" size={16} />
                                            Joined {userData?.createdAt?.toDate ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info Grid (Compact) */}
                        <div className="p-8 border-t border-theme mt-8 bg-theme-surface/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <InfoCard icon={IoMail} label="Email Address" value={userData?.email} />

                                {userData?.role === USER_ROLES.STUDENT && (
                                    <>
                                        {isEditing ? (
                                            <div className="card-theme p-4 rounded-xl shadow-sm">
                                                <Input
                                                    label="Registration Number"
                                                    value={editData.registrationNumber}
                                                    onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                                                />
                                            </div>
                                        ) : (
                                            <InfoCard icon={IoIdCard} label="Registration Number" value={userData?.registrationNumber} />
                                        )}

                                        {/* Student sees college name, usually cant edit unless we allow them to change specific fields, but standard logic implies read-only from college. 
                                            User prompt says "COLLEGE NAME... CAN BE EDITED". For student, this usually means correcting a text field if it was manual. 
                                            But since we fetch from COLLEGES collection, editing here wouldn't change the college doc. 
                                            We will keep it read-only for students to avoid confusion, or allow if it was stored on user doc. 
                                            Given current arch, Student collegeName is derived. We skip editing for Student College Name to prevent bugs. 
                                            Only College Admin can edit College Name.
                                        */}
                                        <InfoCard icon={IoSchool} label="College Name" value={stats.collegeName || 'Loading...'} />
                                        <InfoCard icon={IoLocation} label="College Location" value={stats.collegeLocation || 'Loading...'} />
                                    </>
                                )}

                                {userData?.role === USER_ROLES.COLLEGE_ADMIN && (
                                    <>
                                        {isEditing ? (
                                            <>
                                                <div className="card-theme p-4 rounded-xl shadow-sm">
                                                    <Input
                                                        label="College Name"
                                                        value={editData.collegeName}
                                                        onChange={(e) => setEditData({ ...editData, collegeName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="card-theme p-4 rounded-xl shadow-sm">
                                                    <Input
                                                        label="Campus Location"
                                                        value={editData.collegeLocation}
                                                        onChange={(e) => setEditData({ ...editData, collegeLocation: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <InfoCard icon={IoSchool} label="College Name" value={stats.collegeName || userData?.collegeName} />
                                                <InfoCard icon={IoLocation} label="Campus Location" value={stats.collegeLocation || userData?.collegeLocation} />
                                            </>
                                        )}
                                    </>
                                )}

                                {userData?.role === USER_ROLES.COMPANY && (
                                    <>
                                        {isEditing ? (
                                            <>
                                                <div className="card-theme p-4 rounded-xl shadow-sm">
                                                    <Input
                                                        label="Company Name"
                                                        value={editData.companyName}
                                                        onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="card-theme p-4 rounded-xl shadow-sm">
                                                    <Input
                                                        label="Website"
                                                        value={editData.companyWebsite}
                                                        onChange={(e) => setEditData({ ...editData, companyWebsite: e.target.value })}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <InfoCard icon={IoBusiness} label="Company Name" value={userData?.companyName} />
                                                <InfoCard icon={IoGlobe} label="Website" value={userData?.companyWebsite} />
                                            </>
                                        )}
                                    </>
                                )}

                                {userData?.role === USER_ROLES.SUPER_ADMIN && (
                                    <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 rounded-xl border border-indigo-500/30 flex items-center space-x-3 transition-all hover:shadow-md cursor-default">
                                        <div className="flex-shrink-0 bg-theme-card p-2 rounded-lg text-indigo-400 shadow-sm">
                                            <IoShieldCheckmark size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-base font-bold text-indigo-300 truncate">Admin Access</h4>
                                            <p className="text-xs text-indigo-400 truncate">System privileges active</p>
                                        </div>
                                    </div>
                                )}

                                {userData?.role === USER_ROLES.SUPER_ADMIN && (
                                    <Link href="/dashboard/users" className="block col-span-1">
                                        <div className="card-theme p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-indigo-500/30 h-full">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                                                    <IoPeople size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-theme-secondary truncate">Total Users</p>
                                                    <h4 className="text-xl font-bold text-theme truncate">{stats.totalUsers || 0}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. DASHBOARD WIDGETS & STATS (Below Profile) */}
                    <div className="space-y-8">
                        {/* Status Message (e.g., Pending Verification) - Keep this prominently displayed if relevant */}
                        {(!userData?.verified && !userData?.approvedBySuper && userData?.role !== USER_ROLES.SUPER_ADMIN) && (
                            <div className="bg-yellow-500/20 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg shadow-sm">
                                <div className="flex">
                                    <IoTimeOutline className="text-yellow-400 mt-0.5" size={20} />
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-300">
                                            {userData?.role === USER_ROLES.STUDENT
                                                ? 'Your account is pending verification by your college admin.'
                                                : 'Your account is pending approval by the super admin.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {userData?.verified || userData?.approvedBySuper || userData?.role === USER_ROLES.SUPER_ADMIN ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* --- STUDENT DASHBOARD --- */}
                                {userData?.role === USER_ROLES.STUDENT && (
                                    <div className="md:col-span-3">
                                        <div className="card-theme rounded-2xl shadow-lg transition-colors duration-300">
                                            <div className="p-8">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-theme">My Registrations</h3>
                                                        <p className="text-theme-secondary">Events you have signed up for</p>
                                                    </div>
                                                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                                                        <IoCalendar size={32} />
                                                    </div>
                                                </div>

                                                <div className="flex items-baseline mb-8">
                                                    <p className="text-5xl font-black text-indigo-500">
                                                        {stats.studentRegistrations?.length || 0}
                                                    </p>
                                                    <p className="ml-2 text-theme-secondary font-medium">events registered</p>
                                                </div>

                                                <div className="space-y-4">
                                                    {stats.studentRegistrations?.length > 0 ? (
                                                        stats.studentRegistrations.map((reg) => (
                                                            <div key={reg.id} className="flex items-center justify-between p-4 bg-theme-surface rounded-xl border border-theme hover:border-indigo-500/30 transition-colors">
                                                                <div>
                                                                    <h4 className="font-bold text-theme">{reg.eventName}</h4>
                                                                    <div className="flex items-center text-sm text-theme-secondary mt-1">
                                                                        <IoTimeOutline className="mr-1" />
                                                                        Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                                                                        {reg.isTeam && <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Team: {reg.teamName}</span>}
                                                                    </div>
                                                                </div>
                                                                <Link
                                                                    href={`/events/${reg.eventId}`}
                                                                    className="px-4 py-2 card-theme border border-theme text-theme rounded-lg text-sm font-semibold hover:border-indigo-500/50 hover:text-indigo-500 transition-colors"
                                                                >
                                                                    View Event
                                                                </Link>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 bg-theme-surface rounded-xl border border-dashed border-theme">
                                                            <p className="text-theme-secondary mb-4">You haven't registered for any events yet.</p>
                                                            <Link
                                                                href="/events"
                                                                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                                            >
                                                                Browse Events
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- COLLEGE ADMIN DASHBOARD --- */}
                                {userData?.role === USER_ROLES.COLLEGE_ADMIN && (
                                    <>
                                        {/* Events List */}
                                        <Link href="/dashboard/events" className="card-theme rounded-2xl shadow-lg transition-colors duration-300 md:col-span-1 block hover:border-indigo-500/30">
                                            <div className="p-6 h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                                            <IoCalendar size={20} />
                                                        </div>
                                                        <h3 className="font-bold text-theme">My Events</h3>
                                                    </div>
                                                    <IoArrowForward className="text-theme-secondary" size={20} />
                                                </div>

                                                <div className="flex items-baseline mb-4">
                                                    <p className="text-5xl font-black text-indigo-500">
                                                        {stats.createdEvents.length}
                                                    </p>
                                                    <p className="ml-2 text-theme-secondary font-medium">events</p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div className="bg-theme-surface rounded-lg p-2">
                                                        <p className="text-xs text-theme-secondary">Approved</p>
                                                        <p className="text-lg font-bold text-green-400">
                                                            {stats.createdEvents.filter(e => e.status === 'approved').length}
                                                        </p>
                                                    </div>
                                                    <div className="bg-theme-surface rounded-lg p-2">
                                                        <p className="text-xs text-theme-secondary">Pending</p>
                                                        <p className="text-lg font-bold text-yellow-400">
                                                            {stats.createdEvents.filter(e => e.status === 'pending').length}
                                                        </p>
                                                    </div>
                                                    <div className="bg-theme-surface rounded-lg p-2">
                                                        <p className="text-xs text-theme-secondary">Rejected</p>
                                                        <p className="text-lg font-bold text-red-400">
                                                            {stats.createdEvents.filter(e => e.status === 'rejected').length}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Students Card */}
                                        <Link href="/dashboard/users" className="card-theme rounded-2xl shadow-lg transition-colors duration-300 md:col-span-1 block hover:border-indigo-500/30">
                                            <div className="p-6 h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                                            <IoPeople size={20} />
                                                        </div>
                                                        <h3 className="font-bold text-theme">Students</h3>
                                                    </div>
                                                    <IoArrowForward className="text-theme-secondary" size={20} />
                                                </div>

                                                <div className="flex items-baseline mb-4">
                                                    <p className="text-5xl font-black text-green-500">
                                                        {stats.verifiedStudents?.length || 0}
                                                    </p>
                                                    <p className="ml-2 text-theme-secondary font-medium">verified</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-center">
                                                    <div className="bg-theme-surface rounded-lg p-2">
                                                        <p className="text-xs text-theme-secondary">Verified</p>
                                                        <p className="text-lg font-bold text-green-400">
                                                            {stats.verifiedStudents?.length || 0}
                                                        </p>
                                                    </div>
                                                    <div className="bg-theme-surface rounded-lg p-2">
                                                        <p className="text-xs text-theme-secondary">Pending</p>
                                                        <p className="text-lg font-bold text-yellow-400">
                                                            {stats.pendingRequests?.length || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Event Registrations */}
                                        <Link href="/dashboard/registrations" className="card-theme rounded-2xl shadow-lg transition-colors duration-300 md:col-span-1 block hover:border-indigo-500/30">
                                            <div className="p-6 h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                                            <IoCheckmarkCircle size={20} />
                                                        </div>
                                                        <h3 className="font-bold text-theme">Event Registrations</h3>
                                                    </div>
                                                    <IoArrowForward className="text-theme-secondary" size={20} />
                                                </div>

                                                <div className="flex items-baseline mb-4">
                                                    <p className="text-5xl font-black text-purple-500">
                                                        {stats.totalRegistrations || 0}
                                                    </p>
                                                    <p className="ml-2 text-theme-secondary font-medium">registrations</p>
                                                </div>

                                                <p className="text-sm text-theme-secondary">
                                                    View all registrations across your events
                                                </p>
                                            </div>
                                        </Link>
                                    </>
                                )}

                                {/* --- SUPER ADMIN DASHBOARD --- */}
                                {userData?.role === USER_ROLES.SUPER_ADMIN && (
                                    <div className="md:col-span-1">
                                        <div className="card-theme rounded-2xl shadow-lg transition-colors duration-300">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-theme">Pending Approvals</h3>
                                                    <IoCheckmarkCircle className="text-green-500" size={24} />
                                                </div>
                                                <p className="text-3xl font-bold text-theme mb-2">0</p>
                                                <p className="text-sm text-theme-secondary">Items awaiting review</p>
                                                <Link
                                                    href="/dashboard/approvals"
                                                    className="mt-4 block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    Review Approvals
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

