'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import { showToast } from '../../components/common/Toast';
import { queryDocuments, updateDocument, deleteDocument } from '../../lib/firebase/firestore';
import { COLLECTIONS, USER_ROLES } from '../../lib/utils/constants';
import { IoCheckmarkCircle, IoCloseCircle, IoArrowBack, IoPerson, IoSchool } from 'react-icons/io5';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerificationsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && userData && userData.role !== USER_ROLES.COLLEGE_ADMIN) {
            router.push('/dashboard');
        }
    }, [user, userData, loading, router]);

    const fetchRequests = async () => {
        if (!user) return;
        try {
            // Note: collegeId for admin is their own uid (as per signup logic for College Admin)
            // But wait, the student stores `collegeId` which is the ID of the college document.
            // In signup: `userData.collegeId = formData.college` (where formData.college is college document ID)
            // The College Admin user ID is `adminId` in the college document.
            // We need to find the college document where `adminId == user.uid` to get the correct collegeId?
            // OR, assuming simple connection: When college admin signs up, they create a college doc `college_${user.uid}`.
            // So the collegeId is `college_${user.uid}`.

            const collegeId = `college_${user.uid}`;

            // Fetch unverified students for this college
            // Firestore requires composite index for multiple fields. 
            // We'll fetch by collegeId and filter client-side for now to avoid index creation delay for the user,
            // or fetch by collegeId and 'role' if indexed.
            // Let's try fetching all students for the college and filtering.

            const { data, error } = await queryDocuments(COLLECTIONS.USERS, [
                { field: 'collegeId', operator: '==', value: collegeId },
                { field: 'role', operator: '==', value: USER_ROLES.STUDENT }
            ]);

            if (error) throw new Error(error);

            // Filter for unverified students
            const pendingStudents = data?.filter(u => !u.verified) || [];

            // Map to match the previous structure for UI consistency if needed, 
            // but the user doc has all we need (name, email, registrationNumber, profileImg).
            setRequests(pendingStudents);

        } catch (err) {
            showToast.error('Failed to load students');
            console.error(err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.role === USER_ROLES.COLLEGE_ADMIN) {
            fetchRequests();
        }
    }, [userData]);

    const handleApprove = async (student) => {
        setActionLoading(student.uid); // user doc id is uid
        try {
            // Update student user profile
            const { error: userError } = await updateDocument(COLLECTIONS.USERS, student.uid, {
                verified: true,
                updatedAt: new Date().toISOString(),
                approvedBy: user.uid
            });
            if (userError) throw new Error(userError);

            showToast.success(`Approved ${student.name}`);
            setRequests(prev => prev.filter(r => r.uid !== student.uid));

        } catch (error) {
            showToast.error(`Approval failed: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (student) => {
        if (!confirm(`Are you sure you want to reject ${student.name}? This will permanently delete their account.`)) return;

        setActionLoading(student.uid);
        try {
            // Delete the student's user profile
            const { error: userError } = await deleteDocument(COLLECTIONS.USERS, student.uid);
            if (userError) throw new Error(userError);

            // Call API to delete from Firebase Auth
            await fetch('/api/admin/delete-user', {
                method: 'POST',
                body: JSON.stringify({ uid: student.uid }),
                headers: { 'Content-Type': 'application/json' }
            });

            showToast.success(`Rejected and removed ${student.name}`);
            setRequests(prev => prev.filter(r => r.uid !== student.uid));

        } catch (error) {
            showToast.error(`Rejection failed: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading || pageLoading) return <PageLoader />;
    if (!user || userData?.role !== USER_ROLES.COLLEGE_ADMIN) return null;

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
                                <h1 className="text-3xl font-bold text-theme">Student Verifications</h1>
                                <p className="text-theme-secondary mt-1">Verify students registered under your college</p>
                            </div>
                        </div>
                        <div className="card-theme px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-theme-secondary font-medium">Pending: </span>
                            <span className="text-indigo-500 font-bold ml-1">{requests.length}</span>
                        </div>
                    </div>

                    {requests.length === 0 ? (
                        <div className="card-theme rounded-2xl shadow-sm p-12 text-center transition-colors duration-300">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <IoCheckmarkCircle className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-theme mb-2">All Caught Up!</h3>
                            <p className="text-theme-secondary">There are no pending student verification requests at this time.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {requests.map((student) => (
                                    <motion.div
                                        key={student.uid}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        layout
                                        className="card-theme rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md border border-transparent hover:border-indigo-500/30"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {student.profileImg ? (
                                                    <img
                                                        src={student.profileImg}
                                                        alt={student.name}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/20"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border-2 border-indigo-500/20">
                                                        <IoPerson className="text-indigo-400" size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-theme">{student.name}</h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-theme-secondary">
                                                    <span className="flex items-center">
                                                        <IoSchool className="mr-1.5 text-indigo-400" />
                                                        {student.registrationNumber}
                                                    </span>
                                                    <span className="hidden sm:inline text-theme-secondary/30">|</span>
                                                    <span>{student.email}</span>
                                                </div>
                                                <p className="text-xs text-theme-secondary/60 mt-2">
                                                    Joined: {new Date(student.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 self-end md:self-auto">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleReject(student)}
                                                disabled={actionLoading === student.uid}
                                                className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
                                            >
                                                {actionLoading === student.uid ? '...' : 'Reject'}
                                            </Button>
                                            <Button
                                                onClick={() => handleApprove(student)}
                                                loading={actionLoading === student.uid}
                                                className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                                            >
                                                Approve
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
