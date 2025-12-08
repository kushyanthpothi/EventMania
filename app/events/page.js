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

                    {/* Modern Filters - Single Line */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mx-auto max-w-screen-2xl mb-12"
                    >
                        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                            {/* Search Input - Modern Design */}
                            <div className="flex-1 relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative">
                                    <Input
                                        placeholder="Search events by name or description..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        icon={<IoSearch className="text-indigo-500" size={20} />}
                                        className="border-0 bg-theme-surface/50 backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl transition-all duration-300 text-lg placeholder:text-theme-secondary rounded-2xl px-6 py-4"
                                    />
                                </div>
                            </div>

                            {/* Category Filter - Modern Design */}
                            <div className="lg:w-72 relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative">
                                    <Dropdown
                                        placeholder="All Categories"
                                        options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
                                        value={filters.category}
                                        onChange={(value) => setFilters({ ...filters, category: value })}
                                        className="border-0 bg-theme-surface/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6 py-4 text-base font-medium"
                                    />
                                </div>
                            </div>

                            {/* Type Filter - Modern Design */}
                            <div className="lg:w-64 relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative">
                                    <Dropdown
                                        placeholder="All Types"
                                        options={[{ value: '', label: 'All Types' }, ...typeOptions]}
                                        value={filters.type}
                                        onChange={(value) => setFilters({ ...filters, type: value })}
                                        className="border-0 bg-theme-surface/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-6 py-4 text-base font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

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

