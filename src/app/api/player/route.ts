import { NextResponse } from 'next/server';
import { gameState } from '@/lib/gameState';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const status = gameState.getPlayerStatus(name);

    if (!status) {
        return NextResponse.json({ hasJoined: false });
    }

    return NextResponse.json(status);
}
