'use client';

export const Loader = ({ size = 'md', color = 'indigo' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    const colors = {
        indigo: 'border-indigo-500 border-t-transparent',
        pink: 'border-pink-500 border-t-transparent',
        white: 'border-white border-t-transparent'
    };

    return (
        <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} />
    );
};

export const PageLoader = () => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgb(var(--background))' }}
        >
            <div
                className="text-center p-8 rounded-2xl shadow-xl"
                style={{
                    backgroundColor: 'rgb(var(--card-bg))',
                    borderColor: 'rgb(var(--card-border))',
                    borderWidth: '1px'
                }}
            >
                <Loader size="lg" />
                <p className="mt-4 text-theme-secondary">Loading...</p>
            </div>
        </div>
    );
};

export const SkeletonCard = () => {
    return (
        <div
            className="rounded-lg shadow-md overflow-hidden animate-pulse"
            style={{
                backgroundColor: 'rgb(var(--card-bg))',
                borderColor: 'rgb(var(--card-border))',
                borderWidth: '1px'
            }}
        >
            <div className="h-48" style={{ backgroundColor: 'rgb(var(--surface))' }} />
            <div className="p-4 space-y-3">
                <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'rgb(var(--surface))' }} />
                <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'rgb(var(--surface))' }} />
                <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'rgb(var(--surface))' }} />
            </div>
        </div>
    );
};

export const SkeletonList = ({ count = 3 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
};

