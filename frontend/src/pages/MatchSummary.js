import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // මෙන්න මෙහෙම Import කරන්න

const MatchSummary = () => {
    const { sessionId } = useParams();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            const res = await fetch(`http://localhost:5000/scout/summary/${sessionId}`, {
                headers: { 'Authorization': `${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setSummary(data.data);
        };
        fetchSummary();
    }, [sessionId]);

    const generatePDF = () => {
        const doc = new jsPDF();
        
        // Header එක දාමු
        doc.setFontSize(20);
        doc.text("MATCH PERFORMANCE REPORT", 105, 15, { align: "center" });

        // පළමු Table එක (Stats)
        // doc.autoTable වෙනුවට autoTable(doc, ...) පාවිච්චි කරන්න
        autoTable(doc, {
            startY: 30,
            head: [['Total Goals', 'Assists', 'Fouls', 'Cards']],
            body: [[summary.stats.goals, summary.stats.assists, summary.stats.fouls, summary.stats.cards]],
            theme: 'grid'
        });

        // දෙවන Table එක (Timeline)
        const tableRows = summary.events.map(event => [
            event.matchTime,
            event.playerName,
            event.eventType
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10, // කලින් ටේබල් එක ඉවර වුණු තැනින් පටන් ගන්න
            head: [['Time', 'Player', 'Event']],
            body: tableRows,
        });

        doc.save(`Match_Report_${summary.session.opponent}.pdf`);
    };

    if (!summary) return <div className="text-white text-center p-10">Loading Summary...</div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase">Match Summary</h1>
                        <p className="text-blue-400 font-bold">Vs {summary.session.opponent}</p>
                    </div>
                    <button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-600/20">
                        📥 Download PDF Report
                    </button>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <StatCard label="Goals" value={summary.stats.goals} color="text-green-400" />
                    <StatCard label="Assists" value={summary.stats.assists} color="text-blue-400" />
                    <StatCard label="Fouls" value={summary.stats.fouls} color="text-red-400" />
                    <StatCard label="Cards" value={summary.stats.cards} color="text-yellow-400" />
                </div>

                {/* Timeline Section */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-l-4 border-blue-500 pl-4">Match Timeline</h3>
                    <div className="space-y-4">
                        {summary.events.map((e, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="flex gap-4">
                                    <span className="text-gray-500 font-mono">{e.matchTime}</span>
                                    <span className="font-bold">{e.playerName}</span>
                                </div>
                                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${getEventColor(e.eventType)}`}>
                                    {e.eventType}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ label, value, color }) => (
    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{label}</p>
        <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
);

const getEventColor = (type) => {
    if (type === 'Goal') return 'bg-green-500/20 text-green-400';
    if (type === 'Foul') return 'bg-red-500/20 text-red-400';
    if (type === 'Yellow Card') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-blue-500/20 text-blue-400';
};

export default MatchSummary;