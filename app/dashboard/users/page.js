'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import { showToast } from '../../components/common/Toast';
import { queryDocuments, deleteDocument } from '../../lib/firebase/firestore';
import { COLLECTIONS, USER_ROLES } from '../../lib/utils/constants';
import { IoArrowBack, IoPerson, IoTrash, IoSchool, IoMail, IoIdCard, IoBusiness } from 'react-icons/io5';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && userData &&
            userData.role !== USER_ROLES.COLLEGE_ADMIN &&
            userData.role !== USER_ROLES.SUPER_ADMIN) {
            router.push('/dashboard');
        }
    }, [user, userData, loading, router]);

    const fetchUsers = async () => {
        if (!user || !userData) return;
        try {
            let fetchedUsers = [];

            if (userData.role === USER_ROLES.COLLEGE_ADMIN) {
                const collegeId = `college_${user.uid}`;
                // Fetch students for this college
                const { data, error } = await queryDocuments(COLLECTIONS.USERS, [
                    { field: 'collegeId', operator: '==', value: collegeId },
                    { field: 'role', operator: '==', value: USER_ROLES.STUDENT }
                ]);
                if (error) throw new Error(error);
                // Filter verified students (unverified are in verifications page)
                fetchedUsers = data?.filter(u => u.verified) || [];
            } else if (userData.role === USER_ROLES.SUPER_ADMIN) {
                // Fetch ALL users
                // Note: Fetching all users might be heavy in prod, but fine for now.
                const { data, error } = await queryDocuments(COLLECTIONS.USERS);
                if (error) throw new Error(error);
                fetchedUsers = data || [];
            }

            setUsers(fetchedUsers);
        } catch (err) {
            showToast.error('Failed to load users');
            console.error(err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [userData]);

    const handleDelete = async (targetUser) => {
        if (!confirm(`Are you sure you want to delete ${targetUser.name}? This action cannot be undone.`)) return;

        setActionLoading(targetUser.uid);
        try {
            // 1. Delete all Event Registrations for this student
            if (targetUser.role === USER_ROLES.STUDENT) {
                const { data: registrations } = await queryDocuments(COLLECTIONS.REGISTRATIONS, [
                    { field: 'studentId', operator: '==', value: targetUser.uid }
                ]);

                if (registrations && registrations.length > 0) {
                    await Promise.all(registrations.map(reg => deleteDocument(COLLECTIONS.REGISTRATIONS, reg.id)));
                }
            }

            // 2. Delete User Document
            const { error: userError } = await deleteDocument(COLLECTIONS.USERS, targetUser.uid);
            if (userError) throw new Error(userError);

            // 3. Delete from Firebase Auth
            await fetch('/api/admin/delete-user', {
                method: 'POST',
                body: JSON.stringify({ uid: targetUser.uid }),
                headers: { 'Content-Type': 'application/json' }
            });

            showToast.success(`Deleted user ${targetUser.name}`);
            setUsers(prev => prev.filter(u => u.uid !== targetUser.uid));

        } catch (error) {
            showToast.error(`Delete failed: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading || pageLoading) return <PageLoader />;
    if (!user || (userData?.role !== USER_ROLES.COLLEGE_ADMIN && userData?.role !== USER_ROLES.SUPER_ADMIN)) return null;

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="mr-4 text-theme-secondary hover:text-indigo-500 transition-colors">
                                <IoArrowBack size={24} />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-theme">Registered Users</h1>
                                <p className="text-theme-secondary mt-1">
                                    {userData.role === USER_ROLES.COLLEGE_ADMIN
                                        ? 'Manage students registered under your college'
                                        : 'Manage all users on the platform'}
                                </p>
                            </div>
                        </div>
                        <div className="card-theme px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-theme-secondary font-medium">Total: </span>
                            <span className="text-indigo-500 font-bold ml-1">{users.length}</span>
                        </div>
                    </div>

                    {users.length === 0 ? (
                        <div className="card-theme rounded-2xl shadow-sm p-12 text-center transition-colors duration-300">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <IoPerson className="text-indigo-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-theme mb-2">No Users Found</h3>
                            <p className="text-theme-secondary">There are no registered users to display.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {users.map((userItem) => (
                                    <motion.div
                                        key={userItem.uid}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        layout
                                        className="card-theme rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md border border-transparent hover:border-indigo-500/30"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {userItem.profileImg ? (
                                                    <img
                                                        src={userItem.profileImg}
                                                        alt={userItem.name}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border-2 border-indigo-500/20">
                                                        <IoPerson className="text-indigo-400" size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-theme">{userItem.name}</h3>
                                                    {userData.role === USER_ROLES.SUPER_ADMIN && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                                            {userItem.role}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-theme-secondary">
                                                    {userItem.role === USER_ROLES.STUDENT && (
                                                        <span className="flex items-center">
                                                            <IoIdCard className="mr-1.5 text-indigo-400" />
                                                            {userItem.registrationNumber || 'N/A'}
                                                        </span>
                                                    )}
                                                    {userItem.role === USER_ROLES.COMPANY && (
                                                        <span className="flex items-center">
                                                            <IoBusiness className="mr-1.5 text-indigo-400" />
                                                            {userItem.companyName || 'N/A'}
                                                        </span>
                                                    )}
                                                    <span className="hidden sm:inline text-theme-secondary/30">|</span>
                                                    <span className="flex items-center">
                                                        <IoMail className="mr-1.5 text-indigo-400" />
                                                        {userItem.email}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-theme-secondary/60 mt-2">
                                                    Joined: {userItem.createdAt?.seconds ? new Date(userItem.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 self-end md:self-auto">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDelete(userItem)}
                                                disabled={actionLoading === userItem.uid}
                                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
                                            >
                                                {actionLoading === userItem.uid ? 'Deleting...' : (
                                                    <>
                                                        <IoTrash className="mr-2" /> Delete User
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
