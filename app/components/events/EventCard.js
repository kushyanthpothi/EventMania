'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoCalendar, IoLocation } from 'react-icons/io5';
import { formatDate, isEventOngoing } from '../../lib/utils/helpers';

export const EventCard = ({ event, preview = false }) => {
    const isLive = isEventOngoing(event.startDate, event.endDate);
    const hasLiveLink = event.liveLink && event.liveLink.trim() !== '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group h-full"
        >
            <div
                className="h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col backdrop-blur-md bg-white/5 dark:bg-black/5"
                style={{
                    borderColor: 'rgb(var(--card-border))',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                }}
            >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                    {event.posterUrl ? (
                        <img
                            src={event.posterUrl}
                            alt={event.name || event.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-theme-surface flex items-center justify-center">
                            <span className="text-theme-secondary text-sm">No Image</span>
                        </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {isLive ? (
                            <div className="relative">
                                {/* Glowing background effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur-sm opacity-60 animate-pulse"></div>

                                {/* Main badge */}
                                <span className="relative px-3 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-xl flex items-center gap-1.5 overflow-hidden bg-gradient-to-r from-red-500 to-pink-500">
                                    {/* Animated shine effect */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>

                                    {/* Pulsing dot */}
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                    </span>

                                    <span className="relative font-extrabold tracking-wider">LIVE</span>
                                </span>
                            </div>
                        ) : (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm ${event.type === 'inter'
                                ? 'bg-indigo-500/90 text-white'
                                : 'bg-purple-500/90 text-white'
                                }`}>
                                {event.type === 'inter' ? 'Global Event' : 'College Event'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-theme-surface text-theme-secondary border border-theme">
                            {event.category}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-theme mb-2 line-clamp-2 leading-tight group-hover:text-indigo-500 transition-colors">
                        {event.name || event.title}
                    </h3>

                    <p className="text-theme-secondary text-sm mb-4 line-clamp-2 flex-grow">
                        {event.description}
                    </p>

                    <div className="space-y-2 text-xs text-theme-secondary pt-4 border-t border-theme mt-auto">
                        <div className="flex items-center gap-2">
                            <IoCalendar className="text-indigo-500" size={14} />
                            <span className="font-medium">{formatDate(event.startDate?.toDate?.() || event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <IoLocation className="text-pink-500" size={14} />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    </div>


                    {!preview && (
                        <>
                            {isLive && hasLiveLink ? (
                                <div className="mt-4 flex gap-2">
                                    <a
                                        href={event.liveLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                        </span>
                                        Join Live
                                    </a>
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex-1 text-center bg-theme-surface hover:bg-indigo-600 text-theme hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href={`/events/${event.id}`}
                                    className="mt-4 block w-full text-center bg-theme-surface hover:bg-indigo-600 text-theme hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                                >
                                    View Details
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
