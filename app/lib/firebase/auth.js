import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    applyActionCode,
    verifyPasswordResetCode,
    confirmPasswordReset,
    updateProfile
} from 'firebase/auth';
import { app } from './config';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/configuration-not-found') {
            errorMessage = 'Google Sign-In is not configured. Please enable Google authentication in Firebase Console.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign-in cancelled. Please try again.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up blocked. Please allow pop-ups for this site.';
        }

        return { user: null, error: errorMessage };
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Email/Password Authentication Functions

export const signUpWithEmail = async (email, password, fullName = null) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        if (fullName) {
            await updateProfile(result.user, {
                displayName: fullName
            });
        }

        // Send verification email immediately after signup
        await sendEmailVerification(result.user);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Email Sign-Up Error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        }

        return { user: null, error: errorMessage };
    }
};

export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (!result.user.emailVerified) {
            // Sign out the user if email is not verified
            await signOut(auth);
            return {
                user: null,
                error: 'Please verify your email before signing in. Check your inbox for the verification link.',
                needsVerification: true
            };
        }

        return { user: result.user, error: null };
    } catch (error) {
        console.error('Email Sign-In Error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email. Please sign up first.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password. Please try again.';
        }

        return { user: null, error: errorMessage };
    }
};

export const sendVerificationEmail = async (user) => {
    try {
        await sendEmailVerification(user);
        return { error: null };
    } catch (error) {
        console.error('Send Verification Email Error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many requests. Please try again later.';
        }

        return { error: errorMessage };
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (error) {
        console.error('Password Reset Error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }

        return { error: errorMessage };
    }
};

export const verifyEmail = async (actionCode) => {
    try {
        await applyActionCode(auth, actionCode);
        return { error: null };
    } catch (error) {
        console.error('Email Verification Error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/invalid-action-code') {
            errorMessage = 'Invalid or expired verification link.';
        }

        return { error: errorMessage };
    }
};

export const handlePasswordReset = async (actionCode, newPassword) => {
    try {
        await verifyPasswordResetCode(auth, actionCode);
        await confirmPasswordReset(auth, actionCode, newPassword);
        return { error: null };
    } catch (error) {
        console.error('Password Reset Confirmation Error:', error);
        let errorMessage = error.message;

        if (error.code === 'auth/invalid-action-code') {
            errorMessage = 'Invalid or expired password reset link.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        }

        return { error: errorMessage };
    }
};

export { auth };
