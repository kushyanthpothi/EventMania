'use client';

import { useState } from 'react';

export const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    className = '',
    icon = null
}) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value && value.length > 0;
    // For datetime-local, date, time inputs - always float the label since browser shows placeholder
    const isDateTimeType = ['datetime-local', 'date', 'time'].includes(type);
    const isFloating = focused || hasValue || isDateTimeType;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={`block text-sm font-medium mb-2 transition-colors duration-200 ${error ? 'text-red-500' : focused ? 'text-indigo-500' : 'text-theme-secondary'
                        }`}
                >
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused ? 'text-indigo-500' : 'text-theme-secondary'}`}>
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`
                        w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 outline-none
                        ${icon ? 'pl-12' : ''}
                        ${error
                            ? 'border-red-500 focus:border-red-500'
                            : focused
                                ? 'border-indigo-500'
                                : 'border-theme hover:border-indigo-300'}
                        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    style={{
                        backgroundColor: 'rgb(var(--card-bg))',
                        color: 'rgb(var(--text-primary))',
                        colorScheme: 'dark'
                    }}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export const Textarea = ({
    label,
    name,
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    rows = 4,
    className = ''
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={`block text-sm font-medium mb-2 transition-colors duration-200 ${error ? 'text-red-500' : focused ? 'text-indigo-500' : 'text-theme-secondary'
                        }`}
                >
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    rows={rows}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`
                        w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 outline-none resize-none
                        ${error
                            ? 'border-red-500 focus:border-red-500'
                            : focused
                                ? 'border-indigo-500'
                                : 'border-theme hover:border-indigo-300'}
                        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    style={{
                        backgroundColor: 'rgb(var(--card-bg))',
                        color: 'rgb(var(--text-primary))'
                    }}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};



