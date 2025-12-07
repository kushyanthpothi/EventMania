import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase/admin';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        try {
            await adminAuth.getUserByEmail(email);
            return NextResponse.json({ exists: true });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return NextResponse.json({ exists: false });
            }
            throw error;
        }
    } catch (error) {
        console.error('Check Email Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
