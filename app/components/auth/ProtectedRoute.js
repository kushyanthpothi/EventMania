'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../common/Loader';
import { checkRole } from '../../lib/utils/helpers';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, userData, loading, emailVerified, needsRoleSelection } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Not authenticated - redirect to login
            if (!user) {
                router.push('/login');
            }
            // Email not verified - redirect to login
            else if (!emailVerified) {
                router.push('/login');
            }
            // Needs role selection - redirect to role selection
            else if (needsRoleSelection) {
                router.push('/select-role');
            }
            // Check role-based access
            else if (allowedRoles.length > 0 && userData && !checkRole(userData.role, allowedRoles)) {
                router.push('/dashboard');
            }
        }
    }, [user, userData, loading, emailVerified, needsRoleSelection, router, allowedRoles]);

    if (loading) {
        return <PageLoader />;
    }

    if (!user || !emailVerified) {
        return null;
    }

    if (needsRoleSelection) {
        return null;
    }

    if (allowedRoles.length > 0 && userData && !checkRole(userData.role, allowedRoles)) {
        return null;
    }

    return <>{children}</>;
};
