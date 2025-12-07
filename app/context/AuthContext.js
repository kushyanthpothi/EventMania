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

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const { data } = await getDocument(COLLECTIONS.USERS, firebaseUser.uid);
                setUserData(data);
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
        isAuthenticated: !!user,
        isVerified: userData?.verified || false,
        role: userData?.role || null
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
