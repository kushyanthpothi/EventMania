'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const EventFormLayout = ({ children, previewCard }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    return (
        <div className="min-h-screen flex relative bg-theme">
            <div className="relative z-10 w-full flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8">
                {/* Left side - Event Card Preview */}
                <div className="w-full lg:w-1/2 flex items-start justify-center lg:sticky lg:top-24 lg:h-fit">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-white mb-2">Live Preview</h2>
                            <p className="text-gray-400 text-sm">See how your event will appear to users</p>
                        </div>
                        <div className="w-full">
                            {previewCard}
                        </div>
                    </motion.div>
                </div>

                {/* Right side - Form */}
                <div className="w-full lg:w-1/2 flex items-start justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-2xl"
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
