import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';



function MedicalClearance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // ID of the request being updated

  useEffect(() => {
    const fetchClearances = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/medical-clearances', {
          headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        } else {
          console.error("Failed to fetch medical clearances");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClearances();
  }, []);

  const updateStatus = async (item, newStatus) => {
    // Optimistic update
    setRequests((prev) =>
      prev.map((r) => (r._id === item._id ? { ...r, status: newStatus } : r))
    );



    try {
      setUpdating(item._id);
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/auth/medical-clearances/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // revert on failure
      setRequests((prev) =>
        prev.map((r) => (r._id === item._id ? { ...r, status: item.status } : r))
      );
    } finally {
      setUpdating(null);
    }
  };

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
          <h2 className="text-2xl font-bold text-white">Medical Clearance</h2>
          <p className="text-white/60 text-sm mt-1">Approve fitness for training and match participation.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending', color: 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300' },
            { label: 'Approved', color: 'bg-green-500/15 border-green-400/30 text-green-300' },
            { label: 'Rejected', color: 'bg-red-500/15 border-red-400/30 text-red-300' },
          ].map(({ label, color }) => (
            <div key={label} className={`border rounded-3xl p-4 text-center shadow-xl ${color}`}>
              <p className="text-xs uppercase tracking-widest mb-1 opacity-70">{label}</p>
              <p className="text-3xl font-black">{requests.filter((r) => r.status === label).length}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/70 border-b border-white/20">
                <th className="py-3 pr-4">Request ID</th>
                <th className="py-3 pr-4">Student</th>
                <th className="py-3 pr-4">Sport</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item._id} className="border-b border-white/10 text-white/90 hover:bg-white/5 transition-all">
                  <td className="py-3 pr-4 text-white/50 text-xs">{item.id || item._id}</td>
                  <td className="py-3 pr-4 font-semibold">{item.student}</td>
                  <td className="py-3 pr-4">{item.sport}</td>
                  <td className="py-3 pr-4 text-white/60">{item.requestDate}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${
                        item.status === 'Approved'
                          ? 'bg-green-500/20 border-green-400/30 text-green-300'
                          : item.status === 'Rejected'
                          ? 'bg-red-500/20 border-red-400/30 text-red-300'
                          : 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        disabled={item.status === 'Approved' || updating === item._id}
                        onClick={() => updateStatus(item, 'Approved')}
                        className="px-3 py-1 rounded-lg text-xs bg-green-500/30 border border-green-400/40 text-green-200 hover:bg-green-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        ✓ Approve
                      </button>
                      <button
                        disabled={item.status === 'Rejected' || updating === item._id}
                        onClick={() => updateStatus(item, 'Rejected')}
                        className="px-3 py-1 rounded-lg text-xs bg-red-500/30 border border-red-400/40 text-red-200 hover:bg-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-white/30 py-12">
                    <div className="text-4xl mb-3">✅</div>
                    No clearance requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MedicalClearance;
