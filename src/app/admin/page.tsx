'use client';

import { useEffect, useState } from 'react';
import { Users, Activity, Target, Trophy, Clock, Play, RotateCcw, AlertTriangle } from 'lucide-react';

interface GameStatus {
    target: number;
    closestPlayer: string | null;
    average: number;
    totalGuesses: number;
    guesses: { name: string; value: number; timestamp: number }[];
    status: 'waiting' | 'playing';
    playerCount: number;
}

export default function AdminPage() {
    const [status, setStatus] = useState<GameStatus | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/status');
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (error) {
                console.error('Failed to fetch status', error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (action: 'start' | 'reset') => {
        if (action === 'reset' && !confirm('Are you sure you want to restart? All data will be cleared.')) {
            return;
        }

        setLoadingAction(true);
        try {
            await fetch('/api/admin/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            // Immediate refresh
            const res = await fetch('/api/status');
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (error) {
            alert('Action failed');
        } finally {
            setLoadingAction(false);
        }
    };

    if (!status) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
                <div className="flex items-center gap-2 text-gray-500">
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            Game Dashboard
                            {status.status === 'waiting' ? (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-medium">Waiting to Start</span>
                            ) : (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Live
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 mt-1">Real-time player data and results</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {status.status === 'waiting' && (
                            <button
                                onClick={() => handleAction('start')}
                                disabled={loadingAction}
                                className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-black/5"
                            >
                                <Play className="w-4 h-4" />
                                Start Game
                            </button>
                        )}

                        <button
                            onClick={() => handleAction('reset')}
                            disabled={loadingAction}
                            className="bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset Game
                        </button>
                    </div>
                </header>

                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 min-w-[140px]">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-medium uppercase">Joined</div>
                            <div className="font-bold text-xl text-gray-900">{status.playerCount}</div>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 min-w-[140px]">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-medium uppercase">Submitted</div>
                            <div className="font-bold text-xl text-gray-900">{status.totalGuesses}</div>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 min-w-[140px]">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Target className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-medium uppercase">Average</div>
                            <div className="font-bold text-xl text-gray-900">{status.average.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Target Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-64">
                        <div className="absolute top-4 left-4 p-2 bg-blue-50 rounded-lg">
                            <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider mt-2">Target (Avg / 2)</h2>
                        <div className="text-7xl sm:text-8xl font-bold text-gray-900 tabular-nums tracking-tight">
                            {status.target.toFixed(2)}
                        </div>
                    </div>

                    {/* Winner Card */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-64">
                        <div className="absolute top-4 left-4 p-2 bg-yellow-50 rounded-lg">
                            <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h2 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider mt-2">Current Leader</h2>
                        <div className="text-5xl sm:text-6xl font-bold text-gray-900 text-center break-all tracking-tight">
                            {status.closestPlayer || '---'}
                        </div>
                        {status.closestPlayer && (
                            <div className="mt-6 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                                Winning for now
                            </div>
                        )}
                    </div>
                </div>

                {/* Leaderboard / List */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900">Live Guesses</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {status.guesses.sort((a, b) => b.timestamp - a.timestamp).map((guess, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                                        {guess.name[0]}
                                    </div>
                                    <span className="font-medium text-gray-700 truncate max-w-[100px]">{guess.name}</span>
                                </div>
                                <span className="font-mono text-lg font-bold text-blue-600">{guess.value}</span>
                            </div>
                        ))}
                        {status.guesses.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                No data yet, waiting for players...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
