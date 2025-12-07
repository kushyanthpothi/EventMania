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
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { IoInformationCircle, IoMailOutline } from 'react-icons/io5';
import { signInWithEmail } from '../lib/firebase/auth';
import { showToast } from '../components/common/Toast';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, needsRoleSelection } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            if (needsRoleSelection) {
                router.push('/select-role');
            } else {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, needsRoleSelection, router]);

    const handleGoogleSuccess = () => {
        // Will be redirected by useEffect based on role selection status
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowResendVerification(false);

        try {
            const { user, error, needsVerification } = await signInWithEmail(formData.email, formData.password);

            if (error) {
                if (needsVerification) {
                    setShowResendVerification(true);
                    setUnverifiedEmail(formData.email);
                }
                showToast.error(error);
                setLoading(false);
                return;
            }

            showToast.success('Signed in successfully!');
            // Redirect will be handled by useEffect
        } catch (error) {
            showToast.error(`Sign in failed: ${error.message}`);
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        try {
            showToast.info('Please check your spam folder or sign up again to receive a new verification email.');
        } catch (error) {
            showToast.error('Failed to resend verification email');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            showToast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const checkRes = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resetEmail }),
            });

            const checkData = await checkRes.json();

            if (!checkData.exists) {
                showToast.error('No account found with this email address.');
                setLoading(false);
                return;
            }

            const { resetPassword } = await import('../lib/firebase/auth');
            const { error } = await resetPassword(resetEmail);

            if (error) {
                showToast.error(error);
            } else {
                showToast.success('Password reset email sent! Check your inbox.');
                setShowForgotPassword(false);
                setResetEmail('');
            }
        } catch (error) {
            console.error(error);
            showToast.error('Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <AuthLayout>
                <AnimatePresence mode="wait">
                    {showForgotPassword ? (
                        <motion.div
                            key="forgot-password"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Reset Password
                                </h2>
                                <p className="text-gray-400">
                                    Enter your email to receive a reset link
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <div className="flex gap-3">
                                    <IoMailOutline className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-blue-300">
                                        <p className="font-semibold mb-1">Reset Your Password</p>
                                        <p>Enter your email address and we'll send you a link to reset your password.</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                                <Button type="submit" loading={loading} className="w-full">
                                    Send Reset Link
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(false)}
                                    className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Back to Sign In
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="signin"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white">
                                    Welcome Back
                                </h2>
                            </div>

                            {showResendVerification && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
                                >
                                    <div className="flex gap-3">
                                        <IoInformationCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                                        <div className="text-sm text-yellow-300">
                                            <p className="font-semibold mb-1">Email Not Verified</p>
                                            <p className="mb-2">Please check your email inbox (and spam folder) for the verification link.</p>
                                            <button
                                                onClick={handleResendVerification}
                                                className="text-yellow-200 underline hover:text-yellow-100"
                                            >
                                                Need help?
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

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
                                    autoComplete="current-password"
                                />

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button type="submit" loading={loading} className="w-full py-3 text-lg font-bold">
                                        Sign In
                                    </Button>
                                </motion.div>
                            </form>

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
                                    href="/signup"
                                    className="flex-1 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </AuthLayout>
            <Footer />
        </div>
    );
}
