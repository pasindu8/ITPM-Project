import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';


function SendAlerts() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [students, setStudents] = useState([]); // ශිෂ්‍යයන් තබා ගැනීමට
    const [selectedAudience, setSelectedAudience] = useState("all"); // තෝරාගත් ශිෂ්‍යයා

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch('http://localhost:5000/auth/send-alerts', {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `${token}`
                    }
                });
                
                const result = await res.json();
                
                if (res.ok) {
                    setDashboardData(result.data);
                    setUser(result.user); // Backend එකෙන් user එවන්න ඕනේ, නැත්නම් localStorage එකෙන් ගන්න
                    setStudents(result.data.studentList || []); // Set students list from backend response
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
            <div className="flex-1 flex flex-col gap-6">
  
                {/* --- Header Section --- */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>📢</span> Send Instant Alerts
                    </h2>
                </div>

                {/* --- Alert Form Card --- */}
                <div className="max-w-2xl mx-auto w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 md:p-12 shadow-2xl mt-4">
                    
                    <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white/90">Compose Message</h3>
                    <p className="text-white/60 text-sm mt-1">Send important updates to your players instantly.</p>
                    </div>

                    <form className="space-y-6">
                    
                    {/* Select Audience */}
                    <div>
                        <label className="block text-white/80 font-medium mb-2 ml-1">Select Audience:</label>
                        <select className="w-full p-4 bg-white/90 border-none rounded-2xl text-gray-800 font-medium focus:ring-4 focus:ring-blue-400/50 outline-none transition-all cursor-pointer appearance-none shadow-inner"
                        value={selectedAudience}
                        onChange={(e) => setSelectedAudience(e.target.value)}>
                        
                            <option value="all">All Players</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.stuid}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Message Textarea */}
                    <div>
                        <label className="block text-white/80 font-medium mb-2 ml-1">Message:</label>
                        <textarea 
                        placeholder="Type your urgent message here... (e.g. Practice cancelled due to rain)" 
                        className="w-full h-48 p-5 bg-white/90 border-none rounded-2xl text-gray-800 text-lg focus:ring-4 focus:ring-blue-400/50 outline-none transition-all resize-none shadow-inner leading-relaxed"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        className="w-full py-5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xl rounded-2xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">🚀</span>
                        Send Alert Now
                    </button>

                    </form>
                    
                    {/* Additional Info Tip */}
                    <p className="text-center text-white/40 text-xs mt-6 uppercase tracking-widest font-semibold">
                    Notifications will be sent as real-time alerts
                    </p>

                </div>
            </div>
            
        </div>
    );
}

export default SendAlerts;