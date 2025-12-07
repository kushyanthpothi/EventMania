'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoCloseCircle, IoReload } from 'react-icons/io5';
import { verifyEmail } from '../lib/firebase/auth';
import Link from 'next/link';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleVerification = async () => {
            const mode = searchParams.get('mode');
            const oobCode = searchParams.get('oobCode');

            // Check if this is an email verification action
            if (mode !== 'verifyEmail' || !oobCode) {
                setStatus('error');
                setErrorMessage('Invalid verification link.');
                return;
            }

            // Verify the email
            const { error } = await verifyEmail(oobCode);

            if (error) {
                setStatus('error');
                setErrorMessage(error);
            } else {
                setStatus('success');
                // Auto-redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        };

        handleVerification();
    }, [searchParams, router]);

    return (
        <div className="card-theme rounded-3xl shadow-2xl p-10 transition-colors duration-300 text-center">
            {status === 'verifying' && (
                <>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-6 shadow-lg"
                    >
                        <IoReload className="text-white" size={48} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-theme mb-4">Verifying Your Email</h2>
                    <p className="text-theme-secondary">Please wait while we verify your email address...</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-lg"
                    >
                        <IoCheckmarkCircle className="text-white" size={48} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-theme mb-4">Email Verified!</h2>
                    <p className="text-theme-secondary mb-6">
                        Your email has been successfully verified. You can now sign in to your account.
                    </p>
                    <p className="text-sm text-theme-secondary mb-6">
                        Redirecting to sign in page in 3 seconds...
                    </p>
                    <Link
                        href="/login"
                        className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                        Sign In Now
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 mb-6 shadow-lg"
                    >
                        <IoCloseCircle className="text-white" size={48} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-theme mb-4">Verification Failed</h2>
                    <p className="text-theme-secondary mb-6">{errorMessage}</p>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                        <p className="text-sm text-red-300">
                            The verification link may have expired or is invalid. Please try signing up again or contact support.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/signup"
                            className="flex-1 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Sign Up Again
                        </Link>
                        <Link
                            href="/login"
                            className="flex-1 text-center border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow flex items-center justify-center py-16 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <Suspense fallback={
                        <div className="card-theme rounded-3xl shadow-2xl p-10 transition-colors duration-300 text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-theme-surface mb-6 animate-pulse" />
                            <div className="h-8 bg-theme-surface rounded w-3/4 mx-auto mb-4 animate-pulse" />
                            <div className="h-4 bg-theme-surface rounded w-1/2 mx-auto animate-pulse" />
                        </div>
                    }>
                        <VerifyContent />
                    </Suspense>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
