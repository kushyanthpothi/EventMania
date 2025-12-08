'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
  IoCalendar, IoLocation, IoPeople, IoTrophy, IoRocket, IoSparkles,
  IoStar, IoFlash, IoHeart, IoSearch, IoTicket, IoSchool,
  IoNotifications, IoCheckmarkCircle, IoArrowForward, IoTrendingUp,
  IoGlobe, IoTime, IoPersonAdd, IoEye, IoRibbon
} from 'react-icons/io5';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { queryDocuments } from './lib/firebase/firestore';
import { COLLECTIONS, EVENT_STATUS, EVENT_TYPES } from './lib/utils/constants';
import { EventCard } from './components/events/EventCard';
import { formatDate } from './lib/utils/helpers';
import { useAuth } from './hooks/useAuth';

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    const incrementTime = (duration * 1000) / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, Math.max(incrementTime, 10));

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Feature card component
const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group relative"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-500 blur-xl`}></div>
    <div className="relative h-full p-8 rounded-3xl card-theme border border-theme shadow-lg group-hover:shadow-2xl transition-all duration-300">
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-6 shadow-lg`}>
        <Icon className="text-white" size={28} />
      </div>
      <h3 className="text-xl font-bold text-theme mb-3">{title}</h3>
      <p className="text-theme-secondary leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// Step card component for How It Works
const StepCard = ({ number, icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative text-center group"
  >
    <div className="relative mx-auto mb-6">
      {/* Icon Circle */}
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl group-hover:shadow-indigo-500/30 transition-shadow duration-300">
        <Icon className="text-white" size={32} />
      </div>
    </div>
    <h3 className="text-xl font-bold text-theme mb-2">{title}</h3>
    <p className="text-theme-secondary">{description}</p>
  </motion.div>
);

// Testimonial card
const TestimonialCard = ({ name, college, text, rating, avatar }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl card-theme border border-theme shadow-lg"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <IoStar key={i} className="text-yellow-500" size={18} />
      ))}
    </div>
    <p className="text-theme-secondary mb-6 italic">"{text}"</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
        {avatar}
      </div>
      <div>
        <p className="font-semibold text-theme">{name}</p>
        <p className="text-sm text-theme-secondary">{college}</p>
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({ events: 0, students: 0, colleges: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const { data: events } = await queryDocuments(
        COLLECTIONS.EVENTS,
        [
          { field: 'status', operator: '==', value: EVENT_STATUS.APPROVED },
          { field: 'type', operator: '==', value: EVENT_TYPES.INTER }
        ]
      );
      const sortedEvents = (events || []).sort((a, b) => {
        const dateA = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate);
        const dateB = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate);
        return dateA - dateB;
      }).slice(0, 6);
      setUpcomingEvents(sortedEvents);

      const { data: allEvents } = await queryDocuments(COLLECTIONS.EVENTS);
      const { data: colleges } = await queryDocuments(COLLECTIONS.COLLEGES);
      const { data: users } = await queryDocuments(COLLECTIONS.USERS);

      setStats({
        events: allEvents?.length || 0,
        colleges: colleges?.length || 0,
        students: users?.filter(u => u.role === 'student').length || 0
      });
    };

    fetchData();
  }, []);

  const features = [
    { icon: IoSearch, title: 'Discover Events', description: 'Browse and filter events by category, college, and date. Find the perfect events that match your interests.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: IoTicket, title: 'Easy Registration', description: 'One-click registration for any event. No more complicated forms or long queues.', gradient: 'from-pink-500 to-rose-500' },
    { icon: IoSchool, title: 'College Network', description: 'Connect with students across multiple colleges. Expand your network and make new friends.', gradient: 'from-purple-500 to-indigo-500' },
    { icon: IoTrendingUp, title: 'Event Management', description: 'Create and manage events with powerful tools. Track registrations and analytics in real-time.', gradient: 'from-orange-500 to-amber-500' },
    { icon: IoNotifications, title: 'Real-time Updates', description: 'Get notified about events you\'re interested in. Never miss an opportunity again.', gradient: 'from-green-500 to-emerald-500' },
    { icon: IoRibbon, title: 'Track Achievements', description: 'Build your event participation portfolio. Showcase your involvement and achievements.', gradient: 'from-violet-500 to-purple-500' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', college: 'IIT Delhi', text: 'Event Mania made it so easy to discover and register for inter-college events. I\'ve attended 10+ events this semester!', rating: 5, avatar: 'PS' },
    { name: 'Rahul Kumar', college: 'VIT Vellore', text: 'As an event organizer, this platform has been a game-changer. Managing registrations is now a breeze.', rating: 5, avatar: 'RK' },
    { name: 'Ananya Patel', college: 'BITS Pilani', text: 'The best platform to stay updated about events happening across different colleges. Highly recommended!', rating: 5, avatar: 'AP' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-theme transition-colors duration-300">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-400/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-400/40 via-transparent to-transparent"></div>
            </div>
          </div>

          {/* Mesh Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(255 255 255 / 0.08)%27%3e%3cpath d=%27M0 .5H31.5V32%27/%3e%3c/svg%3e')]"></div>

          {/* Floating Blobs */}
          <motion.div
            style={{ y: y1 }}
            className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl"
          />

          {/* Floating Stats Badges */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute top-32 left-10 hidden xl:block z-10"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass-effect px-6 py-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <IoCheckmarkCircle className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme">{stats.events}+</p>
                  <p className="text-sm text-theme-secondary">Events Hosted</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute top-48 right-16 hidden xl:block z-10"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="glass-effect px-6 py-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <IoFlash className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme">Live Now</p>
                  <p className="text-xs text-theme-secondary">3 Active Events</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="absolute bottom-40 left-20 hidden xl:block z-10"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass-effect px-6 py-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <IoStar className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme">4.9</p>
                  <p className="text-sm text-theme-secondary">User Rating</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Content */}
          <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center z-10 pt-24 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-xl border border-white/30"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <IoSparkles size={18} />
                </motion.div>
                <span>The #1 College Event Platform</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight"
              >
                <span className="drop-shadow-2xl">Discover. Connect.</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200"
                >
                  Experience.
                </motion.span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto font-medium"
              >
                Your gateway to amazing college events across India.
                Find workshops, hackathons, cultural fests, and more!
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/events"
                    className="group inline-flex items-center justify-center gap-3 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all"
                  >
                    <IoRocket size={22} />
                    <span>Explore Events</span>
                    <IoArrowForward className="group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                </motion.div>

                {!isAuthenticated && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all shadow-xl"
                    >
                      <IoPersonAdd size={22} />
                      Get Started Free
                    </Link>
                  </motion.div>
                )}
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/70"
              >
                <div className="flex items-center gap-2">
                  <IoCheckmarkCircle size={20} className="text-green-400" />
                  <span className="text-sm font-medium">Free to Join</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoGlobe size={20} className="text-blue-400" />
                  <span className="text-sm font-medium">{stats.colleges}+ Colleges</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoPeople size={20} className="text-pink-400" />
                  <span className="text-sm font-medium">{stats.students}+ Students</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-3 bg-white/80 rounded-full"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-28 section-theme relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>

          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-semibold mb-4">
                POWERFUL FEATURES
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-theme mb-6">
                Everything You Need to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">
                  Discover & Manage Events
                </span>
              </h2>
              <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
                From discovering events to managing your own, we've got you covered with powerful tools and features.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradient={feature.gradient}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-28 section-theme-alt relative overflow-hidden">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 text-purple-500 text-sm font-semibold mb-4">
                HOW IT WORKS
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-theme mb-6">
                Get Started in
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500"> 3 Simple Steps</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Lines */}
              <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30"></div>

              <StepCard
                number={1}
                icon={IoPersonAdd}
                title="Create Account"
                description="Sign up with your college email and create your student profile in seconds."
                delay={0}
              />
              <StepCard
                number={2}
                icon={IoEye}
                title="Discover Events"
                description="Browse events from your college and other institutions. Filter by category and date."
                delay={0.15}
              />
              <StepCard
                number={3}
                icon={IoTicket}
                title="Register & Participate"
                description="One-click registration for events. Get confirmations and reminders instantly."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-28 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(255 255 255 / 0.05)%27%3e%3cpath d=%27M0 .5H31.5V32%27/%3e%3c/svg%3e')]"></div>

          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                Trusted by Students Nationwide
              </h2>
              <p className="text-xl text-white/80">
                Join our growing community of students and colleges
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: IoPeople, value: stats.students, label: 'Active Students', color: 'from-blue-400 to-cyan-400' },
                { icon: IoCalendar, value: stats.events, label: 'Events Hosted', color: 'from-pink-400 to-rose-400' },
                { icon: IoTrophy, value: stats.colleges, label: 'Partner Colleges', color: 'from-yellow-400 to-orange-400' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-10 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
                >
                  <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${stat.color} mb-6 shadow-lg`}>
                    <stat.icon className="text-white" size={36} />
                  </div>
                  <h3 className="text-5xl md:text-6xl font-black text-white mb-2">
                    <AnimatedCounter value={stat.value} />+
                  </h3>
                  <p className="text-white/80 font-semibold text-lg">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-28 section-theme relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-600/10 to-transparent"></div>

          <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-pink-500/10 text-pink-500 text-sm font-semibold mb-4">
                UPCOMING EVENTS
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-theme mb-6">
                Don't Miss Out on
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">
                  Amazing Opportunities
                </span>
              </h2>
              <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
                Check out the latest inter-college events happening across India
              </p>
            </motion.div>

            {upcomingEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mt-16"
                >
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl"
                  >
                    View All Events
                    <IoArrowForward size={20} />
                  </Link>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-theme-surface mb-6">
                  <IoCalendar className="text-theme-secondary" size={48} />
                </div>
                <p className="text-theme-secondary text-xl font-medium">No upcoming events at the moment</p>
                <p className="text-theme-secondary/70 text-base mt-2">Check back soon for new events!</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-28 section-theme-alt relative overflow-hidden">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-semibold mb-4">
                TESTIMONIALS
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-theme mb-6">
                Loved by Students
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                  Across India
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TestimonialCard {...testimonial} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <section className="py-28 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(255 255 255 / 0.05)%27%3e%3cpath d=%27M0 .5H31.5V32%27/%3e%3c/svg%3e')]"></div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm hidden lg:block"
            />
            <motion.div
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm hidden lg:block"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-8"
                >
                  <IoRocket className="text-white" size={40} />
                </motion.div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                  Join thousands of students who are already discovering amazing events and building their network.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-3 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all"
                    >
                      <IoPersonAdd size={22} />
                      Create Free Account
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/events"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all"
                    >
                      Browse Events
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}