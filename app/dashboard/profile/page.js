'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { PageLoader } from '../../components/common/Loader';
import { USER_ROLES } from '../../lib/utils/constants';
import { IoPerson, IoSchool, IoBusiness, IoShieldCheckmark, IoMail, IoLocation, IoGlobe, IoIdCard, IoTimeOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { showToast } from '../../components/common/Toast';

const InfoCard = ({ icon: Icon, label, value, subLabel, className = "" }) => (
    <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Icon size={24} />
                </div>
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h4 className="text-lg font-bold text-gray-900 truncate">{value || 'Not provided'}</h4>
                {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
            </div>
        </div>
    </div>
);

const RoleBadge = ({ role }) => {
    const config = {
        [USER_ROLES.SUPER_ADMIN]: { label: 'Super Administrator', color: 'bg-red-50 text-red-700 border-red-200' },
        [USER_ROLES.COLLEGE_ADMIN]: { label: 'College Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        [USER_ROLES.COMPANY]: { label: 'Company Partner', color: 'bg-pink-50 text-pink-700 border-pink-200' },
        [USER_ROLES.STUDENT]: { label: 'Student', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    };
    const { label, color } = config[role] || config[USER_ROLES.STUDENT];

    return (
        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${color}`}>
            {label}
        </span>
    );
};

const StatusBadge = ({ verified, approved }) => {
    if (verified || approved) {
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                <IoCheckmarkCircle className="mr-1.5" size={16} /> Verified Account
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            <IoTimeOutline className="mr-1.5" size={16} /> Pending Verification
        </span>
    );
};

export default function ProfilePage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            showToast.error('Please login to view your profile');
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <PageLoader />;
    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Header />
            <main className="flex-grow pt-20 pb-20">
                {/* Hero Profile Banner */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 opacity-90"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>

                <div className="w-full px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                        <div className="p-8 sm:p-10">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100 ring-4 ring-indigo-50">
                                        {userData?.profileImg ? (
                                            <img src={userData.profileImg} alt={userData.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                                <IoPerson size={64} className="text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-grow text-center md:text-left pt-2 md:pt-4">
                                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                                        {userData?.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                        <RoleBadge role={userData?.role} />
                                        <StatusBadge verified={userData?.verified} approved={userData?.approvedBySuper} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 text-gray-500 text-sm font-medium">
                                        <div className="flex items-center">
                                            <IoMail className="mr-2 text-gray-400" size={18} />
                                            {userData?.email}
                                        </div>
                                        {userData?.role === USER_ROLES.COLLEGE_ADMIN && (
                                            <div className="flex items-center">
                                                <IoLocation className="mr-2 text-gray-400" size={18} />
                                                {userData?.collegeLocation || 'Location not set'}
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <IoTimeOutline className="mr-2 text-gray-400" size={18} />
                                            Joined {userData?.createdAt?.toDate ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="bg-gray-50/50 p-8 sm:p-10 border-t border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Common Field */}
                                <InfoCard
                                    icon={IoMail}
                                    label="Email Address"
                                    value={userData?.email}
                                    subLabel="Primary contact"
                                />

                                {/* STUDENT FIELDS */}
                                {userData?.role === USER_ROLES.STUDENT && (
                                    <>
                                        <InfoCard
                                            icon={IoIdCard}
                                            label="Registration Number"
                                            value={userData?.registrationNumber}
                                        />
                                        <InfoCard
                                            icon={IoSchool}
                                            label="College ID"
                                            value={userData?.collegeId}
                                            subLabel="Institution Reference"
                                        />
                                    </>
                                )}

                                {/* COLLEGE FIELDS */}
                                {userData?.role === USER_ROLES.COLLEGE_ADMIN && (
                                    <>
                                        <InfoCard
                                            icon={IoSchool}
                                            label="College Name"
                                            value={userData?.collegeName}
                                        />
                                        <InfoCard
                                            icon={IoLocation}
                                            label="Campus Location"
                                            value={userData?.collegeLocation}
                                        />
                                    </>
                                )}

                                {/* COMPANY FIELDS */}
                                {userData?.role === USER_ROLES.COMPANY && (
                                    <>
                                        <InfoCard
                                            icon={IoBusiness}
                                            label="Company Name"
                                            value={userData?.companyName}
                                        />
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                                        <IoGlobe size={24} />
                                                    </div>
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm font-medium text-gray-500 mb-1">Company Website</p>
                                                    <a
                                                        href={userData?.companyWebsite}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-lg font-bold text-indigo-600 hover:text-indigo-700 truncate block transition-colors"
                                                    >
                                                        {userData?.companyWebsite || 'Not provided'}
                                                    </a>
                                                    <p className="text-xs text-gray-400 mt-1">External link</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* SUPER ADMIN FIELDS */}
                                {userData?.role === USER_ROLES.SUPER_ADMIN && (
                                    <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 flex items-center space-x-4">
                                        <div className="bg-white p-3 rounded-xl text-indigo-600 shadow-sm">
                                            <IoShieldCheckmark size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-indigo-900">System Administrator Access</h4>
                                            <p className="text-indigo-700 text-sm">You have elevated privileges to manage the entire platform.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
