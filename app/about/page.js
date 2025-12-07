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
                <section className="relative overflow-hidden py-20 lg:py-32">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/20 pointer-events-none" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2" />
                    <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-theme mb-4">
                                Meet Our Team
                            </h2>
                            <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
                                The passionate minds behind Event Mania, working together to revolutionize campus events.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {teamMembers.map((member, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group"
                                >
                                    <div className="relative card-theme rounded-2xl p-6 text-center overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                        {/* Gradient overlay on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                        {/* Icon */}
                                        <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                                            {member.icon}
                                        </div>

                                        {/* Info */}
                                        <h3 className="text-lg font-bold text-theme mb-1">{member.name}</h3>
                                        <p className={`text-sm font-semibold bg-gradient-to-r ${member.gradient} text-transparent bg-clip-text mb-3`}>
                                            {member.role}
                                        </p>
                                        <p className="text-sm text-theme-secondary">
                                            {member.description}
                                        </p>
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
