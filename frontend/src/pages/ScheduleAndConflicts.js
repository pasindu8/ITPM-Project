import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';
import AddSessionModal from './AddSessionModal.js';
import Swal from 'sweetalert2';

function ScheduleAndConflicts() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sessions, setSessions] = useState([]); // දත්ත ගබඩා කිරීමට
    const [loading, setLoading] = useState(true);

    // --- Backend එකෙන් දත්ත ලබා ගැනීම ---
    const fetchSessions = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/schedule/get-sessions', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            const result = await res.json();
            if (result.success) {
                setSessions(result.data);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // --- Conflict එකක් Resolve කිරීමේ function එක ---
    const handleResolve = async (id, action) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/schedule/resolve-conflict/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify({ action })
            });
            const result = await res.json();
            if (res.ok) {
                Swal.fire("Success", result.message, "success");
                fetchSessions(); // UI එක refresh කරන්න
            }
        } catch (error) {
            Swal.fire("Error", "Failed to resolve conflict", "error");
        }
    };

    return (
        <div 
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <Sidebar/>
            
            {/* Modal එක Close කරද්දී නැවත data fetch කරන්න refresh function එකක් යවනවා */}
            <AddSessionModal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    fetchSessions();
                }} 
            />

            <div className="flex-1 flex flex-col gap-6">
                {/* --- Header Section --- */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span>📅</span> Schedule & Conflicts
                    </h2>
                    <button className="bg-white hover:bg-blue-50 text-blue-900 px-6 py-2.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}>
                        <span className="text-xl">+</span> Add Session
                    </button>
                </div>

                {/* --- Sessions List Section --- */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex-1 overflow-y-auto h-[500px] custom-scrollbar">
                    <h3 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-2">
                        Upcoming Training Sessions
                        <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded text-white/50 tracking-widest uppercase">
                            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                    </h3>
                    
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-white text-center">Loading sessions...</p>
                        ) : sessions.length === 0 ? (
                            <p className="text-white/50 text-center py-10">No sessions scheduled yet.</p>
                        ) : (
                            sessions.map((session) => {
                                const sessionDate = new Date(session.date);
                                const isConflict = session.status === 'Conflict';

                                return (
                                    <div key={session._id} className={`group ${isConflict ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-white/5 border-white/10'} border p-6 rounded-[1.8rem] flex justify-between items-center transition-all hover:bg-white/10 hover:-translate-y-1`}>
                                        <div className="flex items-center gap-6">
                                            <div className={`${isConflict ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'} p-4 rounded-2xl border text-center min-w-[70px]`}>
                                                <p className={`${isConflict ? 'text-red-400' : 'text-green-400'} text-xs font-bold uppercase`}>
                                                    {sessionDate.toLocaleString('default', { month: 'short' })}
                                                </p>
                                                <p className="text-white text-2xl font-black">{sessionDate.getDate()}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-white text-xl font-bold group-hover:text-green-300 transition-colors">{session.sessionName}</h3>
                                                    {isConflict && (
                                                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black uppercase animate-pulse">Conflict</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-white/60 text-sm flex items-center gap-1">🕒 {session.startTime} - {session.endTime}</span>
                                                    <span className="text-white/30 text-sm">|</span>
                                                    <span className="text-white/60 text-sm flex items-center gap-1">📍 {session.location}</span>
                                                </div>
                                                {isConflict && (
                                                    <p className="text-yellow-400 text-sm font-semibold mt-2 flex items-center gap-1">
                                                        ⚠️ {session.conflicts?.length} Students have lectures at this time
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            {isConflict ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleResolve(session._id, 'keep')}
                                                        className="bg-white text-red-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-red-50 transition-colors">
                                                        Manage Conflict
                                                    </button>
                                                    <button className="text-white/40 hover:text-white/90 text-[10px] font-bold uppercase underline transition-colors">
                                                        Reschedule
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="bg-green-500/20 text-green-400 border border-green-500/40 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">
                                                    All Clear
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Calendar Hint */}
                    <div className="mt-8 text-center">
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Synchronized with University Timetable</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScheduleAndConflicts;