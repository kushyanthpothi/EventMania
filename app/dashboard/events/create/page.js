'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { Input, Textarea } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Dropdown } from '../../../components/common/Dropdown';
import { ImageUpload } from '../../../components/common/ImageUpload';
import { Toggle } from '../../../components/common/Toggle';
import { DateTimePicker } from '../../../components/common/DateTimePicker';
import { showToast } from '../../../components/common/Toast';
import { PageLoader } from '../../../components/common/Loader';
import { createDocument } from '../../../lib/firebase/firestore';
import { COLLECTIONS, EVENT_CATEGORIES, EVENT_TYPES, USER_ROLES } from '../../../lib/utils/constants';
import { getMinDateTime, isTimeInPast } from '../../../lib/utils/helpers';
import { IoArrowBack } from 'react-icons/io5';
import Link from 'next/link';

export default function CreateEventPage() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);

    // Authentication and authorization check
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                showToast.error('Please login to create events');
                router.push('/login');
            } else if (userData && userData.role !== USER_ROLES.COLLEGE_ADMIN) {
                showToast.error('Only college admins can create events');
                router.push('/dashboard');
            }
        }
    }, [user, userData, authLoading, router]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: '', // intra (Internal) or inter (External)
        startDate: '',
        endDate: '',
        posterUrl: '',
        isTeam: false,
        teamCount: '',
        location: '',
        category: '',
        otherCategory: '',
        liveLink: ''
    });

    const eventTypes = [
        { value: EVENT_TYPES.INTRA, label: 'Internal (College Students Only)' },
        { value: EVENT_TYPES.INTER, label: 'External (Open to All Colleges)' }
    ];

    const categories = Object.values(EVENT_CATEGORIES).map(cat => ({ value: cat, label: cat }));


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.posterUrl) {
            showToast.error('Please upload an event poster');
            return;
        }

        // Validate start date is not in the past
        if (isTimeInPast(formData.startDate)) {
            showToast.error('Start date and time cannot be in the past');
            return;
        }

        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            showToast.error('End date must be after start date');
            return;
        }

        setLoading(true);

        try {
            const finalCategory = formData.category === 'Other' ? formData.otherCategory : formData.category;
            if (!finalCategory) throw new Error('Please specify the event category');

            const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Determine status based on event type
            // Internal -> Approved immediately
            // External -> Pending Super Admin approval
            const status = formData.type === EVENT_TYPES.INTRA ? 'approved' : 'pending';

            // Store datetime in local format (YYYY-MM-DDTHH:MM:SS) without timezone conversion
            // This preserves the exact time the user entered
            const startDateTime = formData.startDate + ':00'; // Add seconds
            const endDateTime = formData.endDate + ':00'; // Add seconds

            const eventData = {
                name: formData.name,
                description: formData.description,
                type: formData.type,
                startDate: startDateTime,
                endDate: endDateTime,
                posterUrl: formData.posterUrl,
                isTeam: formData.isTeam,
                teamCount: formData.isTeam ? parseInt(formData.teamCount) : 1,
                location: formData.location,
                category: finalCategory,
                liveLink: formData.liveLink || null,
                collegeId: `college_${user.uid}`, // Using convention from signup
                collegeName: userData.collegeName || 'Unknown College', // Fallback
                createdBy: user.uid,
                creatorName: userData.name,
                status: status,
                approvalStatus: status, // redundancy for clarity
                registeredCount: 0,
                createdAt: new Date().toISOString()
            };

            const { error } = await createDocument(COLLECTIONS.EVENTS, eventId, eventData);

            if (error) throw new Error(error);

            showToast.success(status === 'approved' ? 'Event created successfully!' : 'Event submitted for approval!');
            router.push('/dashboard');

        } catch (error) {
            showToast.error(error.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    // Show loader while checking authentication
    if (authLoading || !user || (userData && userData.role !== USER_ROLES.COLLEGE_ADMIN)) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 flex items-center">
                        <Link href="/dashboard" className="mr-4 text-theme-secondary hover:text-indigo-500 transition-colors">
                            <IoArrowBack size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold text-theme">Create New Event</h1>
                    </div>

                    <div className="card-theme rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            {/* Basic Info */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-theme border-b border-theme pb-2">Event Details</h3>

                                <Input
                                    label="Event Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Tech Symposium 2024"
                                />

                                <div>
                                    <Textarea
                                        label="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="Describe your event..."
                                        rows={4}
                                    />
                                </div>

                                <Dropdown
                                    label="Event Type"
                                    options={eventTypes}
                                    value={formData.type}
                                    onChange={(val) => setFormData({ ...formData, type: val })}
                                    required
                                />
                                <p className="text-xs text-theme-secondary -mt-4">
                                    Internal events are auto-approved. External events require Super Admin approval.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Dropdown
                                        label="Category"
                                        options={categories}
                                        value={formData.category}
                                        onChange={(val) => setFormData({ ...formData, category: val })}
                                        required
                                    />
                                    {formData.category === 'Other' && (
                                        <Input
                                            label="Specify Category"
                                            value={formData.otherCategory}
                                            onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                                            required
                                            placeholder="Enter custom category"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Logistics */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-theme border-b border-theme pb-2 pt-4">Logistics</h3>

                                <DateTimePicker
                                    label="Start Date & Time"
                                    value={formData.startDate}
                                    onChange={(value) => setFormData({ ...formData, startDate: value })}
                                    required
                                />

                                <DateTimePicker
                                    label="End Date & Time"
                                    value={formData.endDate}
                                    onChange={(value) => setFormData({ ...formData, endDate: value })}
                                    minDateTime={formData.startDate}
                                    required
                                />

                                <Input
                                    label="Location / Venue"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                    placeholder="e.g. Main Auditorium, Block A"
                                />

                                <Input
                                    label="Live Event Link (Optional)"
                                    type="url"
                                    value={formData.liveLink}
                                    onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                                    placeholder="e.g. https://meet.google.com/xyz or https://zoom.us/j/123"
                                />
                                <p className="text-xs text-theme-secondary -mt-4">
                                    Provide a link for live streaming or virtual event. This will be shown when the event is ongoing.
                                </p>

                                <Toggle
                                    label="This is a Team Event"
                                    description="Enable if participants need to register as teams"
                                    checked={formData.isTeam}
                                    onChange={(value) => setFormData({ ...formData, isTeam: value })}
                                />

                                {formData.isTeam && (
                                    <Input
                                        label="Team Size (Max Members)"
                                        type="number"
                                        min="2"
                                        value={formData.teamCount}
                                        onChange={(e) => setFormData({ ...formData, teamCount: e.target.value })}
                                        required
                                    />
                                )}
                            </div>

                            {/* Media */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-theme border-b border-theme pb-2 pt-4">Media</h3>
                                <ImageUpload
                                    label="Event Poster"
                                    onUploadComplete={(url) => setFormData({ ...formData, posterUrl: url })}
                                    currentImage={formData.posterUrl}
                                    required
                                />
                            </div>

                            <div className="pt-6">
                                <Button type="submit" loading={loading} className="w-full py-4 text-lg">
                                    Create Event
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

