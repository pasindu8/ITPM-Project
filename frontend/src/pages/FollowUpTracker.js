import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';



function FollowUpTracker() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/followups', {
          headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFollowUps(data);
        } else {
          console.error("Failed to fetch follow-ups");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowUps();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <DoctorSidebar />

      <div className="flex-1 flex flex-col gap-4 overflow-auto">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white">Follow-Up Tracker</h2>
          <p className="text-white/60 text-sm mt-1">Track progress and upcoming checkups for injured students.</p>
        </div>

        {followUps.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center shadow-xl">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-white/50">No active follow-ups found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {followUps.map((item) => (
              <div key={item._id || item.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-white font-semibold text-lg">{item.student}</p>
                    <p className="text-white/60 text-sm">{item.injury}</p>
                  </div>
                  {item.nextVisit && (
                    <div className="text-sm text-white/70">
                      Next Visit: <span className="text-blue-300 font-medium">{item.nextVisit}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        item.progress >= 70 ? 'bg-green-500' : item.progress >= 40 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-white/70">Recovery Progress: {item.progress}%</span>
                    <span
                      className={`px-2 py-1 rounded-full border ${
                        item.status === 'On Track'
                          ? 'bg-green-500/20 border-green-400/30 text-green-300'
                          : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowUpTracker;
