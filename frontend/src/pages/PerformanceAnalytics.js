import React, { useEffect, useState } from 'react';
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function PerformanceAnalytics() {
    const [analytics, setAnalytics] = useState({
        overview: {
            totalGrades: 0,
            totalPlayers: 0,
            averageScore: 0,
            attendanceAverage: 0
        },
        chartData: [],
        topPerformers: [],
        teams: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        const fetchAnalytics = async () => {
            try {
                setIsLoading(true);
                setError('');

                const token = localStorage.getItem('token');
                const url = 'http://localhost:5000/performance/analytics';

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Authorization: `${token}`
                    },
                    signal: controller.signal
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to load analytics');
                }

                setAnalytics({
                    overview: result.data?.overview || {
                        totalGrades: 0,
                        totalPlayers: 0,
                        averageScore: 0,
                        attendanceAverage: 0
                    },
                    chartData: result.data?.chartData || [],
                    topPerformers: result.data?.topPerformers || [],
                    teams: result.data?.teams || []
                });
            } catch (fetchError) {
                if (fetchError.name === 'AbortError') {
                    return;
                }

                setError(fetchError.message || 'Unable to load analytics data');
                setAnalytics({
                    overview: {
                        totalGrades: 0,
                        totalPlayers: 0,
                        averageScore: 0,
                        attendanceAverage: 0
                    },
                    chartData: [],
                    topPerformers: [],
                    teams: []
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();

        return () => {
            controller.abort();
        };
    }, []);

    const handleDownloadReport = () => {
        if (!analytics.chartData.length) {
            return;
        }

        const doc = new jsPDF();
        const generatedAt = new Date();

        doc.setFillColor(14, 45, 93);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('SmartSport Performance Report', 14, 18);

        doc.setTextColor(65, 65, 65);
        doc.setFontSize(10);
        doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 38);

        autoTable(doc, {
            startY: 45,
            head: [['Metric', 'Value']],
            body: [
                ['Total Players', String(analytics.overview.totalPlayers)],
                ['Average Score', `${analytics.overview.averageScore}/10`],
                ['Total Grades', String(analytics.overview.totalGrades)],
                ['Average Attendance', `${analytics.overview.attendanceAverage}%`]
            ],
            theme: 'grid',
            headStyles: {
                fillColor: [23, 94, 164],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [245, 248, 252] },
            styles: { fontSize: 10 }
        });

        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        doc.text('Performance Timeline', 14, doc.lastAutoTable.finalY + 12);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 16,
            head: [['Date', 'Average Performance (1-10)', 'Attendance (%)']],
            body: analytics.chartData.map((point) => [
                point.name,
                point.performance,
                point.attendance
            ]),
            theme: 'striped',
            headStyles: {
                fillColor: [31, 125, 95],
                textColor: [255, 255, 255]
            },
            styles: { fontSize: 10 }
        });

        doc.text('Top Performers', 14, doc.lastAutoTable.finalY + 12);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 16,
            head: [['Player', 'Score', 'Trend']],
            body: analytics.topPerformers.map((player) => [
                player.name,
                String(player.score),
                player.trend === 'up' ? 'Improving' : player.trend === 'down' ? 'Declining' : 'Stable'
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [226, 160, 33],
                textColor: [255, 255, 255]
            },
            styles: { fontSize: 10 }
        });

        const totalPages = doc.getNumberOfPages();
        for (let page = 1; page <= totalPages; page += 1) {
            doc.setPage(page);
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.text(
                `SmartSport Confidential  |  Page ${page} of ${totalPages}`,
                14,
                290
            );
        }

        doc.save(`performance-report-${generatedAt.toISOString().slice(0, 10)}.pdf`);
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <Sidebar/>

            {/* --- Main Content Section --- */}
            <div className="flex-1 flex flex-col gap-4 overflow-auto">

                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-3 shadow-xl">
                    <h2 className="text-xl md:text-2xl font-semibold text-white">🏆 Performance Analytics</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadReport}
                            disabled={!analytics.chartData.length}
                            className="bg-white text-blue-900 px-4 py-1 rounded-lg font-bold text-sm shadow-md hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Download Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                        <p className="text-white/60 text-xs uppercase tracking-wider">Total Players</p>
                        <p className="text-white text-2xl font-bold">{analytics.overview.totalPlayers}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                        <p className="text-white/60 text-xs uppercase tracking-wider">Average Score</p>
                        <p className="text-white text-2xl font-bold">{analytics.overview.averageScore}/10</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                        <p className="text-white/60 text-xs uppercase tracking-wider">Total Grades</p>
                        <p className="text-white text-2xl font-bold">{analytics.overview.totalGrades}</p>
                    </div>
                </div>

                {/* Performance Chart Section */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl h-96">
                    <h3 className="text-white font-bold mb-4 opacity-80 uppercase text-xs tracking-widest">Team Performance Overview</h3>
                    {isLoading ? (
                        <p className="text-white/70">Loading chart data...</p>
                    ) : error ? (
                        <p className="text-red-300">{error}</p>
                    ) : analytics.chartData.length === 0 ? (
                        <p className="text-white/70">No grading data found for this team.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.chartData}>
                                <defs>
                                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 10]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '10px', color: '#fff' }}
                                    itemStyle={{ color: '#4ade80' }}
                                />
                                <Area type="monotone" dataKey="performance" stroke="#4ade80" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">

                    {/* Top Performers */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl overflow-y-auto">
                        <h3 className="text-white font-bold mb-4">⭐ Top Performers</h3>
                        <div className="space-y-3">
                            {analytics.topPerformers.length === 0 ? (
                                <p className="text-white/70 text-sm">No top performer data yet.</p>
                            ) : (
                                analytics.topPerformers.map((player) => (
                                    <div key={player.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center font-bold text-xs">{player.name[0]}</div>
                                            <span className="text-sm font-medium">{player.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-mono">
                                            <span className="text-white font-bold">{player.score}</span>
                                            <span className={player.trend === 'up' ? 'text-green-400' : player.trend === 'down' ? 'text-red-400' : 'text-slate-300'}>
                                                {player.trend === 'up' ? '▲' : player.trend === 'down' ? '▼' : '■'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Improvement Areas */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-white font-bold mb-4">📉 Attendance Trend</h3>
                        {analytics.chartData.length === 0 ? (
                            <p className="text-white/70 text-sm">No attendance data available.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="80%">
                                <LineChart data={analytics.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                                    <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '10px', color: '#fff' }}
                                        itemStyle={{ color: '#ffcf33' }}
                                    />
                                    <Line type="monotone" dataKey="attendance" stroke="#ffcf33" strokeWidth={4} dot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                        <p className="text-white/50 text-[10px] mt-2 text-center uppercase tracking-widest">
                            Average attendance: {analytics.overview.attendanceAverage}%
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default PerformanceAnalytics;