'use client';

import toast, { Toaster } from 'react-hot-toast';

export const showToast = {
    success: (message) => toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#10b981',
            color: '#fff',
        },
    }),
    error: (message) => toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#ef4444',
            color: '#fff',
        },
    }),
    info: (message) => toast(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#3b82f6',
            color: '#fff',
        },
    }),
    loading: (message) => toast.loading(message, {
        position: 'top-right',
    }),
    dismiss: (toastId) => toast.dismiss(toastId),
};

export const ToastContainer = () => {
    return <Toaster />;
};
