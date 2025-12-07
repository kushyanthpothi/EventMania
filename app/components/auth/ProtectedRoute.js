'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../common/Loader';
import { checkRole } from '../../lib/utils/helpers';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (allowedRoles.length > 0 && userData && !checkRole(userData.role, allowedRoles)) {
                router.push('/dashboard');
            }
        }
    }, [user, userData, loading, router, allowedRoles]);

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        return null;
    }

    if (allowedRoles.length > 0 && userData && !checkRole(userData.role, allowedRoles)) {
        return null;
    }

    return <>{children}</>;
};
