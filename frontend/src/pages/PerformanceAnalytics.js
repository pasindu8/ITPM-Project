import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';
// Charts සඳහා recharts පාවිච්චි කරනවා නම්:
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// උදාහරණ දත්ත (පස්සේ මේවා Backend එකෙන් ගන්න පුළුවන්)
const data = [
  { name: 'Week 1', performance: 65, attendance: 90 },
  { name: 'Week 2', performance: 72, attendance: 85 },
  { name: 'Week 3', performance: 85, attendance: 95 },
  { name: 'Week 4', performance: 78, attendance: 80 },
  { name: 'Week 5', performance: 92, attendance: 98 },
];

function PerformanceAnalytics() {
    return (
        <div 
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
            style={{ backgroundImage: `url(${bgImage})` }}
            >
            <Sidebar/>

            {/* --- Main Content Section --- */}
            <div className="flex-1 flex flex-col gap-4 overflow-auto">
                
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex justify-between items-center shadow-xl">
                    <h2 className="text-xl md:text-2xl font-semibold text-white">🏆 Performance Analytics</h2>
                    <div className="flex gap-2">
                        <select className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1 outline-none text-sm cursor-pointer hover:bg-white/20 transition-all">
                            <option className="text-black">All Teams</option>
                            <option className="text-black">Cricket - Under 19</option>
                        </select>
                        <button className="bg-white text-blue-900 px-4 py-1 rounded-lg font-bold text-sm shadow-md hover:bg-blue-50 transition-all">Download Report</button>
                    </div>
                </div>

                {/* Performance Chart Section */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl h-96">
                    <h3 className="text-white font-bold mb-4 opacity-80 uppercase text-xs tracking-widest">Team Performance Overview</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '10px', color: '#fff' }}
                                itemStyle={{ color: '#4ade80' }}
                            />
                            <Area type="monotone" dataKey="performance" stroke="#4ade80" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    
                    {/* Top Performers */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl overflow-y-auto">
                        <h3 className="text-white font-bold mb-4">⭐ Top Performers</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Nimal Perera", score: "9.5", status: "up" },
                                { name: "Dasun Shanaka", score: "9.2", status: "up" },
                                { name: "Kasun Silva", score: "8.8", status: "down" }
                            ].map((player, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center font-bold text-xs">{player.name[0]}</div>
                                        <span className="text-sm font-medium">{player.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono">
                                        <span className="text-white font-bold">{player.score}</span>
                                        <span className={player.status === "up" ? "text-green-400" : "text-red-400"}>
                                            {player.status === "up" ? "▲" : "▼"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Improvement Areas */}
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-white font-bold mb-4">📉 Attendance Trend</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart data={data}>
                                <Tooltip contentStyle={{ display: 'none' }} />
                                <Line type="monotone" dataKey="attendance" stroke="#ffcf33" strokeWidth={4} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="text-white/50 text-[10px] mt-2 text-center uppercase tracking-widest">Average attendance: 89% this month</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default PerformanceAnalytics;