'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { showToast } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { IoSparkles, IoMail, IoCheckmarkCircle } from 'react-icons/io5';
import { signUpWithEmail, logOut } from '../lib/firebase/auth';
import { createDocument } from '../lib/firebase/firestore';
import { COLLECTIONS } from '../lib/utils/constants';

export default function SignupPage() {
    const router = useRouter();
    const { user, isAuthenticated, needsRoleSelection } = useAuth();
    const [step, setStep] = useState(1); // 1: signup form, 2: verification pending
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If user is authenticated and has selected role, redirect to dashboard
        if (isAuthenticated && !needsRoleSelection) {
            router.push('/dashboard');
        }
        // If user is authenticated but needs role selection, redirect to role selection
        else if (isAuthenticated && needsRoleSelection) {
            router.push('/select-role');
        }
    }, [isAuthenticated, needsRoleSelection, router]);

    const handleGoogleSuccess = async (googleUser) => {
        // Google users skip email verification
        // Check if they need role selection
        router.push('/select-role');
    };

    const validateForm = () => {
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

        if (!formData.displayName?.trim()) {
            showToast.error('Please enter your full name');
            return false;
        }

        if (!formData.phoneNumber?.trim()) {
            showToast.error('Please enter your phone number');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const { user: newUser, error } = await signUpWithEmail(formData.email, formData.password, formData.displayName);

            if (error) {
                showToast.error(error);
                setLoading(false);
                return;
            }

            // Create user document with initial details
            await createDocument(COLLECTIONS.USERS, newUser.uid, {
                name: formData.displayName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: null, // Role will be selected later
                verified: false,
                createdAt: new Date()
            });

            // Email verification sent automatically in signUpWithEmail
            showToast.success('Verification email sent! Please check your inbox.');

            // Logout the user immediately
            await logOut();

            // Show verification pending screen
            setStep(2);
        } catch (error) {
            showToast.error(`Signup failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
                <Header />
                <main className="flex-grow flex items-center justify-center py-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full"
                    >
                        <div className="card-theme rounded-3xl shadow-2xl p-10 transition-colors duration-300 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-lg"
                            >
                                <IoMail className="text-white" size={48} />
                            </motion.div>

                            <h2 className="text-3xl font-bold text-theme mb-4">Check Your Email</h2>
                            <p className="text-theme-secondary mb-6 leading-relaxed">
                                We've sent a verification link to <span className="font-semibold text-theme">{formData.email}</span>.
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
                    transition={{ duration: 0.6 }}
                    className="max-w-md w-full"
                >
                    <div className="card-theme rounded-3xl shadow-2xl p-10 transition-colors duration-300">
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-6 shadow-lg"
                            >
                                <IoSparkles className="text-white" size={36} />
                            </motion.div>
                            <h2 className="text-4xl font-bold text-theme mb-3">Create Account</h2>
                            <p className="text-theme-secondary">Join Event Mania today</p>
                        </div>

                        <div className="space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
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

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button type="submit" loading={loading} className="w-full py-3 text-lg font-bold">
                                        Sign Up
                                    </Button>
                                </motion.div>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-theme"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-theme-card text-theme-secondary">Or continue with</span>
                                </div>
                            </div>

                            <GoogleLoginButton onSuccess={handleGoogleSuccess} text="Sign up with Google" />

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-theme"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-theme-card text-theme-secondary">Already have an account?</span>
                                </div>
                            </div>

                            <Link
                                href="/login"
                                className="block w-full text-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
