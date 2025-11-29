import { NextResponse } from 'next/server';
import { gameState } from '@/lib/gameState';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'start') {
            gameState.setGameStatus('playing');
        } else if (action === 'reset') {
            gameState.reset();
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
