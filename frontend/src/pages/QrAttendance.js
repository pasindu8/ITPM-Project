import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import bgImage from '../assets/6903344.jpg'; // ඔයාගේ Background Image එකේ Path එක
import Sidebar from '../components/Sidebar.js'; // ඔයාගේ Sidebar Component එකේ Path එක

function QrAttendance() {
    const { sessionId } = useParams(); 
    const navigate = useNavigate(); 
    
    const [qrData, setQrData] = useState("");
    const [attendanceList, setAttendanceList] = useState([]);
    const [timeLeft, setTimeLeft] = useState(5); 
    const [todaySessions, setTodaySessions] = useState([]); 

    // --- 1. Fetch Today's Sessions (URL එකේ ID එකක් නැතිව ආවොත්) ---
    useEffect(() => {
        if (!sessionId) {
            const fetchTodaySessions = async () => {
                try {
                    const token = localStorage.getItem('token');
                    
                    // සටහන: ඔයාගේ Schedule/Sessions ගන්න API Route එක මෙතනට දෙන්න
                    const response = await fetch(`http://localhost:5000/schedule/get-sessions`, { 
                        headers: { 'Authorization': `${token}` }
                    });
                    const result = await response.json();
                    
                    const sessions = result.data || result; 

                    if (Array.isArray(sessions)) {
                        // අද දිනය ලබා ගැනීම (YYYY-MM-DD ආකෘතියෙන්)
                        const today = new Date().toISOString().split('T')[0];
                        
                        // අද දවසට අදාළ Sessions පමණක් වෙන් කරගැනීම
                        const filteredSessions = sessions.filter(session => {
                            if (!session.date) return false;
                            const sessionDate = new Date(session.date).toISOString().split('T')[0];
                            return sessionDate === today; 
                        });
                        
                        setTodaySessions(filteredSessions);
                    }
                } catch (error) {
                    console.error("Error fetching today's sessions:", error);
                }
            };
            
            fetchTodaySessions();
        }
    }, [sessionId]);

    // --- 2. Generate QR Data ---
    const fetchQRData = async () => {
        if (!sessionId || sessionId === 'undefined') return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/attendance/generate-qr/${sessionId}`, {
                headers: { 'Authorization': `${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setQrData(encodeURIComponent(result.data));
            }
        } catch (error) {
            console.error("Error generating QR:", error);
        }
    };

    // --- 3. Get Live Feed ---
    const fetchLiveFeed = async () => {
        if (!sessionId || sessionId === 'undefined') return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/attendance/live-feed/${sessionId}`, {
                headers: { 'Authorization': `${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setAttendanceList(result.data);
            }
        } catch (error) {
            console.error("Error fetching live feed:", error);
        }
    };

    // --- 4. Timer & Data Fetching Logic (QR & Live Feed සඳහා) ---
    useEffect(() => {
        if (!sessionId) return; // ID එකක් නැත්නම් Timer එක දුවන්න අවශ්‍ය නෑ

        fetchQRData();
        fetchLiveFeed();

        const intervalId = setInterval(() => {
            fetchQRData();
            fetchLiveFeed();
            setTimeLeft(5); 
        }, 5000);

        const countdownId = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(intervalId);
            clearInterval(countdownId);
        };
    }, [sessionId]);

    // =========================================================================
    // UI කොටස 1: URL එකේ ID එකක් නැති විට (අද තියෙන Sessions පෙන්වන පිටුව)
    // =========================================================================
    if (!sessionId) {
        return (
            <div 
                className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <Sidebar/>
                <div className="flex-1 flex flex-col items-center bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-8 overflow-y-auto">
                    <h2 className="text-3xl font-extrabold text-white mb-2 mt-4 text-center">Today's Training Sessions</h2>
                    <p className="text-white/70 mb-10 text-center">Select a session to start marking attendance</p>

                    {todaySessions.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center text-center max-w-md w-full mt-10">
                            <span className="text-5xl mb-4">🏏</span>
                            <h3 className="text-2xl text-white font-bold mb-2">No Sessions Today</h3>
                            <p className="text-white/50 text-sm">There are no training sessions scheduled for today. Please check the Schedule & Conflicts page.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-6xl">
                            {todaySessions.map(session => (
                                <div key={session._id} className="bg-white/10 border border-white/20 p-6 rounded-3xl shadow-xl hover:bg-white/20 transition-all duration-300 group flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full -translate-y-10 translate-x-10"></div>
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                            {session.sessionName || 'Training Session'}
                                        </h3>
                                        <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-wider">
                                            {session.team || 'Sport'}
                                        </span>
                                    </div>
                                    
                                    <div className="text-white/70 space-y-3 mb-8 text-sm flex-1 relative z-10 font-medium">
                                        <p className="flex items-center gap-3">
                                            <span className="bg-white/10 p-1.5 rounded-lg">📍</span> 
                                            {session.location || 'N/A'}
                                        </p>
                                        <p className="flex items-center gap-3">
                                            <span className="bg-white/10 p-1.5 rounded-lg">⏱</span> 
                                            {session.startTime} - {session.endTime}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => navigate(`/QrAttendance/${session._id}`)}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all transform active:scale-95 relative z-10"
                                    >
                                        Start Attendance
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =========================================================================
    // UI කොටස 2: URL එකේ ID එකක් ඇති විට (QR Code එක සහ Live Feed එක)
    // =========================================================================
    return (
        <div 
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <Sidebar/>
            <div className="flex-1 flex flex-col md:flex-row gap-6 h-full">
  
                {/* --- Left Side: QR Generator Section --- */}
                <div className="flex-[2] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden text-center">
                    
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -translate-x-10 -translate-y-10"></div>
                    
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Scan to Mark Attendance</h2>
                    <p className="text-white/60 font-medium mb-10 bg-white/5 px-4 py-1 rounded-full border border-white/10">
                        Session ID: <span className="text-blue-300">{sessionId}</span>
                    </p>
                    
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-blue-500/30 rounded-[2rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                        <div className="relative bg-white p-6 rounded-[2rem] shadow-2xl transition-transform duration-500 hover:scale-105">
                            {qrData ? (
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`} 
                                    alt="Dynamic QR Code"
                                    className="w-56 h-56 md:w-64 md:h-64"
                                />
                            ) : (
                                <div className="w-56 h-56 md:w-64 md:h-64 flex items-center justify-center bg-gray-200 animate-pulse text-gray-500">
                                    Loading...
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-12 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-yellow-400 font-mono text-2xl font-bold bg-black/20 px-6 py-2 rounded-2xl border border-yellow-400/30">
                            <span className="animate-ping w-2 h-2 bg-yellow-400 rounded-full"></span>
                            ⏱ 00:0{timeLeft}
                        </div>
                        <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold">QR changes automatically</p>
                    </div>
                </div>

                {/* --- Right Side: Live Attendance Feed --- */}
                <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[600px] md:h-auto">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h3 className="text-xl font-bold text-white">Live Feed</h3>
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-black border border-green-500/30">
                            {attendanceList?.length || 0} PRESENT
                        </span>
                    </div>
                    
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {(!attendanceList || attendanceList.length === 0) ? (
                            <p className="text-white/50 text-center mt-10">No attendees yet. Waiting for scans...</p>
                        ) : (
                            attendanceList.map((record, index) => {
                                const scanTime = new Date(record.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                
                                return (
                                    <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✔</div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{record.studentName}</p>
                                                <p className="text-white/40 text-[10px] uppercase">Student ID: {record.studentId}</p>
                                            </div>
                                        </div>
                                        <span className="text-white/60 text-xs font-mono">{scanTime}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <button className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-sm font-bold transition-all">
                        Download Full List
                    </button>
                </div>
            </div>
            
        </div>
    );
}

export default QrAttendance;