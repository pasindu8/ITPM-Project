import React, { useState, useEffect, useMemo } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';



const statusColor = {
  'Under Treatment': 'bg-red-500/20 border-red-400/30 text-red-300',
  'Recovering':      'bg-yellow-500/20 border-yellow-400/30 text-yellow-300',
  'Not Fit to Play': 'bg-orange-500/20 border-orange-400/30 text-orange-300',
  'Fully Recovered': 'bg-green-500/20 border-green-400/30 text-green-300',
  'Light Training':  'bg-blue-500/20 border-blue-400/30 text-blue-300',
};

function MedicalProfile() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/medical-profiles', {
          headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfiles(data);
          if (data.length > 0) {
            setSelectedId(data[0].id || data[0]._id);
          }
        } else {
          console.error("Failed to fetch medical profiles");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        p.sport.toLowerCase().includes(q)
    );
  }, [profiles, searchTerm]);

  const selectedProfile =
    filteredProfiles.find((p) => (p.id || p._id) === selectedId) || filteredProfiles[0];

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
          <h2 className="text-2xl font-bold text-white">Student Medical Profiles</h2>
          <p className="text-white/60 text-sm mt-1">View injury history, allergies, medications, and active status.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl">
          <input
            type="text"
            placeholder="Search by student name, id, or sport"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Student list */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-4 shadow-xl lg:col-span-1">
            <h3 className="text-white font-semibold mb-3">
              Students ({filteredProfiles.length})
            </h3>
            <div className="flex flex-col gap-2">
              {filteredProfiles.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">No students found</p>
              ) : (
                filteredProfiles.map((profile) => (
                  <button
                    key={profile._id}
                    onClick={() => setSelectedId(profile.id || profile._id)}
                    className={`text-left rounded-xl px-3 py-2 border transition-all ${
                      (selectedProfile?.id || selectedProfile?._id) === (profile.id || profile._id)
                        ? 'bg-blue-500/30 border-blue-400/40 text-white'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-semibold">{profile.name}</p>
                    <p className="text-xs text-white/60">{profile.id} | {profile.sport}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Profile detail */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl lg:col-span-2">
            {selectedProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Student Name', value: selectedProfile.name },
                  { label: 'Student ID',   value: selectedProfile.id },
                  { label: 'Sport',        value: selectedProfile.sport },
                  { label: 'Blood Group',  value: selectedProfile.bloodGroup || '—' },
                  { label: 'Allergies',    value: selectedProfile.allergies || 'None' },
                  { label: 'Medications',  value: selectedProfile.medications || 'None' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-white/50">{label}</p>
                    <p className="text-white font-semibold">{value}</p>
                  </div>
                ))}

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:col-span-2">
                  <p className="text-white/50">Latest Diagnosis</p>
                  <p className="text-white font-semibold">{selectedProfile.latestDiagnosis || '—'}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:col-span-2">
                  <p className="text-white/50 mb-1">Current Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor[selectedProfile.currentStatus] || 'bg-white/10 border-white/20 text-white/70'}`}>
                    {selectedProfile.currentStatus}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-white/60 text-center py-12">No matching students found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicalProfile;
