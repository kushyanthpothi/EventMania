export const USER_ROLES = {
    STUDENT: 'student',
    COLLEGE_ADMIN: 'college_admin',
    SUPER_ADMIN: 'super_admin',
    COMPANY: 'company'
};

export const EVENT_TYPES = {
    INTRA: 'intra',
    INTER: 'inter'
};

export const EVENT_CATEGORIES = {
    TECHNICAL: 'Technical',
    CULTURAL: 'Cultural',
    SPORTS: 'Sports',
    WORKSHOP: 'Workshop',
    SEMINAR: 'Seminar',
    HACKATHON: 'Hackathon',
    COMPETITION: 'Competition',
    OTHER: 'Other'
};

export const EVENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

export const VENUE_TYPES = {
    PHYSICAL: 'physical',
    VIRTUAL: 'virtual',
    HYBRID: 'hybrid'
};

export const REGISTRATION_STATUS = {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    ATTENDED: 'attended'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

export const VERIFICATION_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

export const NOTIFICATION_TYPES = {
    APPROVAL: 'approval',
    REGISTRATION: 'registration',
    EVENT_UPDATE: 'event_update',
    PAYMENT: 'payment',
    VERIFICATION: 'verification',
    REMINDER: 'reminder'
};

export const THEME_COLORS = {
    PRIMARY: '#6366f1',
    SECONDARY: '#ec4899',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    BACKGROUND: '#f9fafb',
    TEXT: '#111827'
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const PAGINATION_LIMIT = 12;

export const COLLECTIONS = {
    USERS: 'users',
    COLLEGES: 'colleges',
    EVENTS: 'events',
    REGISTRATIONS: 'registrations',
    NOTIFICATIONS: 'notifications',
    VERIFICATION_REQUESTS: 'verificationRequests',
    COMPANIES: 'companies'
};
