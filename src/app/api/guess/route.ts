import { NextResponse } from 'next/server';
import { gameState } from '@/lib/gameState';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, value } = body;

        if (!name || typeof value !== 'number') {
            return NextResponse.json(
                { error: 'Invalid input. Name and numeric value are required.' },
                { status: 400 }
            );
        }

        if (value < 0 || value > 100) {
            return NextResponse.json(
                { error: 'Value must be between 0 and 100.' },
                { status: 400 }
            );
        }

        const success = gameState.submitGuess(name, value);

        if (!success) {
            return NextResponse.json(
                { error: 'Submission failed: Game not started or you have not joined' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
