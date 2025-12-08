'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoMenu, IoClose, IoLogOut, IoPerson, IoColorPalette, IoSunny, IoMoon, IoPhonePortrait, IoChevronForward } from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../context/ThemeContext';
import { logOut } from '../../lib/firebase/auth';
import { showToast } from '../common/Toast';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
    const { user, userData, isAuthenticated } = useAuth();
    const { unreadCount } = useNotifications();
    const { theme, changeTheme, resolvedTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        const { error } = await logOut();
        if (error) {
            showToast.error(`Logout failed: ${error}`);
        } else {
            showToast.success('Logged out successfully');
            router.push('/');
        }
    };

    const themeOptions = [
        { value: 'light', label: 'Light', icon: IoSunny },
        { value: 'dark', label: 'Dark', icon: IoMoon },
        { value: 'system', label: 'System', icon: IoPhonePortrait },
    ];

    const handleThemeChange = (newTheme) => {
        changeTheme(newTheme);
        setThemeMenuOpen(false);
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/events', label: 'Events' },
        { href: '/about', label: 'About' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-30 transition-all duration-300 backdrop-blur-md bg-transparent">
            <nav className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="text-2xl font-bold text-white">
                            Event Mania
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-white/90 hover:text-white transition-colors font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setProfileMenuOpen(!profileMenuOpen);
                                                setThemeMenuOpen(false);
                                            }}
                                            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/20 text-white border border-white/30 flex items-center justify-center">
                                                {userData?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {profileMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 border transition-colors duration-300"
                                                    style={{
                                                        backgroundColor: 'rgb(var(--dropdown-bg))',
                                                        borderColor: 'rgb(var(--card-border))',
                                                    }}
                                                >
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center px-4 py-2 hover:bg-indigo-500/10 transition-colors"
                                                        style={{ color: 'rgb(var(--text-primary))' }}
                                                        onClick={() => setProfileMenuOpen(false)}
                                                    >
                                                        <IoPerson className="mr-3" size={18} />
                                                        Dashboard
                                                    </Link>

                                                    {/* Theme Submenu */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                                                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-indigo-500/10 transition-colors"
                                                            style={{ color: 'rgb(var(--text-primary))' }}
                                                        >
                                                            <div className="flex items-center">
                                                                <IoColorPalette className="mr-3" size={18} />
                                                                Theme
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="text-xs mr-2 capitalize" style={{ color: 'rgb(var(--text-secondary))' }}>
                                                                    {theme}
                                                                </span>
                                                                <IoChevronForward
                                                                    size={14}
                                                                    className={`transition-transform ${themeMenuOpen ? 'rotate-90' : ''}`}
                                                                    style={{ color: 'rgb(var(--text-secondary))' }}
                                                                />
                                                            </div>
                                                        </button>

                                                        <AnimatePresence>
                                                            {themeMenuOpen && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="pl-6 py-1">
                                                                        {themeOptions.map((option) => (
                                                                            <button
                                                                                key={option.value}
                                                                                onClick={() => handleThemeChange(option.value)}
                                                                                className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${theme === option.value
                                                                                    ? 'bg-indigo-500/20 text-indigo-400'
                                                                                    : 'hover:bg-indigo-500/10'
                                                                                    }`}
                                                                                style={{
                                                                                    color: theme === option.value
                                                                                        ? undefined
                                                                                        : 'rgb(var(--text-primary))'
                                                                                }}
                                                                            >
                                                                                <option.icon className="mr-3" size={16} />
                                                                                {option.label}
                                                                                {theme === option.value && (
                                                                                    <span className="ml-auto text-indigo-400">✓</span>
                                                                                )}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <div className="border-t my-1" style={{ borderColor: 'rgb(var(--card-border))' }} />

                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setProfileMenuOpen(false);
                                                        }}
                                                        className="w-full flex items-center px-4 py-2 hover:bg-red-500/10 text-red-400 transition-colors"
                                                    >
                                                        <IoLogOut className="mr-3" size={18} />
                                                        Logout
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-white/90 hover:text-white transition-colors font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 border border-white/30 transition-colors font-medium"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-white"
                    >
                        {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t"
                            style={{ borderColor: 'rgb(var(--card-border))' }}
                        >
                            <div className="py-4 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block px-4 py-2 hover:bg-indigo-500/10 transition-colors"
                                        style={{ color: 'rgb(var(--text-primary))' }}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 hover:bg-indigo-500/10 transition-colors"
                                            style={{ color: 'rgb(var(--text-primary))' }}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>

                                        {/* Mobile Theme Options */}
                                        <div className="px-4 py-2">
                                            <div className="flex items-center mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                                                <IoColorPalette className="mr-2" size={18} />
                                                Theme
                                            </div>
                                            <div className="flex gap-2 ml-6">
                                                {themeOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleThemeChange(option.value)}
                                                        className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${theme === option.value
                                                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                                            : 'hover:bg-indigo-500/10'
                                                            }`}
                                                        style={{
                                                            color: theme === option.value
                                                                ? undefined
                                                                : 'rgb(var(--text-primary))'
                                                        }}
                                                    >
                                                        <option.icon className="mr-1" size={14} />
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 transition-colors"
                                        >
                                            <IoLogOut className="inline mr-2" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block px-4 py-2 hover:bg-indigo-500/10 transition-colors"
                                            style={{ color: 'rgb(var(--text-primary))' }}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="block px-4 py-2 bg-indigo-600 text-white rounded-lg mx-4 text-center hover:bg-indigo-700 transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};
