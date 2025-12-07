export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};

export const validateRegistrationNumber = (regNumber) => {
    return regNumber && regNumber.trim().length >= 5;
};

export const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) return { valid: false, error: 'No file provided' };
    if (file.size > maxSize) return { valid: false, error: 'File size must be less than 5MB' };
    if (!allowedTypes.includes(file.type)) return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' };

    return { valid: true, error: null };
};

export const validateEventForm = (formData) => {
    const errors = {};

    if (!formData.title || formData.title.trim().length < 3) {
        errors.title = 'Event title must be at least 3 characters';
    }

    if (!formData.description || formData.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
        errors.category = 'Please select a category';
    }

    if (!formData.type) {
        errors.type = 'Please select event type';
    }

    if (!formData.startDate) {
        errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
        errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        errors.endDate = 'End date must be after start date';
    }

    if (formData.maxParticipants && formData.maxParticipants < 1) {
        errors.maxParticipants = 'Maximum participants must be at least 1';
    }

    if (formData.registrationFee && formData.registrationFee < 0) {
        errors.registrationFee = 'Registration fee cannot be negative';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};

export const validateProfileForm = (formData) => {
    const errors = {};

    if (!formData.name || formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email || !validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }

    return { valid: Object.keys(errors).length === 0, errors };
};
