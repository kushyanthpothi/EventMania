'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoCalendar, IoLocation } from 'react-icons/io5';
import { formatDate } from '../../lib/utils/helpers';

export const EventCard = ({ event }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group h-full"
        >
            <div
                className="h-full card-theme rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                style={{
                    backgroundColor: 'rgb(var(--card-bg))',
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
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm ${event.type === 'inter'
                            ? 'bg-indigo-500/90 text-white'
                            : 'bg-purple-500/90 text-white'
                            }`}>
                            {event.type === 'inter' ? 'Global Event' : 'College Event'}
                        </span>
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

                    <Link
                        href={`/events/${event.id}`}
                        className="mt-4 block w-full text-center bg-theme-surface hover:bg-indigo-600 text-theme hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

