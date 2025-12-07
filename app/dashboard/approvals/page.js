'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { PageLoader } from '../../components/common/Loader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { showToast } from '../../components/common/Toast';
import { USER_ROLES, COLLECTIONS, EVENT_TYPES, EVENT_STATUS } from '../../lib/utils/constants';
import { queryDocuments, updateDocument, deleteDocument, getDocument } from '../../lib/firebase/firestore';
import { IoCheckmarkCircle, IoCloseCircle, IoSchool, IoBusiness, IoCalendar, IoLocation, IoTime, IoInformationCircle } from 'react-icons/io5';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApprovalsPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('events');
    const [pendingEvents, setPendingEvents] = useState([]);
    const [pendingColleges, setPendingColleges] = useState([]);
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && (!user || userData?.role !== USER_ROLES.SUPER_ADMIN)) {
            router.push('/dashboard');
        }
    }, [user, userData, loading, router]);

    const fetchData = async () => {
        setFetching(true);
        try {
            // Fetch Pending External Events (inter-college events with pending status)
            const { data: events } = await queryDocuments(
                COLLECTIONS.EVENTS,
                [
                    { field: 'type', operator: '==', value: EVENT_TYPES.INTER },
                    { field: 'status', operator: '==', value: EVENT_STATUS.PENDING }
                ]
            );

            // Enrich events with college names
            const enrichedEvents = await Promise.all((events || []).map(async (event) => {
                if (event.collegeId) {
                    const { data: college } = await getDocument(COLLECTIONS.COLLEGES, event.collegeId);
                    return { ...event, collegeName: college?.name || 'Unknown College' };
                }
                return { ...event, collegeName: 'Unknown College' };
            }));

            setPendingEvents(enrichedEvents);

            // Fetch Pending Colleges
            const { data: colleges } = await queryDocuments(
                COLLECTIONS.COLLEGES,
                [{ field: 'approved', operator: '==', value: false }]
            );
            setPendingColleges(colleges || []);

            // Fetch Pending Companies
            const { data: companies } = await queryDocuments(
                COLLECTIONS.COMPANIES,
                [{ field: 'approved', operator: '==', value: false }]
            );
            setPendingCompanies(companies || []);
        } catch (error) {
            console.error("Error fetching approvals:", error);
            showToast.error("Failed to load approval items");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (userData?.role === USER_ROLES.SUPER_ADMIN) {
            fetchData();
        }
    }, [userData]);

    const handleApproveEvent = async (eventId) => {
        try {
            const { error } = await updateDocument(COLLECTIONS.EVENTS, eventId, {
                status: EVENT_STATUS.APPROVED,
                approvedAt: new Date().toISOString(),
                approvedBy: user.uid
            });
            if (error) throw new Error(error);

            showToast.success('Event approved successfully! It is now visible to students.');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast.error('Failed to approve event');
        }
    };

    const handleRejectEvent = async (eventId) => {
        const reason = prompt('Please enter the reason for rejection (optional):');
        try {
            const { error } = await updateDocument(COLLECTIONS.EVENTS, eventId, {
                status: EVENT_STATUS.REJECTED,
                rejectedAt: new Date().toISOString(),
                rejectedBy: user.uid,
                rejectionReason: reason || 'No reason provided'
            });
            if (error) throw new Error(error);

            showToast.success('Event rejected. The college admin can edit and resubmit.');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast.error('Failed to reject event');
        }
    };

    const handleApproveCollege = async (collegeId, adminId) => {
        try {
            if (!adminId) throw new Error("Admin ID is missing for this college");

            const { error: collegeError } = await updateDocument(COLLECTIONS.COLLEGES, collegeId, { approved: true });
            if (collegeError) throw new Error(`College update failed: ${collegeError}`);

            const { error: userError } = await updateDocument(COLLECTIONS.USERS, adminId, { approvedBySuper: true });
            if (userError) throw new Error(`User update failed: ${userError}`);

            showToast.success('College approved successfully');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast.error(error.message || 'Failed to approve college');
        }
    };

    const handleRejectCollege = async (collegeId, adminId) => {
        if (!confirm('Are you sure you want to reject this college? This will permanently delete its associated admin account.')) return;
        try {
            const { error: collegeError } = await deleteDocument(COLLECTIONS.COLLEGES, collegeId);
            if (collegeError) console.error(collegeError);

            if (adminId) {
                const { error: userError } = await deleteDocument(COLLECTIONS.USERS, adminId);
                if (userError) console.error(userError);

                await fetch('/api/admin/delete-user', {
                    method: 'POST',
                    body: JSON.stringify({ uid: adminId }),
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            showToast.success('College rejected and removed');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast.error(error.message || 'Failed to reject college');
        }
    };

    const handleApproveCompany = async (companyId, adminId) => {
        try {
            if (!adminId) throw new Error("Admin ID is missing for this company");

            const { error: companyError } = await updateDocument(COLLECTIONS.COMPANIES, companyId, { approved: true });
            if (companyError) throw new Error(`Company update failed: ${companyError}`);

            const { error: userError } = await updateDocument(COLLECTIONS.USERS, adminId, { approvedBySuper: true });
            if (userError) throw new Error(`User update failed: ${userError}`);

            showToast.success('Company approved successfully');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast.error(error.message || 'Failed to approve company');
        }
    };

    const handleRejectCompany = async (companyId, adminId) => {
        if (!confirm('Are you sure you want to reject this company? This will permanently delete its associated admin account.')) return;
        try {
            const { error: companyError } = await deleteDocument(COLLECTIONS.COMPANIES, companyId);
            if (companyError) console.error(companyError);

            if (adminId) {
                const { error: userError } = await deleteDocument(COLLECTIONS.USERS, adminId);
                if (userError) console.error(userError);

                await fetch('/api/admin/delete-user', {
                    method: 'POST',
                    body: JSON.stringify({ uid: adminId }),
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            showToast.success('Company rejected and removed');
            fetchData();
        } catch (error) {
            console.error(error);
            showToast.error(error.message || 'Failed to reject company');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading || (userData?.role !== USER_ROLES.SUPER_ADMIN)) {
        return <PageLoader />;
    }

    const tabs = [
        { id: 'events', label: 'External Events', icon: IoCalendar, count: pendingEvents.length },
        { id: 'colleges', label: 'Colleges', icon: IoSchool, count: pendingColleges.length },
        { id: 'companies', label: 'Companies', icon: IoBusiness, count: pendingCompanies.length },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-theme">Pending Approvals</h1>
                        <p className="text-theme-secondary mt-2">Manage external event approvals and registration requests</p>
                    </div>

                    <div className="flex space-x-4 mb-8 border-b border-theme overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-500'
                                    : 'border-transparent text-theme-secondary hover:text-theme'
                                    }`}
                            >
                                <tab.icon size={20} />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className="ml-2 bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {fetching ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'events' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid gap-6 md:grid-cols-2"
                                    >
                                        {pendingEvents.length === 0 ? (
                                            <p className="text-theme-secondary col-span-2 text-center py-8">No pending external event approvals</p>
                                        ) : (
                                            pendingEvents.map((event) => (
                                                <Card key={event.id} className="p-0 overflow-hidden">
                                                    {/* Event Image */}
                                                    {event.posterUrl && (
                                                        <div className="h-40 overflow-hidden">
                                                            <img
                                                                src={event.posterUrl}
                                                                alt={event.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-indigo-500/20 text-indigo-400 mb-2">
                                                                    {event.category || 'Event'}
                                                                </span>
                                                                <h3 className="font-semibold text-lg text-theme">{event.name}</h3>
                                                            </div>
                                                            <Link
                                                                href={`/events/${event.id}`}
                                                                className="text-indigo-400 hover:text-indigo-300 transition-colors p-1"
                                                                title="View Event Details"
                                                            >
                                                                <IoInformationCircle size={24} />
                                                            </Link>
                                                        </div>

                                                        <p className="text-theme-secondary text-sm mb-4 line-clamp-2">
                                                            {event.description}
                                                        </p>

                                                        <div className="space-y-2 text-sm text-theme-secondary mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <IoSchool className="text-indigo-400" />
                                                                <span>{event.collegeName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <IoTime className="text-indigo-400" />
                                                                <span>{formatDate(event.startDate)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <IoLocation className="text-indigo-400" />
                                                                <span>{event.location || 'TBD'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex space-x-3">
                                                            <Button
                                                                onClick={() => handleApproveEvent(event.id)}
                                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                            >
                                                                <IoCheckmarkCircle className="mr-2" /> Approve
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleRejectEvent(event.id)}
                                                                className="flex-1 bg-red-600 hover:bg-red-700"
                                                            >
                                                                <IoCloseCircle className="mr-2" /> Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'colleges' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid gap-6 md:grid-cols-2"
                                    >
                                        {pendingColleges.length === 0 ? (
                                            <p className="text-theme-secondary col-span-2 text-center py-8">No pending college approvals</p>
                                        ) : (
                                            pendingColleges.map((college) => (
                                                <Card key={college.id} className="p-6">
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex-grow">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <IoSchool className="text-indigo-500" size={24} />
                                                                <h3 className="font-semibold text-lg text-theme">{college.name}</h3>
                                                            </div>
                                                            <p className="text-theme-secondary mb-1"><span className="font-medium">Location:</span> {college.location}</p>
                                                        </div>
                                                        <div className="mt-6 flex space-x-3">
                                                            <Button
                                                                onClick={() => handleApproveCollege(college.id, college.adminId)}
                                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                            >
                                                                <IoCheckmarkCircle className="mr-2" /> Approve
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleRejectCollege(college.id, college.adminId)}
                                                                className="flex-1 bg-red-600 hover:bg-red-700"
                                                            >
                                                                <IoCloseCircle className="mr-2" /> Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'companies' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid gap-6 md:grid-cols-2"
                                    >
                                        {pendingCompanies.length === 0 ? (
                                            <p className="text-theme-secondary col-span-2 text-center py-8">No pending company approvals</p>
                                        ) : (
                                            pendingCompanies.map((company) => (
                                                <Card key={company.id} className="p-6">
                                                    <div className="flex flex-col h-full">
                                                        <div className="flex-grow">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <IoBusiness className="text-pink-500" size={24} />
                                                                <h3 className="font-semibold text-lg text-theme">{company.name}</h3>
                                                            </div>
                                                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline text-sm mb-2 block">
                                                                {company.website}
                                                            </a>
                                                        </div>
                                                        <div className="mt-6 flex space-x-3">
                                                            <Button
                                                                onClick={() => handleApproveCompany(company.id, company.adminId)}
                                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                            >
                                                                <IoCheckmarkCircle className="mr-2" /> Approve
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleRejectCompany(company.id, company.adminId)}
                                                                className="flex-1 bg-red-600 hover:bg-red-700"
                                                            >
                                                                <IoCloseCircle className="mr-2" /> Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

