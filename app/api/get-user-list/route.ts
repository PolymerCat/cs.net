import { NextResponse } from 'next/server';
import pb from '@/functions/client';

export async function GET() {
    try {
        const records = await pb.collection('profile').getFullList({
            sort: 'full_name',
            requestKey: null,
        });

        return NextResponse.json(records);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return NextResponse.json({ error: 'Unable to fetch profiles.' }, { status: 500 });
    }
}
