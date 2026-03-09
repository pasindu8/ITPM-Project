import React, { useState, useEffect } from 'react';

const LineupOptimizer = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);

    const runAI = async () => {
        setLoading(true);
        const res = await fetch('http://localhost:5000/scout/ai-lineup', {
            headers: { 'Authorization': `${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setPlayers(data.data);
        setLoading(false);
    };

    return (
        <div className="p-8 bg-gray-950 min-h-screen text-white">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight">AI Lineup <span className="text-blue-500">Optimizer</span></h1>
                    <button onClick={runAI} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20">
                        {loading ? 'Analyzing Data...' : '⚡ Generate Best Lineup'}
                    </button>
                </header>

                <div className="grid gap-4">
                    {players.map((p, index) => (
                        <div key={p._id} className="bg-gray-900 border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="text-3xl font-black text-gray-800 group-hover:text-blue-500/20">0{index + 1}</div>
                                <div>
                                    <h3 className="text-xl font-bold">{p.name}</h3>
                                    <p className="text-sm text-gray-500">Fitness: {p.fitness}% | Rating: {p.rating}/10</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs uppercase tracking-widest text-gray-500">Match Readiness</span>
                                <div className="text-2xl font-mono font-bold text-green-400">{p.score}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LineupOptimizer;