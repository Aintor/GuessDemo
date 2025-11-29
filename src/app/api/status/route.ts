import { NextResponse } from 'next/server';
import { gameState } from '@/lib/gameState';

export async function GET() {
    const stats = gameState.getStats();
    // Prevent caching
    return NextResponse.json(stats, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
