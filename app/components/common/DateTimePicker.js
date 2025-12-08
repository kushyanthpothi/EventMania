'use client';

import { useState, useEffect, useRef } from 'react';
import { IoCalendar, IoTime, IoWarning } from 'react-icons/io5';

export const DateTimePicker = ({
    label,
    value,
    onChange,
    required = false,
    minDateTime = null,
    error = null,
    allowPastDates = false // Allow past dates when editing existing events
}) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timeError, setTimeError] = useState('');
    const isInitialMount = useRef(true);
    const lastValue = useRef(value);
    const hasInitialized = useRef(false);

    // Parse initial value - runs on mount and when value changes
    useEffect(() => {
        // On initial mount, always set the value if it exists
        if (!hasInitialized.current && value) {
            hasInitialized.current = true;
            const [dateStr, timeStr] = value.split('T');
            if (dateStr && timeStr) {
                setDate(dateStr);
                setTime(timeStr.slice(0, 5)); // Remove seconds if present
                lastValue.current = value;
            }
        }
        // After initialization, only update if value actually changed
        else if (hasInitialized.current && value && value !== lastValue.current) {
            lastValue.current = value;
            const [dateStr, timeStr] = value.split('T');
            if (dateStr && timeStr) {
                setDate(dateStr);
                setTime(timeStr.slice(0, 5));
            }
        }
    }, [value]);

    // Update parent when date or time changes (but not on initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (date && time) {
            const combined = `${date}T${time}`;
            // Only call onChange if the value actually changed
            if (combined !== lastValue.current) {
                lastValue.current = combined;
                onChange(combined);
            }
        }
    }, [date, time, onChange]);

    // Get minimum date (based on minDateTime, current date, or allow all)
    const getMinDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;

        // If minDateTime is provided (editing mode)
        if (minDateTime) {
            const [minDateStr] = minDateTime.split('T');
            // Use the later of: original event date OR today
            // This prevents selecting today if event was scheduled for future
            return minDateStr > todayDate ? minDateStr : todayDate;
        }

        // If past dates are allowed and no minDateTime, no restriction
        if (allowPastDates) return null;

        // Otherwise, use today as minimum (create mode)
        return todayDate;
    };

    // Get current time in HH:MM format
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Get minimum time for selected date
    const getMinTime = () => {
        if (!date) return '00:00';

        const minDate = getMinDate();
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;

        // If minDateTime is provided
        if (minDateTime) {
            const [minDateStr, minTimeStr] = minDateTime.split('T');

            // If selected date is today, use current time as minimum
            if (date === todayDate) {
                return getCurrentTime();
            }

            // If selected date equals original event date, use original time
            if (date === minDateStr && minTimeStr) {
                return minTimeStr.slice(0, 5);
            }

            return '00:00'; // Future dates can use any time
        }

        // If past dates allowed and no minDateTime, no restriction
        if (allowPastDates) return '00:00';

        // If selected date is today, return current time
        if (date === minDate) {
            return getCurrentTime();
        }

        return '00:00';
    };

    // Check if a time is in the past for the selected date
    const isTimePast = (timeStr) => {
        if (!date || !timeStr) return false;

        const minDate = getMinDate();
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;

        // If minDateTime is provided
        if (minDateTime) {
            const [minDateStr, minTimeStr] = minDateTime.split('T');

            // If selected date is today, check against current time
            if (date === todayDate) {
                const currentTime = getCurrentTime();
                return timeStr < currentTime;
            }

            // If selected date equals original event date, check against original time
            if (date === minDateStr && minTimeStr) {
                return timeStr < minTimeStr.slice(0, 5);
            }

            return false; // Future dates are fine
        }

        // If past dates allowed and no minDateTime, no restriction
        if (allowPastDates) return false;

        // Check against current time if today
        if (date !== minDate) return false;

        const currentTime = getCurrentTime();
        return timeStr < currentTime;
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        setTimeError('');

        // If selecting today and past dates not allowed, ensure time is not in the past
        if (!allowPastDates && time && isTimePast(time)) {
            const currentTime = getCurrentTime();
            setTime(currentTime);
            setTimeError('Auto-corrected to current time');
            setTimeout(() => setTimeError(''), 3000);
        }
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;

        // Check if the new time is in the past (only if past dates not allowed)
        if (!allowPastDates && isTimePast(newTime)) {
            const currentTime = getCurrentTime();
            setTime(currentTime);
            setTimeError('Past time not allowed');
            setTimeout(() => setTimeError(''), 3000);
            return;
        }

        setTimeError('');
        setTime(newTime);
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold text-theme mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="grid grid-cols-2 gap-3">
                {/* Date Input */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                        <IoCalendar size={18} />
                    </div>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        min={getMinDate()}
                        required={required}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-theme bg-theme-surface text-theme
                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                                 transition-all duration-200 outline-none
                                 hover:border-indigo-400
                                 [color-scheme:light] dark:[color-scheme:dark]
                                 cursor-pointer"
                        style={{
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    />
                </div>

                {/* Time Input */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 pointer-events-none z-10">
                        <IoTime size={18} />
                    </div>
                    <input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        min={getMinTime()}
                        required={required}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-theme-surface text-theme
                                 focus:ring-2 transition-all duration-200 outline-none
                                 [color-scheme:light] dark:[color-scheme:dark]
                                 cursor-pointer
                                 ${timeError
                                ? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-400'
                                : 'border-theme focus:border-pink-500 focus:ring-pink-500/20 hover:border-pink-400'
                            }`}
                        style={{
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    />

                    {/* Time Error Message - Directly below time input */}
                    {timeError && (
                        <div className="absolute top-full left-0 right-0 mt-1 flex items-center gap-1 text-orange-500 text-[10px] font-medium">
                            <IoWarning size={10} />
                            <span>{timeError}</span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="text-sm">⚠</span> {error}
                </p>
            )}

            <p className="text-xs text-theme-secondary mt-2 flex items-center gap-1">
                <IoCalendar size={12} className="text-indigo-400" />
                <span>Past dates and times are automatically blocked</span>
            </p>
        </div>
    );
};
