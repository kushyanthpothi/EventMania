'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { Input, Textarea } from '../../../../components/common/Input';
import { Button } from '../../../../components/common/Button';
import { Dropdown } from '../../../../components/common/Dropdown';
import { ImageUpload } from '../../../../components/common/ImageUpload';
import { Toggle } from '../../../../components/common/Toggle';
import { DateTimePicker } from '../../../../components/common/DateTimePicker';
import { showToast } from '../../../../components/common/Toast';
import { PageLoader } from '../../../../components/common/Loader';
import { getDocument, updateDocument } from '../../../../lib/firebase/firestore';
import { COLLECTIONS, EVENT_CATEGORIES, EVENT_TYPES, EVENT_STATUS, USER_ROLES } from '../../../../lib/utils/constants';
import { getMinDateTime, isTimeInPast } from '../../../../lib/utils/helpers';
import { IoArrowBack, IoCheckmarkCircle, IoChevronForward } from 'react-icons/io5';
import Link from 'next/link';
import { EventFormLayout } from '../../../../components/events/EventFormLayout';
import { EventCard } from '../../../../components/events/EventCard';
import { StepWizard } from '../../../../components/common/StepWizard';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id;
    const { user, userData, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [originalEvent, setOriginalEvent] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { number: 1, title: 'Event Details' },
        { number: 2, title: 'Logistics' },
        { number: 3, title: 'Media' }
    ];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: '',
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

    // Authentication and authorization check
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                showToast.error('Please login to edit events');
                router.push('/login');
            } else if (userData && userData.role !== USER_ROLES.COLLEGE_ADMIN) {
                showToast.error('Only college admins can edit events');
                router.push('/dashboard');
            }
        }
    }, [user, userData, authLoading, router]);

    // Fetch event data on mount
    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;

            try {
                const { data, error } = await getDocument(COLLECTIONS.EVENTS, eventId);
                if (error || !data) {
                    showToast.error('Event not found');
                    router.push('/dashboard');
                    return;
                }

                // Check if user owns this event
                if (data.createdBy !== user?.uid) {
                    showToast.error('You do not have permission to edit this event');
                    router.push('/dashboard');
                    return;
                }

                setOriginalEvent(data);

                // Convert date strings to YYYY-MM-DDTHH:MM format
                const formatDateForInput = (dateString) => {
                    if (!dateString) return '';

                    // Check if it's already in local format (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM)
                    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
                        // Already in correct format, just remove seconds if present
                        return dateString.slice(0, 16);
                    }

                    // Otherwise, it's in UTC format (old data), convert it
                    const date = new Date(dateString);

                    // Get local date/time components
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');

                    // Return in YYYY-MM-DDTHH:MM format
                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                };

                // Check if the category is a predefined one or custom
                const predefinedCategories = Object.values(EVENT_CATEGORIES);
                const isCustomCategory = data.category && !predefinedCategories.includes(data.category);

                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    type: data.type || '',
                    startDate: formatDateForInput(data.startDate),
                    endDate: formatDateForInput(data.endDate),
                    posterUrl: data.posterUrl || '',
                    isTeam: data.isTeam || false,
                    teamCount: data.teamCount?.toString() || '',
                    location: data.location || '',
                    category: isCustomCategory ? 'Other' : (data.category || ''),
                    otherCategory: isCustomCategory ? data.category : '',
                    liveLink: data.liveLink || ''
                });
            } catch (error) {
                console.error('Error fetching event:', error);
                showToast.error('Failed to load event');
            } finally {
                setFetching(false);
            }
        };

        if (user && userData && userData.role === USER_ROLES.COLLEGE_ADMIN) {
            fetchEvent();
        }
    }, [eventId, user, userData, router]);

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
        // Allow past dates if editing an event that already happened or started
        // But if changing dates, basic validation rules should apply if consistent with logic
        // For simplicity, we just check fields presence here as basic validation
        // The handleSubmit has more checks

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
                const { uploadImage } = await import('../../../../lib/imgbb/upload');
                const { url, error } = await uploadImage(imageFile);
                
                if (error) {
                    throw new Error(`Image upload failed: ${error}`);
                }
                
                posterUrl = url;
                showToast.success('Image uploaded successfully!');
            }

            const finalCategory = formData.category === 'Other' ? formData.otherCategory : formData.category;
            if (!finalCategory) throw new Error('Please specify the event category');

            // Determine status based on event type and current status
            let status;
            let statusMessage = '';

            if (originalEvent.status === EVENT_STATUS.APPROVED) {
                // Event is currently approved
                if (formData.type === EVENT_TYPES.INTRA) {
                    // Intra events stay approved
                    status = EVENT_STATUS.APPROVED;
                    statusMessage = 'Event updated successfully!';
                } else {
                    // Inter events need re-approval
                    status = EVENT_STATUS.PENDING;
                    statusMessage = 'Event sent for re-approval by Super Admin';
                }
            } else {
                // New events or rejected events
                status = formData.type === EVENT_TYPES.INTRA ? EVENT_STATUS.APPROVED : EVENT_STATUS.PENDING;
                statusMessage = formData.type === EVENT_TYPES.INTRA
                    ? 'Event updated successfully!'
                    : 'Event sent for approval by Super Admin';
            }

            // Store datetime in local format (YYYY-MM-DDTHH:MM:SS) without timezone conversion
            const startDateTime = formData.startDate + ':00'; // Add seconds
            const endDateTime = formData.endDate + ':00'; // Add seconds

            const updatedData = {
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
                status: status,
                approvalStatus: status,
                updatedAt: new Date().toISOString(),
                // Clear rejection info when resubmitting
                rejectionReason: null,
                rejectedAt: null,
                rejectedBy: null
            };

            const { error } = await updateDocument(COLLECTIONS.EVENTS, eventId, updatedData);

            if (error) throw new Error(error);

            showToast.success(statusMessage);
            router.push('/dashboard');

        } catch (error) {
            showToast.error(error.message || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    };

    // Show loader while checking authentication or fetching event
    if (authLoading || fetching || !user || (userData && userData.role !== USER_ROLES.COLLEGE_ADMIN)) {
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
                        <div>
                            <h1 className="text-3xl font-bold text-white">Edit Event</h1>
                            {originalEvent?.status === 'rejected' && (
                                <p className="text-orange-400 text-sm mt-1">
                                    This event was rejected. Make changes and resubmit for approval.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Rejection Reason Alert */}
                    {originalEvent?.rejectionReason && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 font-medium">Rejection Reason:</p>
                            <p className="text-red-300 mt-1">{originalEvent.rejectionReason}</p>
                        </div>
                    )}


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
                                        minDateTime={originalEvent?.startDate} // Use original start date as minimum
                                        allowPastDates={true}
                                        required
                                    />

                                    <DateTimePicker
                                        label="End Date & Time"
                                        value={formData.endDate}
                                        onChange={(value) => setFormData({ ...formData, endDate: value })}
                                        minDateTime={formData.startDate} // End must be after start
                                        allowPastDates={true}
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
                                        Image will be uploaded when you click &quot;Update Event&quot;
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
                                <Button type="submit" loading={loading} className="w-2/3 py-4 text-lg">
                                    {originalEvent?.status === 'rejected' ? 'Resubmit for Approval' : 'Update Event'}
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
