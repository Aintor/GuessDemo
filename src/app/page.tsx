'use client';

import { useState, useEffect } from 'react';
import { Dice5, Send, CheckCircle, User, Hash, LogIn, Loader2 } from 'lucide-react';

const ADJECTIVES = [
    'Happy', 'Clever', 'Brave', 'Mysterious', 'Lucky', 'Smart', 'Silly', 'Crazy',
    'Calm', 'Eager', 'Elegant', 'Cheeky', 'Serious', 'Gentle', 'Lively', 'Lazy',
    'Fearless', 'Agile', 'Strong', 'Nimble', 'Wise', 'Curious', 'Confident', 'Humble'
];
const ANIMALS = [
    'Panda', 'Fox', 'Tiger', 'Rabbit', 'Lion', 'Cat', 'Dog', 'Koala',
    'Penguin', 'Dolphin', 'Elephant', 'Giraffe', 'Monkey', 'Squirrel', 'Kangaroo', 'Hedgehog',
    'Cheetah', 'Eagle', 'Shark', 'Whale', 'Octopus', 'Turtle', 'Camel', 'Zebra'
];

function generateRandomName() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    return `${adj}${animal}`;
}

export default function Home() {
    const [name, setName] = useState('');
    const [guess, setGuess] = useState('');
    const [step, setStep] = useState<'loading' | 'join' | 'guess' | 'submitted'>('loading');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const storedName = localStorage.getItem('guess_game_name');
            if (storedName) {
                setName(storedName);
                try {
                    const res = await fetch(`/api/player?name=${encodeURIComponent(storedName)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.hasGuessed) {
                            setGuess(data.guessValue.toString());
                            setStep('submitted');
                        } else if (data.hasJoined) {
                            setStep('guess');
                        } else {
                            // Name in local storage but not on server (server reset?)
                            localStorage.removeItem('guess_game_name');
                            setStep('join');
                        }
                    } else {
                        setStep('join');
                    }
                } catch (e) {
                    setStep('join');
                }
            } else {
                setStep('join');
            }
        };
        checkStatus();
    }, []);

    const handleRandomName = () => {
        setName(generateRandomName());
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('guess_game_name', name);
                setStep('guess');
            } else {
                setMessage(data.error || 'Failed to join');
            }
        } catch (err) {
            setMessage('An error occurred, please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const value = parseFloat(guess);
            if (isNaN(value) || value < 0 || value > 100) {
                setMessage('Please enter a number between 0 and 100');
                setLoading(false);
                return;
            }

            const res = await fetch('/api/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, value }),
            });

            const data = await res.json();

            if (res.ok) {
                setStep('submitted');
            } else {
                setMessage(data.error || 'Submission failed, please try again');
            }
        } catch (err) {
            setMessage('An error occurred, please try again');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (step === 'submitted') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-gray-900">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Submitted!</h1>
                    <p className="text-gray-500 mb-8">Please watch the big screen for results.</p>

                    <div className="space-y-4 mb-8 text-left bg-gray-50 p-6 rounded-xl">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                            <span className="text-gray-500 text-sm">Your Name</span>
                            <span className="font-semibold text-lg">{name}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-500 text-sm">Your Number</span>
                            <span className="font-semibold text-lg">{guess}</span>
                        </div>
                    </div>

                    <div className="text-sm text-gray-400">
                        If the admin restarts the game, please refresh this page.
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'join') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 text-gray-900">
                <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 max-w-md w-full">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight">Join Game</h1>
                        <p className="text-gray-500 text-sm">Pick a cool name for yourself</p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Your Name
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name"
                                    required
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleRandomName}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl px-4 py-2 transition-colors flex items-center gap-2"
                                >
                                    <Dice5 className="w-5 h-5" />
                                    <span className="hidden sm:inline">Random</span>
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Join Game
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Step === 'guess'
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 text-gray-900">
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100 max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Make a Guess</h1>
                    <p className="text-gray-500 text-sm">Hello, <span className="font-bold text-black">{name}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Your Number (0-100)
                        </label>
                        <input
                            type="number"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="0-100"
                            min="0"
                            max="100"
                            step="0.01"
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg font-mono appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>

                    {message && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit Guess
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
