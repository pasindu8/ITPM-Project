import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';



function EmergencyReferrals() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/emergency-referrals', {
          headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCases(data);
        } else {
          console.error("Failed to fetch emergency referrals");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
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
          <h2 className="text-2xl font-bold text-white">Emergency and Referrals</h2>
          <p className="text-white/60 text-sm mt-1">Escalate serious injuries and maintain referral records.</p>
        </div>

        {cases.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center shadow-xl">
            <div className="text-5xl mb-4">🏥</div>
            <p className="text-white/50">No emergency referrals at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {cases.map((item) => (
              <div key={item._id || item.id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-white font-semibold text-lg">{item.student}</p>
                    <p className="text-white/60 text-sm">{item.issue}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs border w-fit ${
                      item.priority === 'High'
                        ? 'bg-red-500/20 border-red-400/30 text-red-300'
                        : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                    }`}
                  >
                    Priority: {item.priority}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white/50">Referral Center</p>
                    <p className="text-white">{item.referredTo}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white/50">Contact</p>
                    <p className="text-white">{item.contact}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white/50">Status</p>
                    <p className="text-white">{item.status}</p>
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

export default EmergencyReferrals;
