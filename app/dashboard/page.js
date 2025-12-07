'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { PageLoader } from '../components/common/Loader';
import { Card } from '../components/common/Card';
import { USER_ROLES, COLLECTIONS } from '../lib/utils/constants';
import { queryDocuments, getDocument } from '../lib/firebase/firestore';
import {
    IoCalendar, IoPeople, IoTrophy, IoCheckmarkCircle, IoTimeOutline,
    IoAddCircle, IoSchool, IoAlertCircle, IoHourglass, IoMail, IoLocation,
    IoPerson, IoGlobe, IoIdCard, IoBusiness, IoShieldCheckmark
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
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        createdEvents: [],
        pendingRequests: [],
        pendingEvents: [],
        studentRegistrations: []
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !userData) return;

            if (userData.role === USER_ROLES.COLLEGE_ADMIN) {
                const { data: createdEvents } = await queryDocuments(COLLECTIONS.EVENTS, [
                    { field: 'createdBy', operator: '==', value: user.uid }
                ]);
                const collegeId = `college_${user.uid}`;
                const { data: students } = await queryDocuments(COLLECTIONS.USERS, [
                    { field: 'collegeId', operator: '==', value: collegeId },
                    { field: 'role', operator: '==', value: USER_ROLES.STUDENT }
                ]);
                const pendingRequests = students?.filter(s => !s.verified) || [];
                const pendingEvents = createdEvents?.filter(e => e.status === 'pending') || [];
                setStats({
                    createdEvents: createdEvents || [],
                    pendingRequests: pendingRequests || [],
                    pendingEvents: pendingEvents
                });
            } else if (userData.role === USER_ROLES.STUDENT) {
                // Fetch student's registrations
                const { data: registrations } = await queryDocuments(COLLECTIONS.REGISTRATIONS, [
                    { field: 'studentId', operator: '==', value: user.uid }
                ]);

                // Fetch college name if we have collegeId
                let collegeName = 'Unknown College';
                if (userData.collegeId) {
                    const { data: college } = await getDocument(COLLECTIONS.COLLEGES, userData.collegeId);
                    if (college) {
                        collegeName = college.name;
                    }
                }

                setStats(prev => ({
                    ...prev,
                    studentRegistrations: registrations || [],
                    collegeName: collegeName
                }));
            }
        };

        fetchDashboardData();
    }, [user, userData]);

    if (loading) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pb-20">
                {/* 1. HERO & PROFILE SECTION (From Profile Page) */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="card-theme rounded-3xl shadow-xl overflow-hidden mb-8 transition-colors duration-300"
                    >
                        {/* Profile Header */}
                        <div className="p-8 pb-0">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 rounded-full border-4 border-theme shadow-2xl overflow-hidden bg-theme-surface ring-4 ring-indigo-500/20">
                                        {userData?.profileImg ? (
                                            <img src={userData.profileImg} alt={userData.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                                <IoPerson size={64} className="text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-grow text-center md:text-left pt-2">
                                    <h1 className="text-3xl font-bold text-theme tracking-tight mb-2">
                                        {userData?.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                        <RoleBadge role={userData?.role} />
                                        <StatusBadge verified={userData?.verified} approved={userData?.approvedBySuper} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 text-theme-secondary text-sm font-medium">
                                        <div className="flex items-center">
                                            <IoMail className="mr-2 text-theme-secondary/70" size={16} />
                                            {userData?.email}
                                        </div>
                                        {userData?.role === USER_ROLES.COLLEGE_ADMIN && (
                                            <div className="flex items-center">
                                                <IoLocation className="mr-2 text-theme-secondary/70" size={16} />
                                                {userData?.collegeLocation || 'Location not set'}
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
                                        <InfoCard icon={IoIdCard} label="Registration Number" value={userData?.registrationNumber} />
                                        <InfoCard icon={IoSchool} label="College Name" value={stats.collegeName || 'Loading...'} />
                                    </>
                                )}

                                {userData?.role === USER_ROLES.COLLEGE_ADMIN && (
                                    <>
                                        <InfoCard icon={IoSchool} label="College Name" value={userData?.collegeName} />
                                        <InfoCard icon={IoLocation} label="Campus Location" value={userData?.collegeLocation} />
                                    </>
                                )}

                                {userData?.role === USER_ROLES.COMPANY && (
                                    <>
                                        <InfoCard icon={IoBusiness} label="Company Name" value={userData?.companyName} />
                                        <InfoCard icon={IoGlobe} label="Website" value={userData?.companyWebsite} />
                                    </>
                                )}

                                {userData?.role === USER_ROLES.SUPER_ADMIN && (
                                    <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 rounded-xl border border-indigo-500/30 flex items-center space-x-3 md:col-span-1 lg:col-span-2">
                                        <div className="flex-shrink-0 bg-theme-card p-2 rounded-lg text-indigo-400 shadow-sm">
                                            <IoShieldCheckmark size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-indigo-300">System Administrator Access</h4>
                                            <p className="text-xs text-indigo-400">You have elevated privileges to manage the entire platform.</p>
                                        </div>
                                    </div>
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
                                        {/* Create Event Card */}
                                        <div className="card-theme rounded-2xl shadow-lg transition-colors duration-300">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-theme">Create Event</h3>
                                                    <IoTrophy className="text-pink-500" size={24} />
                                                </div>
                                                <p className="text-sm text-theme-secondary mb-4">
                                                    Organize amazing events for students
                                                </p>
                                                <Link
                                                    href="/dashboard/events/create"
                                                    className="block text-center bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
                                                >
                                                    Create New Event
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Events List */}
                                        <div className="card-theme rounded-2xl shadow-lg transition-colors duration-300 md:col-span-1">
                                            <div className="p-6 h-full">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                                        <IoCalendar size={20} />
                                                    </div>
                                                    <h3 className="font-bold text-theme">Events</h3>
                                                </div>
                                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                                    {stats.createdEvents.length > 0 ? (
                                                        stats.createdEvents.map(event => (
                                                            <div key={event.id} className="p-3 bg-theme-surface rounded-lg border border-theme">
                                                                <p className="font-semibold text-theme truncate">{event.name}</p>
                                                                <div className="flex justify-between items-center mt-1">
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                                        event.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                                            'bg-yellow-500/20 text-yellow-400'
                                                                        }`}>
                                                                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                                    </span>
                                                                    <span className="text-xs text-theme-secondary">{new Date(event.startDate).toLocaleDateString()}</span>
                                                                </div>
                                                                {event.status === 'rejected' && event.rejectionReason && (
                                                                    <p className="text-xs text-red-400 mt-2 bg-red-500/20 p-1.5 rounded">
                                                                        Reason: {event.rejectionReason}
                                                                    </p>
                                                                )}

                                                                {event.status === 'rejected' ? (
                                                                    <Link href={`/dashboard/events/${event.id}/edit`} className="block mt-3 text-center text-xs card-theme border border-orange-500/30 text-orange-400 py-1.5 rounded hover:bg-orange-500/10 transition-colors">
                                                                        Edit Event
                                                                    </Link>
                                                                ) : (
                                                                    <Link href={`/dashboard/events/${event.id}/registrations`} className="block mt-3 text-center text-xs card-theme border border-indigo-500/30 text-indigo-400 py-1.5 rounded hover:bg-indigo-500/10 transition-colors">
                                                                        View Registrations
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-theme-secondary text-sm italic">No events created yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pending Approvals (Students or Events) */}
                                        <div className="card-theme rounded-2xl shadow-lg transition-colors duration-300 md:col-span-1">
                                            <div className="p-6 h-full">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                                                        <IoPeople size={20} />
                                                    </div>
                                                    <h3 className="font-bold text-theme">Pending Requests</h3>
                                                </div>
                                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                                    {stats.pendingRequests.length > 0 ? (
                                                        stats.pendingRequests.map(req => (
                                                            <div key={req.uid} className="p-3 bg-theme-surface rounded-lg border border-theme flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-semibold text-sm text-theme">{req.name}</p>
                                                                    <p className="text-xs text-theme-secondary">{req.registrationNumber}</p>
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <Link href="/dashboard/verifications" className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                                                                        Review
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-theme-secondary text-sm italic">No pending requests.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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

