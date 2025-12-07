'use client';

import { FcGoogle } from 'react-icons/fc';
import { Button } from '../common/Button';
import { signInWithGoogle } from '../../lib/firebase/auth';
import { showToast } from '../common/Toast';
import { useState } from 'react';

export const GoogleLoginButton = ({ onSuccess, text = 'Continue with Google' }) => {
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
