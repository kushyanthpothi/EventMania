'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { Header } from '../../../../components/layout/Header';
import { Footer } from '../../../../components/layout/Footer';
import { PageLoader } from '../../../../components/common/Loader';
import { Button } from '../../../../components/common/Button';
import { getDocument, queryDocuments } from '../../../../lib/firebase/firestore';
import { COLLECTIONS, USER_ROLES } from '../../../../lib/utils/constants';
import { formatDate } from '../../../../lib/utils/helpers';
import { IoArrowBack, IoDownload, IoMail, IoCall, IoPerson, IoPeople } from 'react-icons/io5';
import Link from 'next/link';

export default function EventRegistrationsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userData, loading: authLoading } = useAuth();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only College Admin or Super Admin should view this
        if (!authLoading && userData && userData.role !== USER_ROLES.COLLEGE_ADMIN && userData.role !== USER_ROLES.SUPER_ADMIN) {
            router.push('/dashboard');
            return;
        }
    }, [userData, authLoading, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            try {
                // 1. Fetch Event Details
                const { data: eventData, error: eventError } = await getDocument(COLLECTIONS.EVENTS, params.id);
                if (eventError) throw new Error(eventError);
                setEvent(eventData);

                // 2. Fetch Registrations
                const { data: regData, error: regError } = await queryDocuments(COLLECTIONS.REGISTRATIONS, [
                    { field: 'eventId', operator: '==', value: params.id }
                ]);
                if (regError) console.error("Error fetching registrations:", regError);
                setRegistrations(regData || []);

            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userData) {
            fetchData();
        }
    }, [params.id, userData]);

    if (loading || authLoading) return <PageLoader />;
    if (!event) return null;

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <Link href="/dashboard" className="inline-flex items-center text-theme-secondary hover:text-indigo-500 transition-colors mb-4">
                                <IoArrowBack className="mr-2" /> Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold text-theme">{event.name}</h1>
                            <p className="text-theme-secondary mt-1">
                                Registrations • <span className="font-semibold text-indigo-500">{registrations.length}</span> students registered
                            </p>
                        </div>
                        {/* Future feature: Export to CSV */}
                        <Button variant="outline" className="mt-4 md:mt-0" onClick={() => alert("Export feature coming soon!")}>
                            <IoDownload className="mr-2" /> Export List
                        </Button>
                    </div>

                    {/* Registrations List */}
                    <div
                        className="card-theme rounded-2xl shadow-xl overflow-hidden border border-theme"
                        style={{ backgroundColor: 'rgb(var(--card-bg))' }}
                    >
                        {registrations.length === 0 ? (
                            <div className="p-12 text-center text-theme-secondary">
                                <IoPeople size={48} className="mx-auto text-theme-secondary opacity-50 mb-4" />
                                <p className="text-lg font-medium">No registrations yet.</p>
                                <p className="text-sm">Share your event to get more students!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-theme">
                                    <thead style={{ backgroundColor: 'rgb(var(--surface))' }}>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Contact</th>
                                            {event.isTeam && (
                                                <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Team</th>
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Registered At</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme">
                                        {registrations.map((reg) => (
                                            <tr
                                                key={reg.id}
                                                className="hover:bg-indigo-500/5 transition-colors"
                                                style={{ backgroundColor: 'rgb(var(--card-bg))' }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                                                            {reg.studentName?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-theme">{reg.studentName}</div>
                                                            <div className="text-xs text-theme-secondary">ID: {reg.studentId?.substring(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col space-y-1">
                                                        <div className="flex items-center text-sm text-theme-secondary">
                                                            <IoMail className="mr-2 text-indigo-400" size={16} />
                                                            {reg.studentEmail}
                                                        </div>
                                                        <div className="flex items-center text-sm text-theme-secondary">
                                                            <IoCall className="mr-2 text-indigo-400" size={16} />
                                                            {reg.studentPhone}
                                                        </div>
                                                    </div>
                                                </td>
                                                {event.isTeam && (
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-indigo-400">{reg.teamName}</div>
                                                        <div className="text-xs text-theme-secondary mt-1">
                                                            Members:<br />
                                                            {reg.teamMembers?.map(m => m.name).join(', ')}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">
                                                    {formatDate(reg.registeredAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                                                        Confirmed
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

