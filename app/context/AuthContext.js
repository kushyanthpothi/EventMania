'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../lib/firebase/auth';
import { getDocument } from '../lib/firebase/firestore';
import { COLLECTIONS } from '../lib/utils/constants';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (uid) => {
        try {
            const { data } = await getDocument(COLLECTIONS.USERS, uid);
            setUserData(data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const refreshUser = async () => {
        if (user) {
            await fetchUserData(user.uid);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchUserData(firebaseUser.uid);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userData,
        loading,
        refreshUser,
        isAuthenticated: !!user,
        emailVerified: user?.emailVerified || false,
        isVerified: userData?.verified || false,
        role: userData?.role || null,
        needsRoleSelection: user?.emailVerified && !userData?.role
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
