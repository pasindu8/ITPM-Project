import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';

const STAGES = ['Injured', 'Treatment', 'Light Training', 'Fully Fit'];

const weekOptions = [
  { id: 'full_rest', label: 'Full Rest', color: 'bg-red-500/20 border-red-400/30 text-red-300', icon: '🛌' },
  { id: 'light_stretch', label: 'Light Stretching', color: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300', icon: '🧘' },
  { id: 'physio', label: 'Physiotherapy', color: 'bg-blue-500/20 border-blue-400/30 text-blue-300', icon: '💆' },
  { id: 'light_training', label: 'Light Training', color: 'bg-purple-500/20 border-purple-400/30 text-purple-300', icon: '🚶' },
  { id: 'moderate_training', label: 'Moderate Training', color: 'bg-orange-500/20 border-orange-400/30 text-orange-300', icon: '🏃' },
  { id: 'normal_training', label: 'Normal Training', color: 'bg-green-500/20 border-green-400/30 text-green-300', icon: '⚽' },
];

const defaultPlan = (numWeeks) =>
  Array.from({ length: numWeeks }, (_, i) => ({
    week: i + 1,
    activity: i === 0 ? 'full_rest' : i === 1 ? 'light_stretch' : i === 2 ? 'light_training' : 'normal_training',
    notes: '',
  }));



const statusColor = {
  'Under Treatment': 'text-red-300 bg-red-500/15 border-red-400/30',
  'Recovering': 'text-yellow-300 bg-yellow-500/15 border-yellow-400/30',
  'Not Fit to Play': 'text-orange-300 bg-orange-500/15 border-orange-400/30',
  'Fully Recovered': 'text-green-300 bg-green-500/15 border-green-400/30',
};

function RecoveryTimeline({ currentStage }) {
  const idx = STAGES.indexOf(currentStage);
  return (
    <div className="flex items-center gap-1 mt-3 flex-wrap">
      {STAGES.map((stage, i) => (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i <= idx ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/40' : 'bg-white/10 border-white/20 text-white/40'}`}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i <= idx ? 'text-blue-300' : 'text-white/30'}`}>{stage}</span>
          </div>
          {i < STAGES.length - 1 && (
            <div className={`flex-1 h-0.5 mb-5 min-w-4 rounded-full ${i < idx ? 'bg-blue-400' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function PlanModal({ student, onClose, onSave }) {
  const [plan, setPlan] = useState(student.weeklyPlan || defaultPlan(4));
  const [numWeeks, setNumWeeks] = useState(student.recoveryWeeks || plan.length);

  const updateWeek = (weekIdx, field, value) => {
    setPlan((prev) => prev.map((w, i) => i === weekIdx ? { ...w, [field]: value } : w));
  };

  const handleWeeksChange = (n) => {
    const newN = parseInt(n);
    setNumWeeks(newN);
    setPlan((prev) => {
      if (newN > prev.length) return [...prev, ...Array.from({ length: newN - prev.length }, (_, i) => ({ week: prev.length + i + 1, activity: 'full_rest', notes: '' }))];
      return prev.slice(0, newN);
    });
  };

  const opt = (activityId) => weekOptions.find((o) => o.id === activityId) || weekOptions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 border border-white/20 rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">🔄 Edit Recovery Plan</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <div className="mb-5 p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-white font-semibold">{student.studentName}</p>
          <p className="text-white/50 text-sm">{student.injuryType} · {student.injuryLocation}</p>
        </div>

        <div className="mb-5">
          <label className="text-white/70 text-sm mb-2 block">Total Recovery Weeks</label>
          <div className="flex gap-2 flex-wrap">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button key={n} onClick={() => handleWeeksChange(n)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${numWeeks === n ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {plan.map((week, idx) => {
            const o = opt(week.activity);
            return (
              <div key={idx} className={`p-4 rounded-2xl border ${o.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{o.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold">Week {week.week}</p>
                    <select
                      value={week.activity}
                      onChange={(e) => updateWeek(idx, 'activity', e.target.value)}
                      className="mt-1 bg-gray-800 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-400 w-full max-w-xs"
                    >
                      {weekOptions.map((wo) => (
                        <option key={wo.id} value={wo.id}>{wo.icon} {wo.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  value={week.notes}
                  onChange={(e) => updateWeek(idx, 'notes', e.target.value)}
                  placeholder="Add notes for this week..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/70 placeholder-white/20 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 font-medium transition-all">Cancel</button>
          <button onClick={() => onSave({ ...student, weeklyPlan: plan, recoveryWeeks: numWeeks })}
            className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/30">
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}

function RecoveryPlanCard({ student, onEdit }) {
  const opt = (activityId) => weekOptions.find((o) => o.id === activityId) || weekOptions[0];
  const completedWeeks = student.weeklyPlan?.filter((_, i) => {
    const stageIdx = STAGES.indexOf(student.recoveryStage);
    return stageIdx >= 2 ? i < Math.floor(student.weeklyPlan.length * 0.5) : false;
  }).length || 0;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 className="text-white font-bold text-lg">{student.studentName}</h4>
          <p className="text-white/50 text-sm">{student.studentId} · {student.sportType}</p>
          <p className="text-white/60 text-sm mt-0.5">🩹 {student.injuryType} — {student.injuryLocation}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor[student.status] || ''}`}>
            {student.status}
          </span>
          <span className="text-white/40 text-xs">🛌 Rest: {student.restPeriod || '—'}</span>
        </div>
      </div>

      <RecoveryTimeline currentStage={student.recoveryStage || 'Injured'} />

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Recovery Progress</span>
          <span>{student.recoveryWeeks || student.weeklyPlan?.length || 0} weeks total</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, (STAGES.indexOf(student.recoveryStage) / (STAGES.length - 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Weekly Plan Grid */}
      {student.weeklyPlan && student.weeklyPlan.length > 0 && (
        <div className="mt-5">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-3">Weekly Plan</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {student.weeklyPlan.map((week) => {
              const o = opt(week.activity);
              return (
                <div key={week.week} className={`p-3 rounded-xl border text-center ${o.color}`}>
                  <p className="text-xs opacity-60 mb-1">Week {week.week}</p>
                  <p className="text-lg">{o.icon}</p>
                  <p className="text-xs font-semibold mt-1">{o.label}</p>
                  {week.notes && <p className="text-xs opacity-50 mt-1 truncate" title={week.notes}>{week.notes}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => onEdit(student)}
        className="mt-5 w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 text-blue-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
      >
        ✏️ Edit Recovery Plan
      </button>
    </div>
  );
}

function RecoveryPlans() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/injuries', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const withPlans = data.filter((i) => i.status !== 'Fully Recovered');
          setStudents(withPlans);
        } else {
          console.error("Failed to fetch recovery plans");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (updated) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/auth/injuries/${updated._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
        body: JSON.stringify(updated),
      });
    } catch {}
    setStudents((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
    setEditTarget(null);
  };

  const tabFilters = [
    { key: 'all', label: 'All' },
    { key: 'Under Treatment', label: '🔴 Treatment' },
    { key: 'Recovering', label: '🟡 Recovering' },
    { key: 'Not Fit to Play', label: '🟠 Not Fit' },
  ];

  const filtered = filter === 'all' ? students : students.filter((s) => s.status === filter);

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

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white">🔄 Recovery Plans</h2>
          <p className="text-white/50 text-sm mt-1">Weekly recovery session plans for injured students. Plan → Track → Recover.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 border border-white/20 rounded-3xl p-5 text-center shadow-xl hover:scale-105 transition-transform">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Active Plans</p>
            <p className="text-4xl font-black text-white">{students.length}</p>
          </div>
          {[
            { label: 'Treatment', key: 'Under Treatment', color: 'text-red-300 border-red-400/30 bg-red-500/10' },
            { label: 'Recovering', key: 'Recovering', color: 'text-yellow-300 border-yellow-400/30 bg-yellow-500/10' },
            { label: 'Not Fit', key: 'Not Fit to Play', color: 'text-orange-300 border-orange-400/30 bg-orange-500/10' },
          ].map(({ label, key, color }) => (
            <div key={key} className={`border rounded-3xl p-5 text-center shadow-xl hover:scale-105 transition-transform ${color}`}>
              <p className="text-xs uppercase tracking-widest mb-1 opacity-70">{label}</p>
              <p className="text-4xl font-black">{students.filter((s) => s.status === key).length}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-4 shadow-xl flex gap-2 flex-wrap">
          {tabFilters.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === t.key ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}>
              {t.label} ({t.key === 'all' ? students.length : students.filter((s) => s.status === t.key).length})
            </button>
          ))}
        </div>

        {/* Plan Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center text-white/30 py-16 text-lg bg-white/5 rounded-3xl border border-white/10">
              <div className="text-5xl mb-4">📋</div>
              <p>No recovery plans found</p>
            </div>
          ) : filtered.map((student) => (
            <RecoveryPlanCard key={student._id} student={student} onEdit={setEditTarget} />
          ))}
        </div>
      </div>

      {editTarget && (
        <PlanModal student={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />
      )}
    </div>
  );
}

export default RecoveryPlans;
