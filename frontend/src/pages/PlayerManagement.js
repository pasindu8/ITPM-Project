
import React, { useEffect, useMemo, useState } from 'react';
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';

const getInitials = (name) => {
    if (!name) {
        return 'NA';
    }

    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
};

const renderStars = (score) => {
    const filled = Math.max(0, Math.min(5, Math.round((Number(score) || 0) / 2)));
    const empty = 5 - filled;

    return `${'★'.repeat(filled)}${'☆'.repeat(empty)}`;
};

function PlayerDetailModal({ player, onClose }) {
    if (!player) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-gray-900/95 border border-white/20 rounded-3xl p-6 shadow-2xl text-white">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold">Player Details</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">✕</button>
                </div>

                <div className="space-y-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Name</p>
                        <p className="text-lg font-semibold">{player.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Registration No</p>
                            <p className="font-medium">{player.registrationNumber || '—'}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Health Status</p>
                            <p className="font-medium">{player.healthStatus || '—'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Role</p>
                            <p className="font-medium">{player.role || '—'}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Team</p>
                            <p className="font-medium">{player.team || '—'}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Performance</p>
                        <p className="text-yellow-400 font-bold">{renderStars(player.averageScore)}</p>
                        <p className="text-sm text-white/70 mt-1">{player.averageScore}/10 • {player.gradesCount} grades</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold transition-all"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

function PlayerManagement() {
    const [players, setPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchPlayers = async () => {
            try {
                setIsLoading(true);
                setError('');

                const token = localStorage.getItem('token');
                const url = 'http://localhost:5000/performance/players';

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `${token}`
                    },
                    signal: controller.signal
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to load player data');
                }

                setPlayers(result.data || []);
            } catch (fetchError) {
                if (fetchError.name === 'AbortError') {
                    return;
                }

                setPlayers([]);
                setError(fetchError.message || 'Unable to load players');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlayers();

        return () => {
            controller.abort();
        };
    }, []);

    const filteredPlayers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) {
            return players;
        }

        return players.filter((player) => {
            const haystack = `${player.name} ${player.registrationNumber} ${player.role} ${player.team}`.toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [players, searchTerm]);

    return (
        <div
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <Sidebar/>
            <div className="flex-1 flex flex-col gap-6">

                {/* --- Header Section --- */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>🏃‍♂️</span> Player Management
                    </h2>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search players..."
                            className="bg-white/20 border border-white/30 rounded-full py-2 px-5 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-400 w-64 transition-all"
                        />
                    </div>
                </div>

                {/* --- Player Table Section --- */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-white/5 border-bottom border-white/10">
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Player Name</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Role / Position</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Performance Rating</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Health Status</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                        {isLoading && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-white/80">Loading players...</td>
                            </tr>
                        )}

                        {!isLoading && error && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-red-300">{error}</td>
                            </tr>
                        )}

                        {!isLoading && !error && filteredPlayers.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-white/70">No players found for selected filters.</td>
                            </tr>
                        )}

                        {!isLoading && !error && filteredPlayers.map((player) => (
                            <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-5 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
                                            {getInitials(player.name)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{player.name}</span>
                                            <span className="text-xs text-white/60">{player.registrationNumber}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-white/80">{player.role} • {player.team}</td>
                                <td className="p-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex text-yellow-400 text-sm">{renderStars(player.averageScore)}</div>
                                        <span className="text-xs text-white/60">({player.averageScore}/10) • {player.gradesCount} grades</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 ${
                                        player.healthStatus === 'Fit'
                                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                            : 'bg-red-500/20 border border-red-500/50 text-red-300'
                                    }`}>
                                        {player.healthStatus === 'Fit' ? '✔' : '⚠'} {player.healthStatus}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    <button
                                        onClick={() => setSelectedPlayer(player)}
                                        className="px-4 py-2 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-all transform active:scale-95 shadow-md"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}

                        </tbody>
                    </table>
                    </div>
                </div>
                </div>

                {selectedPlayer && (
                    <PlayerDetailModal
                        player={selectedPlayer}
                        onClose={() => setSelectedPlayer(null)}
                    />
                )}

        </div>
    );
}

export default PlayerManagement;