export interface Guess {
    name: string;
    value: number;
    timestamp: number;
}

export type GameStatusType = 'waiting' | 'playing';

export interface GameStatus {
    target: number;
    closestPlayer: string | null;
    average: number;
    totalGuesses: number;
    guesses: Guess[];
    status: GameStatusType;
    playerCount: number;
}

class GameState {
    private players: Map<string, { guess?: number; timestamp: number }> = new Map();
    private status: GameStatusType = 'waiting';

    registerPlayer(name: string): boolean {
        if (this.players.has(name)) {
            return false;
        }
        this.players.set(name, { timestamp: Date.now() });
        return true;
    }

    isPlayerRegistered(name: string): boolean {
        return this.players.has(name);
    }

    getPlayerStatus(name: string) {
        const player = this.players.get(name);
        if (!player) return null;
        return {
            hasJoined: true,
            hasGuessed: player.guess !== undefined,
            guessValue: player.guess,
        };
    }

    submitGuess(name: string, value: number): boolean {
        if (this.status !== 'playing') return false;
        const player = this.players.get(name);
        if (!player) return false; // Must join first

        this.players.set(name, { ...player, guess: value, timestamp: Date.now() });
        return true;
    }

    setGameStatus(status: GameStatusType) {
        this.status = status;
    }

    reset() {
        this.players.clear();
        this.status = 'waiting';
    }

    getStats(): GameStatus {
        const guesses: Guess[] = [];
        let total = 0;

        this.players.forEach((data, name) => {
            if (data.guess !== undefined) {
                guesses.push({ name, value: data.guess, timestamp: data.timestamp });
                total += data.guess;
            }
        });

        const count = guesses.length;
        const average = count > 0 ? total / count : 0;
        const target = average / 2;

        let closestPlayer: string | null = null;
        let minDiff = Number.MAX_VALUE;

        for (const guess of guesses) {
            const diff = Math.abs(guess.value - target);
            if (diff < minDiff) {
                minDiff = diff;
                closestPlayer = guess.name;
            }
        }

        return {
            target,
            closestPlayer,
            average,
            totalGuesses: count,
            guesses,
            status: this.status,
            playerCount: this.players.size,
        };
    }
}

// Singleton instance with global persistence for development
const globalForGame = globalThis as unknown as { gameState: GameState };

export const gameState = globalForGame.gameState || new GameState();

if (process.env.NODE_ENV !== 'production') {
    globalForGame.gameState = gameState;
}
