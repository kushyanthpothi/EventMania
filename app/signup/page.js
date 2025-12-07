'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { AuthLayout } from '../components/auth/AuthLayout';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { showToast } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { IoMail, IoCheckmarkCircle, IoArrowForward, IoArrowBack } from 'react-icons/io5';
import { signUpWithEmail, logOut } from '../lib/firebase/auth';
import { createDocument } from '../lib/firebase/firestore';
import { COLLECTIONS } from '../lib/utils/constants';

export default function SignupPage() {
    const router = useRouter();
    const { user, isAuthenticated, needsRoleSelection } = useAuth();
    const [currentStep, setCurrentStep] = useState(1); // 1: name/phone, 2: email/password, 3: verification pending
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !needsRoleSelection) {
            router.push('/dashboard');
        } else if (isAuthenticated && needsRoleSelection) {
            router.push('/select-role');
        }
    }, [isAuthenticated, needsRoleSelection, router]);

    const handleGoogleSuccess = async (googleUser) => {
        router.push('/select-role');
    };

    const validateStep1 = () => {
        if (!formData.displayName?.trim()) {
            showToast.error('Please enter your full name');
            return false;
        }

        if (!formData.phoneNumber?.trim()) {
            showToast.error('Please enter your phone number');
            return false;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
            showToast.error('Please enter a valid 10-digit phone number');
            return false;
        }

        return true;
    };

    const validateStep2 = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            showToast.error('Please fill in all fields');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showToast.error('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 6) {
            showToast.error('Password must be at least 6 characters');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast.error('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep2()) return;

        setLoading(true);

        try {
            const { user: newUser, error } = await signUpWithEmail(formData.email, formData.password, formData.displayName);

            if (error) {
                showToast.error(error);
                setLoading(false);
                return;
            }

            await createDocument(COLLECTIONS.USERS, newUser.uid, {
                name: formData.displayName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: null,
                verified: false,
                createdAt: new Date()
            });

            showToast.success('Verification email sent! Please check your inbox.');
            await logOut();
            setCurrentStep(3);
        } catch (error) {
            showToast.error(`Signup failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (currentStep === 3) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <AuthLayout>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-lg"
                        >
                            <IoMail className="text-white" size={48} />
                        </motion.div>

                        <h2 className="text-3xl font-bold text-white mb-4">Check Your Email</h2>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            We've sent a verification link to <span className="font-semibold text-white">{formData.email}</span>.
                            Please click the link to verify your email address.
                        </p>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <IoCheckmarkCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                <div className="text-sm text-blue-300 text-left">
                                    <p className="font-semibold mb-1">Next Steps:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Check your email inbox (and spam folder)</li>
                                        <li>Click the verification link</li>
                                        <li>Return here to sign in</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/login"
                            className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Go to Sign In
                        </Link>
                    </motion.div>
                </AuthLayout>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <AuthLayout>
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className={`h-2 w-16 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-700'
                            }`} />
                        <div className={`h-2 w-16 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-700'
                            }`} />
                    </div>

                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >


                            <Input
                                label="Full Name"
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                                autoComplete="name"
                            />
                            <Input
                                label="Phone Number"
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                                autoComplete="tel"
                            />

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full py-3 text-lg font-bold flex items-center justify-center gap-2"
                                >
                                    Next Step
                                    <IoArrowForward size={20} />
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >


                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    autoComplete="email"
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    autoComplete="new-password"
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    autoComplete="new-password"
                                />

                                <div className="flex gap-3">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                        <Button
                                            type="button"
                                            onClick={handlePreviousStep}
                                            variant="outline"
                                            className="w-full py-3 text-lg font-bold flex items-center justify-center gap-2"
                                        >
                                            <IoArrowBack size={20} />
                                            Back
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                        <Button
                                            type="submit"
                                            loading={loading}
                                            className="w-full py-3 text-lg font-bold"
                                        >
                                            Sign Up
                                        </Button>
                                    </motion.div>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-900/50 text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <GoogleLoginButton onSuccess={handleGoogleSuccess} iconOnly={true} />
                        <Link
                            href="/login"
                            className="flex-1 text-center border-2 border-slate-600 hover:border-indigo-500 text-white py-3 rounded-xl font-semibold transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </AuthLayout>
            <Footer />
        </div>
    );
}
