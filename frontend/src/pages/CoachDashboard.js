import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';
import TimeAgo from 'timeago-react';


function CoachDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch('http://localhost:5000/auth/dashboard-stats', {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `${token}`
                    }
                });
                
                const result = await res.json();
                
                if (res.ok) {
                    setDashboardData(result.data);
                    setUser(result.user); // Backend එකෙන් user එවන්න ඕනේ, නැත්නම් localStorage එකෙන් ගන්න
                } else {
                    console.error("Failed to fetch stats");
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false); 
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

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
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                    Welcome back, Coach {dashboardData?.name}!
                </h2>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-lg">
                        <Link to="/profile">
                            {dashboardData?.name?.charAt(0).toUpperCase()}
                        </Link>
                    </div>
                </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center shadow-xl transition-transform hover:scale-105">
                    <h3 className="text-white/70 uppercase text-sm font-bold tracking-widest mb-2">Total Players</h3>
                    <h1 className="text-5xl font-black text-white">{dashboardData?.students || 0}</h1>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center shadow-xl transition-transform hover:scale-105">
                    <h3 className="text-white/70 uppercase text-sm font-bold tracking-widest mb-2">Injured Players</h3>
                    <h1 className="text-5xl font-black text-red-400">02</h1>
                </div>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center shadow-xl transition-transform hover:scale-105">
                    <h3 className="text-white/70 uppercase text-sm font-bold tracking-widest mb-2">Next Session</h3>
                    <h1 className="text-3xl font-black text-white mt-2">Today, 4:00 PM</h1>
                </div>
                </div>

                {/* Recent Updates Section */}
                <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6">Recent Updates & Alerts</h3>
                
                <div className="space-y-4">
                    {/* Conflict Alert */}
                    <div className="flex justify-between items-center p-5 bg-white/5 border-l-4 border-yellow-400 rounded-2xl hover:bg-white/10 transition-all">
                    <div>
                        <strong className="text-white text-lg">⚠️ Schedule Conflict Detected</strong>
                        <p className="text-sm text-white/60 mt-1">3 students have lectures during tomorrow's practice.</p>
                    </div>
                    <button className="px-6 py-2 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">View</button>
                    </div>

                    {/* Success Alert */}
                    {dashboardData?.alerts?.length > 0 ? (
                        dashboardData.alerts.map((alert, index) => (
                        <div key={index} className="flex justify-between items-center p-5 bg-white/5 border-l-4 border-white rounded-2xl hover:bg-white/10 transition-all">
                        <div>
                            <strong className="text-white text-lg">📢 Message Sent</strong>
                            <p className="text-sm text-white/60 mt-1">"{alert.message}"</p>
                        </div>
                        <span className="text-xs text-white/40 font-medium">
                            <TimeAgo 
                                datetime={alert.dateAndTime} 
                                locale='en_US' 
                            />
                        </span>
                        </div>
                        ))
                    ) : (
                        <p className="text-white/40">No alerts available</p>
                    )}
                </div>
                
                </div>
            </div>
            </div>
    );
}

export default CoachDashboard;