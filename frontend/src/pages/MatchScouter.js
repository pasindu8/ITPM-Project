import React, { useState } from 'react';

const MatchScouter = () => {
    const [currentSession, setCurrentSession] = useState(null);
    const [logs, setLogs] = useState([]);

    const startMatch = async () => {
        const opponent = prompt("Enter Opponent Name:");
        const res = await fetch('http://localhost:5000/scout/start-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${localStorage.getItem('token')}` },
            body: JSON.stringify({ opponent, venue: "Home Ground" })
        });
        const data = await res.json();
        setCurrentSession(data.data);
    };

    const addEvent = async (type) => {
        if (!currentSession) return alert("Start a match first!");
        const newEvent = {
            sessionId: currentSession._id,
            playerName: "Selected Player", // ප්ලේයර් ලිස්ට් එකකින් තෝරන්න හදන්න පුළුවන්
            eventType: type,
            matchTime: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })
        };

        await fetch('http://localhost:5000/scout/log-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `${localStorage.getItem('token')}` },
            body: JSON.stringify(newEvent)
        });
        setLogs([newEvent, ...logs]);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center justify-center">
                {!currentSession ? (
                    <button onClick={startMatch} className="bg-green-600 px-10 py-5 rounded-full text-2xl font-black animate-pulse">START LIVE SCOUTING</button>
                ) : (
                    <div className="w-full max-w-lg space-y-6">
                        <h2 className="text-center text-xl font-bold text-gray-400">Vs {currentSession.opponent}</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <button onClick={() => addEvent('Goal')} className="h-32 bg-green-500 rounded-[2rem] text-2xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-all">⚽ GOAL</button>
                            <button onClick={() => addEvent('Foul')} className="h-32 bg-red-600 rounded-[2rem] text-2xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all">⚠️ FOUL</button>
                            <button onClick={() => addEvent('Yellow Card')} className="h-32 bg-yellow-400 text-black rounded-[2rem] text-2xl font-bold shadow-lg shadow-yellow-400/20 active:scale-95 transition-all">🟨 YELLOW</button>
                            <button onClick={() => addEvent('Assist')} className="h-32 bg-blue-500 rounded-[2rem] text-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">👟 ASSIST</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full md:w-80 bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Live Timeline</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <span className="text-blue-500 font-mono text-sm">{log.matchTime}</span>
                            <p className="text-sm"><b>{log.eventType}</b> recorded</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchScouter;