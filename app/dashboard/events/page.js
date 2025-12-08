'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { PageLoader } from '../../components/common/Loader';
import { showToast } from '../../components/common/Toast';
import { USER_ROLES, COLLECTIONS, EVENT_STATUS } from '../../lib/utils/constants';
import { queryDocuments } from '../../lib/firebase/firestore';
import {
    IoCalendar, IoEye, IoPencil, IoArrowBack
} from 'react-icons/io5';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardEventsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user || !userData) return;

            if (userData.role === USER_ROLES.COLLEGE_ADMIN) {
                const { data: createdEvents } = await queryDocuments(COLLECTIONS.EVENTS, [
                    { field: 'createdBy', operator: '==', value: user.uid }
                ]);
                setEvents(createdEvents || []);
            }
            setFetching(false);
        };

        fetchEvents();
    }, [user, userData]);

    if (loading || fetching) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-20 pb-20">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-theme-secondary hover:text-theme mb-4 transition-colors"
                        >
                            <IoArrowBack className="mr-2" /> Back to Dashboard
                        </button>
                        <h1 className="text-4xl font-bold text-theme mb-2">My Events</h1>
                        <p className="text-theme-secondary">Manage all your created events</p>
                    </div>

                    {/* Events Grid */}
                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card-theme rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 hover:shadow-xl"
                                >
                                    {/* Event Poster */}
                                    <div className="relative h-48 overflow-hidden bg-theme-surface">
                                        {event.posterUrl ? (
                                            <img
                                                src={event.posterUrl}
                                                alt={event.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <IoCalendar size={48} className="text-theme-secondary" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'approved' ? 'bg-green-500/90 text-white' :
                                                    event.status === 'rejected' ? 'bg-red-500/90 text-white' :
                                                        'bg-yellow-500/90 text-white'
                                                }`}>
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Event Info */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-theme mb-2 truncate">{event.name}</h3>
                                        <p className="text-sm text-theme-secondary mb-4 line-clamp-2">{event.description}</p>

                                        <div className="flex items-center text-sm text-theme-secondary mb-4">
                                            <IoCalendar className="mr-2" />
                                            {new Date(event.startDate).toLocaleDateString()}
                                        </div>

                                        {event.status === 'rejected' && event.rejectionReason && (
                                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                                                <p className="text-xs text-red-400">
                                                    <strong>Rejection Reason:</strong> {event.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/events/${event.id}`}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                                            >
                                                <IoEye size={18} />
                                                View Details
                                            </Link>
                                            <Link
                                                href={`/dashboard/events/${event.id}/edit`}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 card-theme border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/10 transition-colors text-sm font-semibold"
                                            >
                                                <IoPencil size={18} />
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 card-theme rounded-2xl">
                            <IoCalendar size={64} className="mx-auto text-theme-secondary mb-4" />
                            <h3 className="text-2xl font-bold text-theme mb-2">No Events Yet</h3>
                            <p className="text-theme-secondary mb-6">Start by creating your first event</p>
                            <Link
                                href="/dashboard/events/create"
                                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Create Event
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
