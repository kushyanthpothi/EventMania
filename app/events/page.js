'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Dropdown } from '../components/common/Dropdown';
import { Input } from '../components/common/Input';
import { SkeletonList } from '../components/common/Loader';
import { queryDocuments } from '../lib/firebase/firestore';
import { COLLECTIONS, EVENT_STATUS, EVENT_CATEGORIES, EVENT_TYPES, USER_ROLES } from '../lib/utils/constants';
import { IoSearch } from 'react-icons/io5';
import { EventCard } from '../components/events/EventCard';
import { motion } from 'framer-motion';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        type: ''
    });

    const { user, userData } = useAuth();

    useEffect(() => {
        if (userData) {
            fetchEvents();
        } else {
            // If not logged in or no userData yet, maybe just fetch inter events? 
            // Or wait? The page might be accessible to public.
            // Let's fetch public events (Inter) by default.
            fetchEvents();
        }
    }, [user, userData]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // 1. Fetch ALL Inter-college events (Public)
            const { data: interEvents, error: interError } = await queryDocuments(COLLECTIONS.EVENTS, [
                { field: 'status', operator: '==', value: EVENT_STATUS.APPROVED },
                { field: 'type', operator: '==', value: EVENT_TYPES.INTER }
            ]);
            if (interError) console.error("Error fetching inter events:", interError);

            let allEvents = interEvents || [];

            // 2. If User is Student/Admin, Fetch their College's Intra-college events
            if (user && userData?.collegeId) {
                const { data: intraEvents, error: intraError } = await queryDocuments(COLLECTIONS.EVENTS, [
                    { field: 'status', operator: '==', value: EVENT_STATUS.APPROVED },
                    { field: 'type', operator: '==', value: EVENT_TYPES.INTRA },
                    { field: 'collegeId', operator: '==', value: userData.collegeId }
                ]);
                if (intraError) console.error("Error fetching intra events:", intraError);

                if (intraEvents) {
                    allEvents = [...allEvents, ...intraEvents];
                }
            } else if (user && userData?.role === USER_ROLES.COLLEGE_ADMIN) {
                // For College Admin, they are the college. 
                // Their collegeId is their uid (adminId) or stored in profile?
                // In signup: `userData.collegeName = ...`. The college doc ID is `college_${user.uid}`.
                const collegeId = `college_${user.uid}`;
                const { data: intraEvents, error: intraError } = await queryDocuments(COLLECTIONS.EVENTS, [
                    { field: 'status', operator: '==', value: EVENT_STATUS.APPROVED },
                    { field: 'type', operator: '==', value: EVENT_TYPES.INTRA },
                    { field: 'collegeId', operator: '==', value: collegeId }
                ]);
                if (intraEvents) {
                    allEvents = [...allEvents, ...intraEvents];
                }
            }

            // Remove duplicates just in case
            const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.id, item])).values());

            // Sort by start date (client side sort as we merged lists)
            uniqueEvents.sort((a, b) => {
                const dateA = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate);
                const dateB = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate);
                return dateA - dateB;
            });

            setEvents(uniqueEvents);

        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(event => {
        const title = event.title || '';
        const description = event.description || '';
        const matchesSearch = title.toLowerCase().includes(filters.search.toLowerCase()) ||
            description.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = !filters.category || event.category === filters.category;
        const matchesType = !filters.type || event.type === filters.type;
        return matchesSearch && matchesCategory && matchesType;
    });

    // Dynamic Category Logic
    const uniqueCategories = [
        ...new Set([
            ...Object.values(EVENT_CATEGORIES),
            ...events.map(event => event.category).filter(Boolean)
        ])
    ].sort();

    const categoryOptions = uniqueCategories.map(cat => ({
        value: cat,
        label: cat
    }));

    const typeOptions = [
        { value: EVENT_TYPES.INTRA, label: 'College Event' },
        { value: EVENT_TYPES.INTER, label: 'Global Event' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-20 pb-16">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-black text-theme mb-4"
                        >
                            All Events
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-theme-secondary font-medium"
                        >
                            Discover amazing events happening around you
                        </motion.p>
                    </div>

                    {/* Filters - Modern Control Bar */}
                    <div className="mx-auto max-w-screen-2xl mb-12">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="glass-effect shadow-xl rounded-2xl p-3 flex flex-col md:flex-row gap-4 items-center"
                        >
                            <div className="flex-grow w-full md:w-auto">
                                <Input
                                    placeholder="Search events by name or description..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    icon={<IoSearch className="text-indigo-500" />}
                                    className="border-0 bg-transparent shadow-none focus:ring-0 text-lg placeholder:text-theme-secondary"
                                />
                            </div>

                            <div className="h-8 w-px bg-theme-secondary/20 hidden md:block"></div>

                            <div className="w-full md:w-64">
                                <Dropdown
                                    placeholder="All Categories"
                                    options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
                                    value={filters.category}
                                    onChange={(value) => setFilters({ ...filters, category: value })}
                                    className="border-0 shadow-none bg-transparent"
                                />
                            </div>

                            <div className="h-8 w-px bg-theme-secondary/20 hidden md:block"></div>

                            <div className="w-full md:w-48">
                                <Dropdown
                                    placeholder="All Types"
                                    options={[{ value: '', label: 'All Types' }, ...typeOptions]}
                                    value={filters.type}
                                    onChange={(value) => setFilters({ ...filters, type: value })}
                                    className="border-0 shadow-none bg-transparent"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Events Grid */}
                    {loading ? (
                        <SkeletonList count={6} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event, index) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}

                    {!loading && filteredEvents.length === 0 && (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-theme-surface mb-6">
                                <IoSearch className="text-theme-secondary" size={48} />
                            </div>
                            <p className="text-theme-secondary text-xl font-medium">No events found matching your criteria.</p>
                            <p className="text-theme-secondary/70 text-base mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

