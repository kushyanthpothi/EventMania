'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { IoArrowBack, IoCheckmarkCircle, IoChevronForward } from 'react-icons/io5';
import Link from 'next/link';
import { EventFormLayout } from '../../../components/events/EventFormLayout';
import { EventCard } from '../../../components/events/EventCard';
import { StepWizard } from '../../../components/common/StepWizard';

export default function CreateEventPage() {
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { number: 1, title: 'Event Details' },
        { number: 2, title: 'Logistics' },
        { number: 3, title: 'Media' }
    ];

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

    const [imageFile, setImageFile] = useState(null); // Store selected image file
    const [imagePreview, setImagePreview] = useState(''); // Store preview URL

    const eventTypes = [
        { value: EVENT_TYPES.INTRA, label: 'Internal (College Students Only)' },
        { value: EVENT_TYPES.INTER, label: 'External (Open to All Colleges)' }
    ];

    const categories = Object.values(EVENT_CATEGORIES).map(cat => ({ value: cat, label: cat }));

    // Create preview event object from form data
    const previewEvent = {
        id: 'preview',
        name: formData.name || 'Event Name',
        description: formData.description || 'Event description will appear here...',
        type: formData.type || 'inter',
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date().toISOString(),
        posterUrl: imagePreview || formData.posterUrl || '', // Use preview URL for display
        isTeam: formData.isTeam,
        teamCount: formData.teamCount || 1,
        location: formData.location || 'Event Location',
        category: formData.category === 'Other' ? (formData.otherCategory || 'Category') : (formData.category || 'Category'),
        liveLink: formData.liveLink || ''
    };

    const validateStep1 = () => {
        if (!formData.name || !formData.description || !formData.type || !formData.category) {
            showToast.error('Please fill in all required fields');
            return false;
        }
        if (formData.category === 'Other' && !formData.otherCategory) {
            showToast.error('Please specify the category');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.startDate || !formData.endDate || !formData.location) {
            showToast.error('Please fill in all required fields');
            return false;
        }
        if (isTimeInPast(formData.startDate)) {
            showToast.error('Start date cannot be in the past');
            return false;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            showToast.error('End date must be after start date');
            return false;
        }
        if (formData.isTeam && !formData.teamCount) {
            showToast.error('Please specify team size');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
            window.scrollTo(0, 0);
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleStepClick = (stepNumber) => {
        // Allow going back to previous steps
        if (stepNumber < currentStep) {
            setCurrentStep(stepNumber);
            window.scrollTo(0, 0);
        }
        // Validate before moving forward
        else if (stepNumber > currentStep) {
            if (currentStep === 1 && validateStep1()) {
                setCurrentStep(stepNumber);
                window.scrollTo(0, 0);
            } else if (currentStep === 2 && validateStep2()) {
                setCurrentStep(stepNumber);
                window.scrollTo(0, 0);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile && !formData.posterUrl) {
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
            let posterUrl = formData.posterUrl;

            // Upload image if a new file is selected
            if (imageFile) {
                showToast.info('Uploading image...');
                const { uploadImage } = await import('../../../lib/imgbb/upload');
                const { url, error } = await uploadImage(imageFile);
                
                if (error) {
                    throw new Error(`Image upload failed: ${error}`);
                }
                
                posterUrl = url;
                showToast.success('Image uploaded successfully!');
            }
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
                posterUrl: posterUrl, // Use the uploaded URL
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
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-20">
                <EventFormLayout
                    previewCard={<EventCard event={previewEvent} preview={true} />}
                >
                    <div className="mb-6 flex items-center">
                        <Link href="/dashboard" className="mr-4 text-gray-400 hover:text-indigo-400 transition-colors">
                            <IoArrowBack size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
                    </div>


                    <form onSubmit={handleSubmit} className="space-y-6">
                        <StepWizard steps={steps} currentStep={currentStep} onStepClick={handleStepClick}>

                            {/* Step 1: Event Details */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Event Details</h3>

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
                                    <p className="text-xs text-gray-400 -mt-4">
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
                            )}

                            {/* Step 2: Logistics */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Logistics</h3>

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
                                    <p className="text-xs text-gray-400 -mt-4">
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
                            )}

                            {/* Step 3: Media */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">Media</h3>
                                    <ImageUpload
                                        label="Event Poster"
                                        onFileSelect={(file) => {
                                            setImageFile(file);
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImagePreview(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            } else {
                                                setImagePreview('');
                                            }
                                        }}
                                        currentImage={imagePreview || formData.posterUrl}
                                        required
                                        uploadImmediately={false}
                                    />
                                    <p className="text-xs text-gray-400 -mt-4">
                                        Image will be uploaded when you click &quot;Create Event&quot;
                                    </p>
                                </div>
                            )}

                        </StepWizard>

                        <div className="pt-6 flex gap-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    className="w-1/3 py-4 text-lg"
                                >
                                    Back
                                </Button>
                            )}

                            {currentStep < 3 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className={`py-4 text-lg ${currentStep === 1 ? 'w-full' : 'w-2/3'}`}
                                >
                                    Next Step <IoChevronForward className="ml-2 inline" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    loading={loading}
                                    className="w-2/3 py-4 text-lg"
                                >
                                    Create Event
                                </Button>
                            )}
                        </div>

                    </form>
                </EventFormLayout>
            </main>
            <Footer />
        </div>
    );
}

