'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Dropdown } from '../components/common/Dropdown';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ImageUpload } from '../components/common/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle, IoPerson, IoSchool, IoBusiness } from 'react-icons/io5';
import { USER_ROLES, COLLECTIONS } from '../lib/utils/constants';
import { createDocument, queryDocuments } from '../lib/firebase/firestore';
import { showToast } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';

const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center gap-3 mb-10">
        {[...Array(totalSteps)].map((_, index) => (
            <div key={index} className="flex items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${index + 1 < currentStep
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : index + 1 === currentStep
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl scale-125'
                            : 'bg-theme-surface text-theme-secondary'
                        }`}
                >
                    {index + 1 < currentStep ? <IoCheckmarkCircle size={24} /> : index + 1}
                </motion.div>
                {index < totalSteps - 1 && (
                    <div className={`w-16 h-1.5 mx-3 rounded-full transition-all duration-500 ${index + 1 < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-theme-surface'
                        }`} />
                )}
            </div>
        ))}
    </div>
);

const RoleCard = ({ icon: Icon, title, description, onClick, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="cursor-pointer group"
    >
        <div className="relative p-10 rounded-3xl card-theme hover:border-indigo-400 transition-all shadow-xl hover:shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-br from-indigo-500 to-purple-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                >
                    <Icon className="text-white" size={36} />
                </motion.div>
                <h3 className="text-2xl font-bold text-theme mb-3">{title}</h3>
                <p className="text-theme-secondary leading-relaxed">{description}</p>
            </div>
        </div>
    </motion.div>
);

export default function SelectRolePage() {
    const router = useRouter();
    const { user, isAuthenticated, emailVerified, needsRoleSelection, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1); // 1: role selection, 2: profile completion
    const [role, setRole] = useState('');
    const [colleges, setColleges] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        college: '',
        registrationNumber: '',
        profileImg: '',
        collegeName: '',
        collegeLocation: '',
        companyName: '',
        companyWebsite: ''
    });
    // Add UserData to dependency to pre-fill
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect if not authenticated or email not verified
        if (!authLoading && (!isAuthenticated || !emailVerified)) {
            router.push('/login');
        }
        // Redirect if already has role
        else if (!authLoading && !needsRoleSelection) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, emailVerified, needsRoleSelection, authLoading, router]);

    useEffect(() => {
        if (user || userData) {
            setFormData(prev => ({
                ...prev,
                fullName: userData?.name || user?.displayName || '',
                phoneNumber: userData?.phoneNumber || ''
            }));
        }
    }, [user, userData]);

    useEffect(() => {
        const fetchColleges = async () => {
            const { data } = await queryDocuments(
                COLLECTIONS.COLLEGES,
                [{ field: 'approved', operator: '==', value: true }]
            );
            setColleges(data?.map(c => ({ value: c.id, label: c.name })) || []);
        };
        fetchColleges();
    }, []);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.fullName?.trim() || !formData.phoneNumber?.trim()) {
                showToast.error('Please fill in your name and phone number');
                setLoading(false);
                return;
            }

            const baseUserData = {
                uid: user.uid,
                name: formData.fullName,
                email: user.email,
                phoneNumber: formData.phoneNumber,
                role,
                verified: false,
                approvedBySuper: false
            };

            if (role === USER_ROLES.STUDENT) {
                const userData = {
                    ...baseUserData,
                    collegeId: formData.college,
                    registrationNumber: formData.registrationNumber,
                    profileImg: formData.profileImg
                };

                const { error: userError } = await createDocument(COLLECTIONS.USERS, user.uid, userData);
                if (userError) throw new Error(userError);

                showToast.success('Profile created! Awaiting college admin verification.');
            } else if (role === USER_ROLES.COLLEGE_ADMIN) {
                const userData = {
                    ...baseUserData,
                    collegeName: formData.collegeName,
                    collegeLocation: formData.collegeLocation
                };

                const { error: userError } = await createDocument(COLLECTIONS.USERS, user.uid, baseUserData);
                if (userError) throw new Error(userError);

                const { error: collegeError } = await createDocument(COLLECTIONS.COLLEGES, `college_${user.uid}`, {
                    name: formData.collegeName,
                    adminId: user.uid,
                    location: formData.collegeLocation,
                    approved: false
                });
                if (collegeError) throw new Error(collegeError);

                showToast.success('Registration submitted! Awaiting super admin approval.');
            } else if (role === USER_ROLES.COMPANY) {
                const userData = {
                    ...baseUserData,
                    companyName: formData.companyName,
                    companyWebsite: formData.companyWebsite
                };

                const { error: userError } = await createDocument(COLLECTIONS.USERS, user.uid, baseUserData);
                if (userError) throw new Error(userError);

                const { error: companyError } = await createDocument(COLLECTIONS.COMPANIES, `company_${user.uid}`, {
                    name: formData.companyName,
                    adminId: user.uid,
                    website: formData.companyWebsite,
                    approved: false
                });
                if (companyError) throw new Error(companyError);

                showToast.success('Registration submitted! Awaiting super admin approval.');
            }

            router.push('/dashboard');
        } catch (error) {
            showToast.error(`Registration failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-theme">
                <div className="text-theme">Loading...</div>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
                <Header />
                <main className="flex-grow flex items-center justify-center py-16 px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-5xl w-full"
                    >
                        <div className="text-center mb-12">
                            <StepIndicator currentStep={1} totalSteps={2} />
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold text-theme mb-4"
                            >
                                Select Your Role
                            </motion.h2>
                            <p className="text-theme-secondary text-lg">Choose how you want to use Event Mania</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <RoleCard
                                icon={IoPerson}
                                title="Student"
                                description="Discover and register for amazing college events"
                                onClick={() => handleRoleSelect(USER_ROLES.STUDENT)}
                                delay={0}
                            />
                            <RoleCard
                                icon={IoSchool}
                                title="College Admin"
                                description="Manage your college and verify student registrations"
                                onClick={() => handleRoleSelect(USER_ROLES.COLLEGE_ADMIN)}
                                delay={0.1}
                            />
                            <RoleCard
                                icon={IoBusiness}
                                title="Company"
                                description="Sponsor events and connect with talented students"
                                onClick={() => handleRoleSelect(USER_ROLES.COMPANY)}
                                delay={0.2}
                            />
                        </div>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow flex items-center justify-center py-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl w-full"
                >
                    <div className="card-theme rounded-3xl shadow-2xl p-10 transition-colors duration-300">
                        <StepIndicator currentStep={2} totalSteps={2} />

                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-bold text-theme mb-3">Complete Your Profile</h2>
                            <p className="text-theme-secondary text-lg">
                                {role === USER_ROLES.STUDENT && 'Student Information'}
                                {role === USER_ROLES.COLLEGE_ADMIN && 'College Information'}
                                {role === USER_ROLES.COMPANY && 'Company Information'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4 mb-6">
                                <h3 className="text-xl font-semibold text-theme border-b border-theme/10 pb-2">Personal Details</h3>
                                <Input
                                    label="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <AnimatePresence mode="wait">
                                {role === USER_ROLES.STUDENT && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <Dropdown
                                            label="Select College"
                                            options={colleges}
                                            value={formData.college}
                                            onChange={(value) => setFormData({ ...formData, college: value })}
                                            required
                                        />
                                        <Input
                                            label="Registration Number"
                                            name="registrationNumber"
                                            value={formData.registrationNumber}
                                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                            required
                                        />
                                        <ImageUpload
                                            label="Profile Photo"
                                            onUploadComplete={(url) => setFormData({ ...formData, profileImg: url })}
                                            required
                                        />
                                    </motion.div>
                                )}

                                {role === USER_ROLES.COLLEGE_ADMIN && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <Input
                                            label="College Name"
                                            name="collegeName"
                                            value={formData.collegeName}
                                            onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="College Location"
                                            name="collegeLocation"
                                            value={formData.collegeLocation}
                                            onChange={(e) => setFormData({ ...formData, collegeLocation: e.target.value })}
                                            required
                                        />
                                    </motion.div>
                                )}

                                {role === USER_ROLES.COMPANY && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <Input
                                            label="Company Name"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Company Website"
                                            name="companyWebsite"
                                            type="url"
                                            value={formData.companyWebsite}
                                            onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                                            required
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button type="submit" loading={loading} className="w-full py-4 text-lg font-bold">
                                    Complete Registration
                                </Button>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
