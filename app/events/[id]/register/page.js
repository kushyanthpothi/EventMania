'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Header } from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { PageLoader } from '../../../components/common/Loader';
import { showToast } from '../../../components/common/Toast';
import { getDocument, createDocument } from '../../../lib/firebase/firestore';
import { COLLECTIONS, USER_ROLES } from '../../../lib/utils/constants';
import { IoArrowBack, IoPeople, IoPerson } from 'react-icons/io5';
import Link from 'next/link';

export default function EventRegistrationPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        teamName: '',
        teamMembers: [] // Array of { name: '', email: '' }
    });

    useEffect(() => {
        if (!authLoading && (!user || userData?.role !== USER_ROLES.STUDENT)) {
            showToast.error("Only students can register for events");
            router.push(`/events/${params.id}`);
            return;
        }

        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || user.displayName || '',
                email: userData.email || user.email || ''
            }));
        }
    }, [user, userData, authLoading, router, params.id]);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!params.id) return;
            try {
                const { data, error } = await getDocument(COLLECTIONS.EVENTS, params.id);
                if (error) throw new Error(error);
                setEvent(data);

                // Initialize team members if needed
                if (data.isTeam && data.teamCount > 1) {
                    const initialMembers = Array(data.teamCount - 1).fill().map(() => ({ name: '', email: '' }));
                    setFormData(prev => ({ ...prev, teamMembers: initialMembers }));
                }
            } catch (error) {
                console.error("Error fetching event:", error);
                showToast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [params.id]);

    const handleTeamMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, teamMembers: updatedMembers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Validation
            if (!formData.phone) throw new Error("Phone number is required");
            if (event.isTeam && !formData.teamName) throw new Error("Team Name is required");

            // Create Registration Document
            const registrationId = `reg_${event.id}_${user.uid}`;
            const registrationData = {
                eventId: event.id,
                eventName: event.name,
                studentId: user.uid,
                studentName: formData.name,
                studentEmail: formData.email,
                studentPhone: formData.phone,
                collegeId: userData.collegeId, // To help college admin filter? or event.collegeId?
                // Actually the college admin viewing this is the one who created the event.
                // So we just need to link it to the event.

                isTeam: event.isTeam,
                teamName: formData.teamName || null,
                teamMembers: event.isTeam ? formData.teamMembers : [],

                registeredAt: new Date().toISOString(),
                status: 'confirmed'
            };

            const { error } = await createDocument(COLLECTIONS.REGISTRATIONS, registrationId, registrationData);
            if (error) throw new Error(error);

            // Update registration count in event (optional, but good for UI)
            // We would need an atomic increment ideally, but simple update for now
            // (Skipping atomic update logic for simplicity as requested, focused on registration doc)

            showToast.success("Successfully registered!");
            router.push('/dashboard'); // Redirect to dashboard to see "My Events" (if we implemented it) or just home

        } catch (error) {
            showToast.error(error.message || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) return <PageLoader />;
    if (!event) return null;

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <Link href={`/events/${params.id}`} className="inline-flex items-center text-theme-secondary hover:text-indigo-500 transition-colors mb-4">
                            <IoArrowBack className="mr-2" /> Back to Event
                        </Link>
                        <h1 className="text-3xl font-bold text-theme">Register for {event.name}</h1>
                        <p className="text-theme-secondary mt-2">Please fill in your details to complete registration</p>
                    </div>

                    <div className="card-theme rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">

                            {/* Personal Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-theme border-b border-theme pb-2 flex items-center">
                                    <IoPerson className="mr-2 text-indigo-500" /> Personal Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        disabled
                                        className="bg-theme-surface"
                                    />
                                    <Input
                                        label="Email Address"
                                        value={formData.email}
                                        disabled
                                        className="bg-theme-surface"
                                    />
                                </div>

                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="+91 98765 43210"
                                />
                            </div>

                            {/* Team Details */}
                            {event.isTeam && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-theme border-b border-theme pb-2 flex items-center">
                                        <IoPeople className="mr-2 text-indigo-500" /> Team Details
                                    </h3>

                                    <Input
                                        label="Team Name"
                                        value={formData.teamName}
                                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                        required
                                        placeholder="e.g. Code Warriors"
                                    />

                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-theme-secondary">Team Members ({event.teamCount - 1} members + you)</label>
                                        {formData.teamMembers.map((member, index) => (
                                            <div key={index} className="p-4 bg-theme-surface rounded-xl border border-theme">
                                                <p className="text-xs font-semibold text-theme-secondary mb-3 text-uppercase">Member {index + 1}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input
                                                        placeholder="Member Name"
                                                        value={member.name}
                                                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                    <Input
                                                        placeholder="Member Email"
                                                        type="email"
                                                        value={member.email}
                                                        onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    loading={submitting}
                                    className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Confirm Registration
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

