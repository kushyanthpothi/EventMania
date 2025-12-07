'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToCollection, updateDocument } from '../lib/firebase/firestore';
import { COLLECTIONS } from '../lib/utils/constants';
import { useAuthContext } from './AuthContext';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
    const { user } = useAuthContext();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const unsubscribe = subscribeToCollection(
            COLLECTIONS.NOTIFICATIONS,
            [{ field: 'userId', operator: '==', value: user.uid }],
            (data) => {
                const sortedNotifications = data.sort((a, b) => {
                    const aTime = a.createdAt?.seconds || 0;
                    const bTime = b.createdAt?.seconds || 0;
                    return bTime - aTime;
                });
                setNotifications(sortedNotifications);
                setUnreadCount(sortedNotifications.filter(n => !n.read).length);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const markAsRead = useCallback(async (notificationId) => {
        await updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, { read: true });
    }, []);

    const markAllAsRead = useCallback(async () => {
        const unreadNotifications = notifications.filter(n => !n.read);
        await Promise.all(
            unreadNotifications.map(n => updateDocument(COLLECTIONS.NOTIFICATIONS, n.id, { read: true }))
        );
    }, [notifications]);

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};
