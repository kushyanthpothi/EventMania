import { format, formatDistance, formatRelative, isAfter, isBefore, isPast, isFuture, parseISO } from 'date-fns';

export const formatDate = (date, formatString = 'PPP') => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
};

export const formatDateTime = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'PPP p');
};

export const formatTimeAgo = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const formatRelativeDate = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(dateObj, new Date());
};

export const isEventUpcoming = (startDate) => {
    if (!startDate) return false;
    const dateObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    return isFuture(dateObj);
};

export const isEventPast = (endDate) => {
    if (!endDate) return false;
    const dateObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    return isPast(dateObj);
};

export const isEventOngoing = (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const now = new Date();
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    return isAfter(now, start) && isBefore(now, end);
};

export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

export const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const checkRole = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};

export const isCollegeAdmin = (role) => role === 'college_admin';
export const isSuperAdmin = (role) => role === 'super_admin';
export const isStudent = (role) => role === 'student';
export const isCompany = (role) => role === 'company';

export const getEventStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
};

export const getEventTypeBadge = (type) => {
    const badges = {
        intra: 'bg-purple-100 text-purple-800',
        inter: 'bg-indigo-100 text-indigo-800'
    };
    return badges[type] || badges.intra;
};

// Get minimum datetime for datetime-local input (current time)
export const getMinDateTime = () => {
    const now = new Date();
    // Format: YYYY-MM-DDTHH:MM
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Check if a datetime string is in the past
export const isTimeInPast = (datetimeString) => {
    if (!datetimeString) return false;
    const selectedDate = new Date(datetimeString);
    const now = new Date();
    return selectedDate < now;
};
