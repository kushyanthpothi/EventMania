'use client';

export const Toggle = ({
    label,
    description,
    checked = false,
    onChange,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-between bg-theme-surface p-4 rounded-lg ${className}`}>
            <div>
                <label className="font-medium text-theme select-none cursor-pointer">
                    {label}
                </label>
                {description && (
                    <p className="text-sm text-theme-secondary mt-1">{description}</p>
                )}
            </div>
            <button
                type="button"
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-600'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
};
