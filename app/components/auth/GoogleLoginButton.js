'use client';

import { FcGoogle } from 'react-icons/fc';
import { Button } from '../common/Button';
import { signInWithGoogle } from '../../lib/firebase/auth';
import { showToast } from '../common/Toast';
import { useState } from 'react';

export const GoogleLoginButton = ({ onSuccess, text = 'Continue with Google', iconOnly = false }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const { user, error } = await signInWithGoogle();
        setLoading(false);

        if (error) {
            showToast.error(`Sign in failed: ${error}`);
        } else if (user) {
            showToast.success('Signed in successfully!');
            if (onSuccess) onSuccess(user);
        }
    };

    if (iconOnly) {
        return (
            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center w-12 h-12 rounded-xl border-2 border-slate-600 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign in with Google"
            >
                {!loading && <FcGoogle size={24} />}
                {loading && (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                )}
            </button>
        );
    }

    return (
        <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            size="lg"
            loading={loading}
            icon={!loading && <FcGoogle size={24} />}
            className="w-full"
        >
            {text}
        </Button>
    );
};
