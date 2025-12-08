'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { PageLoader } from '../../components/common/Loader';
import { queryDocuments } from '../../lib/firebase/firestore';
import { COLLECTIONS, USER_ROLES } from '../../lib/utils/constants';
import { IoArrowBack, IoCalendar, IoPeople, IoEye } from 'react-icons/io5';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AllRegistrationsPage() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only College Admin should view this
        if (!authLoading && userData && userData.role !== USER_ROLES.COLLEGE_ADMIN) {
            router.push('/dashboard');
            return;
        }
    }, [userData, authLoading, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !userData) return;

            try {
                // 1. Fetch all events created by this admin
                const { data: createdEvents } = await queryDocuments(COLLECTIONS.EVENTS, [
                    { field: 'createdBy', operator: '==', value: user.uid }
                ]);

                if (!createdEvents || createdEvents.length === 0) {
                    setEvents([]);
                    setLoading(false);
                    return;
                }

                // 2. For each event, fetch registration count
                const eventsWithCounts = await Promise.all(
                    createdEvents.map(async (event) => {
                        const { data: registrations } = await queryDocuments(COLLECTIONS.REGISTRATIONS, [
                            { field: 'eventId', operator: '==', value: event.id }
                        ]);
                        return {
                            ...event,
                            registrationCount: registrations?.length || 0
                        };
                    })
                );

                setEvents(eventsWithCounts);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userData) {
            fetchData();
        }
    }, [user, userData]);

    if (loading || authLoading) return <PageLoader />;

    const totalRegistrations = events.reduce((sum, event) => sum + event.registrationCount, 0);

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/dashboard" className="inline-flex items-center text-theme-secondary hover:text-indigo-500 transition-colors mb-4">
                            <IoArrowBack className="mr-2" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-theme">Event Registrations</h1>
                        <p className="text-theme-secondary mt-1">
                            Total registrations: <span className="font-semibold text-purple-500">{totalRegistrations}</span> across {events.length} events
                        </p>
                    </div>

                    {/* Events Grid */}
                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card-theme rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 hover:shadow-xl border border-theme hover:border-purple-500/30"
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

                                        {/* Registration Count Badge */}
                                        <div className="absolute top-3 right-3">
                                            <div className="bg-purple-500/90 text-white px-3 py-2 rounded-full flex items-center gap-2">
                                                <IoPeople size={18} />
                                                <span className="font-bold">{event.registrationCount}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                event.status === 'approved' ? 'bg-green-500/90 text-white' :
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

                                        {/* View Details Button */}
                                        <Link
                                            href={`/dashboard/events/${event.id}/registrations`}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                                        >
                                            <IoEye size={18} />
                                            View Details ({event.registrationCount})
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 card-theme rounded-2xl">
                            <IoCalendar size={64} className="mx-auto text-theme-secondary mb-4" />
                            <h3 className="text-2xl font-bold text-theme mb-2">No Events Yet</h3>
                            <p className="text-theme-secondary mb-6">Create events to see registrations</p>
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
