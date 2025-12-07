'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSparkles, IoCalendar, IoTrophy, IoPeople, IoRocket } from 'react-icons/io5';

const slides = [
    {
        icon: IoSparkles,
        title: 'Discover Amazing Events',
        description: 'Find and participate in exciting college events, competitions, and workshops from institutions across the country.'
    },
    {
        icon: IoCalendar,
        title: 'Easy Event Management',
        description: 'Organize and manage your events seamlessly with our intuitive dashboard and powerful tools.'
    },
    {
        icon: IoTrophy,
        title: 'Showcase Your Talent',
        description: 'Participate in inter-college competitions and showcase your skills to a wider audience.'
    },
    {
        icon: IoPeople,
        title: 'Connect & Network',
        description: 'Build connections with students from different colleges and expand your professional network.'
    },
    {
        icon: IoRocket,
        title: 'Boost Your Profile',
        description: 'Track your participation, achievements, and build an impressive portfolio for your future.'
    }
];

export const AuthLayout = ({ children, title }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const currentSlideData = slides[currentSlide];
    const Icon = currentSlideData.icon;

    return (
        <div className="min-h-screen flex relative overflow-hidden pt-16">
            {/* Cursor-following gradient background */}
            <div
                className="absolute inset-0 transition-all duration-1000 ease-out"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                        rgba(99, 102, 241, 0.3) 0%, 
                        rgba(168, 85, 247, 0.2) 25%, 
                        rgba(236, 72, 153, 0.15) 50%, 
                        rgba(14, 165, 233, 0.1) 75%, 
                        transparent 100%),
                        linear-gradient(135deg, 
                        rgba(15, 23, 42, 1) 0%, 
                        rgba(30, 41, 59, 1) 50%, 
                        rgba(15, 23, 42, 1) 100%)`
                }}
            />

            <div className="relative z-10 w-full flex flex-col lg:flex-row">
                {/* Left side - Information Panel */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
                    <div className="max-w-lg w-full">
                        {/* Logo/Brand */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12"
                        >
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                                Event Mania
                            </h1>
                            <p className="text-gray-300 text-lg">
                                Your Gateway to Campus Events
                            </p>
                        </motion.div>

                        {/* Sliding Information */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
                                    <Icon className="text-white" size={40} />
                                </div>
                                <h2 className="text-3xl font-bold text-white">
                                    {currentSlideData.title}
                                </h2>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {currentSlideData.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide indicators */}
                        <div className="flex gap-2 mt-12">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'w-12 bg-gradient-to-r from-indigo-500 to-purple-500'
                                        : 'w-6 bg-gray-600 hover:bg-gray-500'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-700/50">
                            {children}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
