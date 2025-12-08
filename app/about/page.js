'use client';

import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';

const teamMembers = [
    {
        name: 'Praveen Kumar',
        role: 'Team Leader',
        description: 'Leading the vision and strategy of Event Mania',
        gradient: 'from-violet-600 to-indigo-600',
        icon: '👑'
    },
    {
        name: 'MahendraNath',
        role: 'Co-Leader',
        description: 'Coordinating team efforts and project milestones',
        gradient: 'from-indigo-600 to-blue-600',
        icon: '⭐'
    },
    {
        name: 'Venkatesh',
        role: 'Developer',
        description: 'Building robust features and functionality',
        gradient: 'from-blue-600 to-cyan-600',
        icon: '💻'
    },
    {
        name: 'Joshi',
        role: 'Designer',
        description: 'Crafting beautiful and intuitive user experiences',
        gradient: 'from-pink-600 to-rose-600',
        icon: '🎨'
    },
    {
        name: 'Kushyanth',
        role: 'Backend Developer',
        description: 'Powering the platform with scalable infrastructure',
        gradient: 'from-emerald-600 to-teal-600',
        icon: '⚙️'
    }
];

const features = [
    {
        icon: '🎪',
        title: 'Event Discovery',
        description: 'Browse and discover exciting events from colleges across the country'
    },
    {
        icon: '📝',
        title: 'Easy Registration',
        description: 'Register for events with just a few clicks and track your participation'
    },
    {
        icon: '🏫',
        title: 'College Events',
        description: 'Access both intra-college and inter-college events seamlessly'
    },
    {
        icon: '👨‍💼',
        title: 'Admin Dashboard',
        description: 'Powerful tools for college admins to create and manage events'
    },
    {
        icon: '🔔',
        title: 'Real-time Updates',
        description: 'Stay informed with instant notifications about your events'
    },
    {
        icon: '🔒',
        title: 'Secure Platform',
        description: 'Role-based authentication ensuring data security'
    }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-36 pb-20 lg:pb-32">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/20 pointer-events-none" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

                    <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                                ✨ Welcome to Event Mania
                            </span>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-theme mb-6">
                                Where Campus Events
                                <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                                    Come Alive
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-theme-secondary max-w-3xl mx-auto leading-relaxed">
                                The ultimate platform for discovering, organizing, and participating in college events.
                                From cultural fests to hackathons – we bring everything under one roof.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* What We Do Section */}
                <section className="py-20 relative">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-theme mb-4">
                                What We Do
                            </h2>
                            <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
                                We bridge the gap between students and events, making campus life more vibrant and connected.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group relative card-theme rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative">
                                        <span className="text-4xl mb-4 block">{feature.icon}</span>
                                        <h3 className="text-xl font-bold text-theme mb-2">{feature.title}</h3>
                                        <p className="text-theme-secondary">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: '50+', label: 'Colleges' },
                                { value: '1000+', label: 'Events' },
                                { value: '10K+', label: 'Students' },
                                { value: '99%', label: 'Satisfaction' }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                                    <div className="text-indigo-200 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-20 relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="relative w-full px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-20"
                        >
                            <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
                                👥 Our Amazing Team
                            </span>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-theme mb-6">
                                Meet The Creators
                            </h2>
                            <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
                                Talented individuals united by passion, innovation, and the drive to transform campus events.
                            </p>
                        </motion.div>

                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {teamMembers.map((member, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    className="group relative"
                                >
                                    {/* Card container */}
                                    <div className="relative h-full card-theme rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500">
                                        {/* Animated gradient border effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                                            <div className="absolute inset-[2px] card-theme rounded-3xl" />
                                        </div>

                                        {/* Content */}
                                        <div className="relative p-8 flex flex-col items-center text-center h-full">
                                            {/* Hexagonal avatar container */}
                                            <motion.div
                                                className="relative mb-6"
                                                whileHover={{ rotate: 360, scale: 1.1 }}
                                                transition={{ duration: 0.8, type: "spring" }}
                                            >
                                                {/* Outer glow ring */}
                                                <div className={`absolute -inset-4 bg-gradient-to-br ${member.gradient} rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500`} />

                                                {/* Rotating border */}
                                                <div className="relative">
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-full animate-spin`} style={{ animationDuration: '3s' }} />
                                                    <div className="absolute inset-[3px] card-theme rounded-full" />

                                                    {/* Avatar */}
                                                    <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-5xl shadow-2xl`}>
                                                        {member.icon}
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Name */}
                                            <h3 className="text-2xl font-bold text-theme mb-2 group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                                {member.name}
                                            </h3>

                                            {/* Role with animated underline */}
                                            <div className="relative mb-4">
                                                <p className={`text-base font-semibold bg-gradient-to-r ${member.gradient} text-transparent bg-clip-text`}>
                                                    {member.role}
                                                </p>
                                                <div className={`h-0.5 bg-gradient-to-r ${member.gradient} mt-2 w-0 group-hover:w-full transition-all duration-500 mx-auto`} />
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-theme-secondary leading-relaxed flex-grow">
                                                {member.description}
                                            </p>

                                            {/* Decorative dots */}
                                            <div className="flex gap-1.5 mt-6">
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${member.gradient}`}
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                            opacity: [0.5, 1, 0.5]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: i * 0.2
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Corner accent */}
                                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative card-theme rounded-3xl p-8 md:p-12 text-center overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10" />
                            <div className="relative">
                                <h2 className="text-3xl md:text-4xl font-bold text-theme mb-4">
                                    Ready to Get Started?
                                </h2>
                                <p className="text-lg text-theme-secondary mb-8 max-w-2xl mx-auto">
                                    Join thousands of students already using Event Mania to discover amazing campus events.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="/events"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25"
                                    >
                                        Explore Events
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </a>
                                    <a
                                        href="mailto:support@eventmania.com"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-indigo-500/50 text-indigo-400 font-semibold hover:bg-indigo-500/10 transition-all duration-300"
                                    >
                                        Contact Us
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
