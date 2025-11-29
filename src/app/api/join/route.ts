import { NextResponse } from 'next/server';
import { gameState } from '@/lib/gameState';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const success = gameState.registerPlayer(name);

        if (!success) {
            return NextResponse.json({ error: 'Name already taken, please choose another one' }, { status: 409 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
