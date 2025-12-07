'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { IoLockClosed, IoInformationCircle } from 'react-icons/io5';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleGoogleSuccess = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    <div className="card-theme rounded-2xl shadow-xl p-8 transition-colors duration-300">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 mb-4">
                                <IoLockClosed className="text-white" size={28} />
                            </div>
                            <h2 className="text-3xl font-bold text-theme mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-theme-secondary">
                                Sign in to access your account
                            </p>
                        </div>

                        {showInfo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl"
                            >
                                <div className="flex gap-3">
                                    <IoInformationCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-blue-300">
                                        <p className="font-semibold mb-1">Firebase Setup Required</p>
                                        <p>If you see an authentication error, please enable Google Sign-In in your Firebase Console under Authentication → Sign-in method.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-6">
                            <GoogleLoginButton onSuccess={handleGoogleSuccess} />

                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="w-full text-sm text-theme-secondary hover:text-theme transition-colors"
                            >
                                Having trouble signing in?
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-theme"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-theme-card text-theme-secondary">New to Event Mania?</span>
                                </div>
                            </div>

                            <Link
                                href="/signup"
                                className="block w-full text-center bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}

