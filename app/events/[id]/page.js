'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { PageLoader } from '../../components/common/Loader';
import { Button } from '../../components/common/Button';
import { getDocument, queryDocuments, updateDocument } from '../../lib/firebase/firestore';
import { COLLECTIONS, USER_ROLES, EVENT_STATUS } from '../../lib/utils/constants';
import { formatDate, isEventOngoing } from '../../lib/utils/helpers';
import { IoCalendar, IoLocation, IoArrowBack, IoPeople, IoTime, IoSchool, IoCheckmarkCircle, IoCloseCircle, IoPencil, IoLink } from 'react-icons/io5';
import { showToast } from '../../components/common/Toast';
import Link from 'next/link';

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userData } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [collegeName, setCollegeName] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const fetchEventAndCollege = async () => {
            if (!params.id) return;
            try {
                // 1. Fetch Event
                const { data: eventData, error: eventError } = await getDocument(COLLECTIONS.EVENTS, params.id);
                if (eventError) throw new Error(eventError);
                setEvent(eventData);

                // 2. Fetch College Name if collegeId exists
                if (eventData.collegeId) {
                    const { data: collegeData, error: collegeError } = await getDocument(COLLECTIONS.COLLEGES, eventData.collegeId);
                    if (collegeData) {
                        setCollegeName(collegeData.name);
                    } else if (collegeError) {
                        console.error("Error fetching college:", collegeError);
                    }
                }

                // 3. Check if current user is registered (if student)
                if (user && userData?.role === USER_ROLES.STUDENT) {
                    const { data: registrations } = await queryDocuments(COLLECTIONS.REGISTRATIONS, [
                        { field: 'eventId', operator: '==', value: params.id },
                        { field: 'studentId', operator: '==', value: user.uid }
                    ]);
                    if (registrations && registrations.length > 0) {
                        setIsRegistered(true);
                    }
                }

            } catch (error) {
                console.error("Error fetching event details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user !== undefined) { // Wait for auth to be determined
            fetchEventAndCollege();
        }
    }, [params.id, user, userData]);

    if (loading) return <PageLoader />;
    if (!event) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-theme transition-colors duration-300">
            <h1 className="text-2xl font-bold text-theme">Event not found</h1>
            <button onClick={() => router.back()} className="text-indigo-500 mt-4 hover:underline">← Go Back</button>
        </div>
    );

    const isStudent = userData?.role === USER_ROLES.STUDENT;
    const isLive = isEventOngoing(event.startDate, event.endDate);
    const hasLiveLink = event.liveLink && event.liveLink.trim() !== '';

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow">
                {/* Hero Section with Banner */}
                <div className="relative h-96 w-full bg-slate-900">
                    {event.posterUrl ? (
                        <>
                            <img
                                src={event.posterUrl}
                                alt={event.name}
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900 opacity-90" />
                    )}

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                        <div className="w-full">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <button onClick={() => router.back()} className="flex items-center text-white/80 hover:text-white transition-colors">
                                    <IoArrowBack className="mr-2" /> Go Back
                                </button>

                                {isLive && (
                                    <div className="relative">
                                        {/* Glowing background effect */}
                                        <div className="absolute inset-0 bg-red-500 rounded-lg blur-sm opacity-60 animate-pulse"></div>

                                        {/* Main badge */}
                                        <span className="relative px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xl flex items-center gap-1.5 overflow-hidden"
                                            style={{
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
                                            }}>
                                            {/* Animated shine effect */}
                                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>

                                            {/* Pulsing dot */}
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                            </span>

                                            <span className="relative font-extrabold tracking-wider">LIVE</span>
                                        </span>
                                    </div>
                                )}

                                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-semibold">
                                    {event.category}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-white/90">
                                <span className="flex items-center">
                                    <IoSchool className="mr-2" /> {collegeName || event.collegeName || 'Unknown College'}
                                </span>
                                <span className="flex items-center">
                                    <IoPeople className="mr-2" /> {event.type === 'inter' ? 'Open to All' : 'Internal Event'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="card-theme rounded-2xl p-8 shadow-sm transition-colors duration-300">
                                <h2 className="text-2xl font-bold text-theme mb-4">About the Event</h2>
                                <p className="text-theme-secondary whitespace-pre-line leading-relaxed">
                                    {event.description}
                                </p>

                                {hasLiveLink && (
                                    <div className="mt-6 pt-6 border-t border-theme">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-theme-secondary font-medium mb-1">Event Link</p>
                                                <p className="text-theme text-sm break-all">{event.liveLink}</p>
                                            </div>
                                            <a
                                                href={event.liveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-4 flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold whitespace-nowrap"
                                            >
                                                <IoLink size={18} />
                                                Visit
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {event.isTeam && (
                                <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-500/30 flex items-start">
                                    <IoPeople className="text-blue-400 mt-1 mr-4" size={24} />
                                    <div>
                                        <h3 className="font-semibold text-blue-300">Team Event</h3>
                                        <p className="text-blue-400 text-sm mt-1">
                                            This is a team-based event. You can register a team of up to {event.teamCount} members.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="card-theme rounded-2xl p-6 shadow-lg sticky top-24 transition-colors duration-300">
                                <h3 className="text-xl font-bold text-theme mb-6">Event Details</h3>

                                <div className="space-y-6 mb-8">
                                    <div className="flex items-start">
                                        <div className="bg-indigo-500/20 p-3 rounded-lg mr-4">
                                            <IoCalendar className="text-indigo-400" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-theme-secondary font-medium mb-2">Date & Time</p>

                                            {/* Start Date & Time */}
                                            <div className="mb-3">
                                                <p className="text-theme font-semibold text-base">
                                                    {formatDate(event.startDate, 'PPP')} • {new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>

                                            {/* End Date & Time */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-theme-secondary">to</span>
                                                <p className="text-theme-secondary text-sm">
                                                    {formatDate(event.endDate, 'PPP')} • {new Date(event.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-pink-500/20 p-3 rounded-lg mr-4">
                                            <IoLocation className="text-pink-400" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-theme-secondary font-medium">Venue</p>
                                            <p className="text-theme font-semibold">{event.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {isLive && hasLiveLink ? (
                                    <a
                                        href={event.liveLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-4 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        🔴 JOIN LIVE EVENT
                                    </a>
                                ) : isStudent ? (
                                    isRegistered ? (
                                        <Button
                                            className="w-full py-4 text-lg bg-green-600 hover:bg-green-700 cursor-default"
                                            disabled
                                        >
                                            Registered
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => router.push(`/events/${event.id}/register`)}
                                            className="w-full py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                                        >
                                            Register Now
                                        </Button>
                                    )
                                ) : userData?.role === USER_ROLES.SUPER_ADMIN && event.status === 'pending' ? (
                                    <div className="space-y-3">
                                        <p className="text-center text-theme-secondary text-sm mb-4">This event is pending your approval</p>
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await updateDocument(COLLECTIONS.EVENTS, event.id, {
                                                        status: EVENT_STATUS.APPROVED,
                                                        approvedAt: new Date().toISOString(),
                                                        approvedBy: user.uid
                                                    });
                                                    showToast.success('Event approved successfully!');
                                                    router.back();
                                                } catch (error) {
                                                    showToast.error('Failed to approve event');
                                                }
                                            }}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700"
                                        >
                                            <IoCheckmarkCircle className="mr-2" size={20} /> Approve Event
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                const reason = prompt('Please enter the reason for rejection (optional):');
                                                try {
                                                    await updateDocument(COLLECTIONS.EVENTS, event.id, {
                                                        status: EVENT_STATUS.REJECTED,
                                                        rejectedAt: new Date().toISOString(),
                                                        rejectedBy: user.uid,
                                                        rejectionReason: reason || 'No reason provided'
                                                    });
                                                    showToast.success('Event rejected.');
                                                    router.back();
                                                } catch (error) {
                                                    showToast.error('Failed to reject event');
                                                }
                                            }}
                                            className="w-full py-3 bg-red-600 hover:bg-red-700"
                                        >
                                            <IoCloseCircle className="mr-2" size={20} /> Reject Event
                                        </Button>
                                    </div>
                                ) : userData?.role === USER_ROLES.COLLEGE_ADMIN && event.createdBy === user.uid ? (
                                    <Button
                                        onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                                        className="w-full py-4 text-lg bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <IoPencil size={20} />
                                        Edit Event
                                    </Button>
                                ) : (
                                    <div className="bg-theme-surface p-4 rounded-xl text-center text-theme-secondary text-sm">
                                        {!user ? (
                                            <>Please <Link href="/login" className="text-indigo-500 font-semibold hover:underline">login as a student</Link> to register.</>
                                        ) : userData?.role === USER_ROLES.SUPER_ADMIN ? (
                                            "You are viewing as Super Admin."
                                        ) : userData?.role === USER_ROLES.COLLEGE_ADMIN ? (
                                            "You are viewing as College Admin."
                                        ) : (
                                            "Registration available for students only."
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

