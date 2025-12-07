'use client';

import { useState, useRef, useEffect } from 'react';
import { IoChevronDown, IoCheckmark } from 'react-icons/io5';

export const Dropdown = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    error = '',
    required = false,
    disabled = false,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {label && (
                <label
                    className={`block text-sm font-medium mb-2 transition-colors duration-200 ${error ? 'text-red-500' : isOpen ? 'text-indigo-500' : 'text-theme-secondary'
                        }`}
                >
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full px-4 py-3 border-2 rounded-lg text-left flex items-center justify-between transition-all duration-200 outline-none
                    ${error
                        ? 'border-red-500'
                        : isOpen
                            ? 'border-indigo-500'
                            : 'border-theme hover:border-indigo-300'}
                    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{
                    backgroundColor: 'rgb(var(--card-bg))'
                }}
            >
                <span
                    style={{ color: selectedOption ? 'rgb(var(--text-primary))' : 'rgb(var(--text-secondary))' }}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <IoChevronDown
                    className={`transition-transform duration-200 text-theme-secondary ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-1 border-2 border-indigo-500 rounded-lg shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: 'rgb(var(--card-bg))'
                    }}
                >
                    {/* Search Input */}
                    <div className="p-2 border-b" style={{ borderColor: 'rgb(var(--card-border))' }}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 rounded-md outline-none text-sm transition-colors"
                            style={{
                                backgroundColor: 'rgb(var(--surface))',
                                color: 'rgb(var(--text-primary))'
                            }}
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`
                                        w-full px-4 py-3 text-left flex items-center justify-between transition-colors
                                        ${value === option.value
                                            ? 'bg-indigo-500/20'
                                            : 'hover:bg-indigo-500/10'}
                                    `}
                                    style={{
                                        color: value === option.value ? '#818cf8' : 'rgb(var(--text-primary))'
                                    }}
                                >
                                    <span className={value === option.value ? 'font-medium' : ''}>
                                        {option.label}
                                    </span>
                                    {value === option.value && (
                                        <IoCheckmark className="text-indigo-500" size={20} />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-theme-secondary text-center text-sm">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}

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
