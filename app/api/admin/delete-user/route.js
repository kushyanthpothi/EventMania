
import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase/admin';

export async function POST(request) {
    try {
        const { uid } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Delete the user from Firebase Authentication
        await adminAuth.deleteUser(uid);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
