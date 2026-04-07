import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, CheckCircle, Calendar } from 'lucide-react';
import bgImage from '../assets/6903344.jpg';
import LecturerSidebar from '../components/LecturerSidebar.js';
import Loader from '../components/Loader.js';
import { lecturerGet } from '../utils/lecturerApi';

const getActivityTime = (value) => {
  if (!value) {
    return 'Just now';
  }

  const then = new Date(value).getTime();
  const now = Date.now();
  const diffMinutes = Math.floor((now - then) / 60000);

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const activityStyle = {
  material: {
    border: 'border-blue-400',
    icon: <FileText size={20} className="text-white" />
  },
  schedule: {
    border: 'border-rose-400',
    icon: <Calendar size={20} className="text-white" />
  },
  mark: {
    border: 'border-green-400',
    icon: <CheckCircle size={20} className="text-white" />
  }
};

const LecturerDashboard = () => {
  const [stats, setStats] = useState({ totalSubjects: 0, activeAssignments: 0, pendingVivas: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await lecturerGet('/dashboard');
        setStats(result.data?.stats || { totalSubjects: 0, activeAssignments: 0, pendingVivas: 0 });
        setActivities(result.data?.activities || []);
      } catch (error) {
        // Keep UI usable with default values if request fails.
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader autoHide={false} />;
  }

  return (
    <div 
        className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
        style={{ backgroundImage: `url(${bgImage})` }}
    >
      <LecturerSidebar />
      <div className="flex-1 flex flex-col gap-4 overflow-auto">
        
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex justify-between items-center shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-poppins text-white">Lecturer Dashboard</h1>
            <p className="text-white/70 mt-1">Welcome back! Here is your academic overview.</p>
          </div>
          <div className="hidden md:block">
            <span className="bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md border border-white/10">
              <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-white shadow-xl transition-transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 uppercase text-sm font-bold tracking-widest mb-2">Total Subjects</p>
                <h3 className="text-5xl font-black text-white">{stats.totalSubjects}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl shadow-inner">
                <BookOpen size={28} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-white shadow-xl transition-transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 uppercase text-sm font-bold tracking-widest mb-2">Active Assignments</p>
                <h3 className="text-5xl font-black text-white">{stats.activeAssignments}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl shadow-inner">
                <FileText size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-white shadow-xl transition-transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 uppercase text-sm font-bold tracking-widest mb-2">Pending Vivas</p>
                <h3 className="text-5xl font-black text-white">{stats.pendingVivas}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl shadow-inner">
                <CheckCircle size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl flex-1 overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {activities.length === 0 && (
                <div className="text-white/60 text-center py-8">No recent activities yet.</div>
              )}

              {activities.map((activity, index) => {
                const style = activityStyle[activity.kind] || activityStyle.material;

                return (
                  <div key={`${activity.kind}-${index}`} className={`flex justify-between items-center p-5 bg-white/5 border-l-4 ${style.border} rounded-2xl hover:bg-white/10 transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg">{style.icon}</div>
                      <div>
                        <strong className="text-white text-lg">{activity.title}</strong>
                        <p className="text-sm text-white/60 mt-1">{activity.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs text-white/50 font-medium whitespace-nowrap">{getActivityTime(activity.occurredAt)}</span>
                  </div>
                );
              })}

            </div>
        </div>

      </div>
    </div>
  );
};

export default LecturerDashboard;
