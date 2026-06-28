import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';

// ─── Status badge helper ────────────────────────────────────────────────────
const statusConfig = {
  'Under Treatment': { color: 'bg-red-500/20 text-red-300 border-red-400/40', dot: 'bg-red-400', icon: '🔴' },
  'Recovering':      { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40', dot: 'bg-yellow-400', icon: '🟡' },
  'Not Fit to Play': { color: 'bg-orange-500/20 text-orange-300 border-orange-400/40', dot: 'bg-orange-400', icon: '🟠' },
  'Fully Recovered': { color: 'bg-green-500/20 text-green-300 border-green-400/40', dot: 'bg-green-400', icon: '🟢' },
};

const STAGES = ['Injured', 'Treatment', 'Light Training', 'Fully Fit'];
const REST_PERIOD_OPTIONS = ['1 day', '3 days', '1 week', '2 weeks', '3 weeks', '1 month', '6 weeks', '2 months'];
const TREATMENT_OPTIONS = [
  'Physiotherapy',
  'Medication',
  'Ice Therapy',
  'Heat Therapy',
  'Strength Training',
  'Mobility Training',
  'Massage Therapy',
  'Rest and Monitoring',
];

// ─── Recovery Timeline Component ─────────────────────────────────────────────
function RecoveryTimeline({ currentStage }) {
  const idx = STAGES.indexOf(currentStage);
  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      {STAGES.map((stage, i) => (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i <= idx
                  ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/40'
                  : 'bg-white/10 border-white/20 text-white/40'
              }`}
            >
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= idx ? 'text-blue-300' : 'text-white/40'}`}>
              {stage}
            </span>
          </div>
          {i < STAGES.length - 1 && (
            <div
              className={`flex-1 h-0.5 mb-5 min-w-6 rounded-full transition-all ${
                i < idx ? 'bg-blue-400' : 'bg-white/15'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Appointment Modal ────────────────────────────────────────────────────────
function AppointmentModal({ injury, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    appointmentDate: injury?.appointmentDate ? injury.appointmentDate.split('T')[0] : '',
    appointmentTime: injury?.appointmentTime || '',
    medicalNotes: injury?.medicalNotes || '',
    restPeriod: injury?.restPeriod || '',
    treatment: injury?.treatment || '',
    status: injury?.status || 'Under Treatment',
    recoveryStage: injury?.recoveryStage || 'Injured',
  });

  const [errors, setErrors] = useState({});

  const validateForm = (values) => {
    const nextErrors = {};
    const notes = values.medicalNotes.trim();
    const rest = values.restPeriod.trim();
    const treatment = values.treatment.trim();

    if (!values.appointmentDate) {
      nextErrors.appointmentDate = 'Appointment date is required.';
    } else if (values.appointmentDate < today) {
      nextErrors.appointmentDate = 'Appointment date cannot be in the past.';
    }

    if (!values.appointmentTime) {
      nextErrors.appointmentTime = 'Appointment time is required.';
    }

    if (!notes) {
      nextErrors.medicalNotes = 'Medical notes are required.';
    } else if (notes.length < 10) {
      nextErrors.medicalNotes = 'Medical notes should be at least 10 characters.';
    }

    if (rest && rest.length < 3) {
      nextErrors.restPeriod = 'Rest period should be meaningful (min 3 characters).';
    }

    if (values.status !== 'Fully Recovered' && !treatment) {
      nextErrors.treatment = 'Treatment is required unless the athlete is fully recovered.';
    } else if (treatment && treatment.length < 3) {
      nextErrors.treatment = 'Treatment should be at least 3 characters.';
    }

    if (values.status === 'Fully Recovered' && values.recoveryStage !== 'Fully Fit') {
      nextErrors.recoveryStage = 'Fully Recovered status requires Fully Fit stage.';
    }

    if (values.status === 'Under Treatment' && values.recoveryStage === 'Fully Fit') {
      nextErrors.recoveryStage = 'Under Treatment status cannot be set to Fully Fit.';
    }

    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (Object.keys(errors).length > 0) {
      setErrors(validateForm(nextForm));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      ...injury,
      ...form,
      medicalNotes: form.medicalNotes.trim(),
      restPeriod: form.restPeriod.trim(),
      treatment: form.treatment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 border border-white/20 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">📅 Assign Appointment</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">✕</button>
        </div>

        <div className="mb-5 p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-white font-semibold">{injury?.studentName}</p>
          <p className="text-white/60 text-sm mt-1">
            {injury?.sportType} · {injury?.injuryType} · {injury?.injuryLocation}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleChange}
                min={today}
                max={new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]}
                className={`w-full bg-white/10 border rounded-xl px-4 py-2 text-white focus:outline-none ${
                  errors.appointmentDate ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                }`}
              />
              {errors.appointmentDate && <p className="text-red-300 text-xs mt-1">{errors.appointmentDate}</p>}
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Time</label>
              <input
                type="time"
                name="appointmentTime"
                value={form.appointmentTime}
                onChange={handleChange}
                className={`w-full bg-white/10 border rounded-xl px-4 py-2 text-white focus:outline-none ${
                  errors.appointmentTime ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                }`}
              />
              {errors.appointmentTime && <p className="text-red-300 text-xs mt-1">{errors.appointmentTime}</p>}
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-1 block">Medical Notes</label>
            <textarea
              name="medicalNotes"
              value={form.medicalNotes}
              onChange={handleChange}
              rows={3}
              placeholder="Enter diagnosis, observations..."
              className={`w-full bg-white/10 border rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none resize-none ${
                errors.medicalNotes ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
              }`}
            />
            {errors.medicalNotes && <p className="text-red-300 text-xs mt-1">{errors.medicalNotes}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Rest Period</label>
              <select
                name="restPeriod"
                value={form.restPeriod}
                onChange={handleChange}
                className={`w-full bg-white/10 border rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none ${
                  errors.restPeriod ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                }`}
              >
                <option value="" className="bg-gray-800">Select rest period (optional)</option>
                {form.restPeriod && !REST_PERIOD_OPTIONS.includes(form.restPeriod) && (
                  <option value={form.restPeriod} className="bg-gray-800">{form.restPeriod}</option>
                )}
                {REST_PERIOD_OPTIONS.map((period) => (
                  <option key={period} value={period} className="bg-gray-800">{period}</option>
                ))}
              </select>
              {errors.restPeriod && <p className="text-red-300 text-xs mt-1">{errors.restPeriod}</p>}
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Treatment</label>
              <select
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
                className={`w-full bg-white/10 border rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none ${
                  errors.treatment ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                }`}
              >
                <option value="" className="bg-gray-800">Select treatment</option>
                {form.treatment && !TREATMENT_OPTIONS.includes(form.treatment) && (
                  <option value={form.treatment} className="bg-gray-800">{form.treatment}</option>
                )}
                {TREATMENT_OPTIONS.map((item) => (
                  <option key={item} value={item} className="bg-gray-800">{item}</option>
                ))}
              </select>
              {errors.treatment && <p className="text-red-300 text-xs mt-1">{errors.treatment}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Injury Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                {Object.keys(statusConfig).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">Recovery Stage</label>
              <select
                name="recoveryStage"
                value={form.recoveryStage}
                onChange={handleChange}
                className={`w-full bg-gray-800 border rounded-xl px-4 py-2 text-white focus:outline-none ${
                  errors.recoveryStage ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                }`}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.recoveryStage && <p className="text-red-300 text-xs mt-1">{errors.recoveryStage}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/30"
            >
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Injury Card Component ────────────────────────────────────────────────────
function InjuryCard({ injury, onAssign }) {
  const cfg = statusConfig[injury.status] || statusConfig['Under Treatment'];
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
            <span className="text-white font-semibold text-lg">{injury.studentName}</span>
          </div>
          <p className="text-white/50 text-sm">{injury.studentId} · {injury.sportType}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
          {cfg.icon} {injury.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Injury Type</p>
          <p className="text-white font-medium">{injury.injuryType}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Location</p>
          <p className="text-white font-medium">{injury.injuryLocation}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Date</p>
          <p className="text-white font-medium">{new Date(injury.dateOfInjury).toLocaleDateString()}</p>
        </div>
        {injury.appointmentDate && (
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-400/20">
            <p className="text-blue-300/70 text-xs uppercase tracking-wide mb-1">Appointment</p>
            <p className="text-blue-300 font-medium">
              {new Date(injury.appointmentDate).toLocaleDateString()} {injury.appointmentTime && `· ${injury.appointmentTime}`}
            </p>
          </div>
        )}
      </div>

      {injury.medicalNotes && (
        <div className="mt-3 p-3 bg-white/5 rounded-xl border-l-2 border-blue-400">
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Medical Notes</p>
          <p className="text-white/80 text-sm">{injury.medicalNotes}</p>
        </div>
      )}

      {injury.restPeriod && (
        <div className="mt-2 flex gap-3 text-sm flex-wrap">
          <span className="bg-purple-500/15 border border-purple-400/30 text-purple-300 px-3 py-1 rounded-full text-xs">
            🛌 Rest: {injury.restPeriod}
          </span>
          {injury.treatment && (
            <span className="bg-teal-500/15 border border-teal-400/30 text-teal-300 px-3 py-1 rounded-full text-xs">
              💊 {injury.treatment}
            </span>
          )}
        </div>
      )}

      <RecoveryTimeline currentStage={injury.recoveryStage || 'Injured'} />

      <button
        onClick={() => onAssign(injury)}
        className="mt-4 w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 text-blue-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
      >
        📋 Manage Appointment & Notes
      </button>
    </div>
  );
}

// ─── Main Doctor Dashboard ────────────────────────────────────────────────────
function DoctorDashboard() {
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [doctorName, setDoctorName] = useState('Doctor');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInjuries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/injuries', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setInjuries(data);
        } else {
          console.error("Failed to fetch injuries");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/dashboard-stats', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
        });
        if (res.ok) {
          const result = await res.json();
          if (result.user?.name) setDoctorName(result.user.name);
        }
      } catch {}
    };

    fetchInjuries();
    fetchDoctor();
  }, []);

  const handleSaveAppointment = async (updated) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/auth/injuries/${updated._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify(updated),
      });
    } catch {}
    setInjuries((prev) => prev.map((inj) => (inj._id === updated._id ? updated : inj)));
    setSelectedInjury(null);
  };

  const filtered = injuries.filter((inj) => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'treatment' && inj.status === 'Under Treatment') ||
      (activeTab === 'recovering' && inj.status === 'Recovering') ||
      (activeTab === 'notfit' && inj.status === 'Not Fit to Play') ||
      (activeTab === 'recovered' && inj.status === 'Fully Recovered');
    const matchSearch =
      !searchTerm ||
      inj.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inj.sportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inj.injuryType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: injuries.length,
    treatment: injuries.filter((i) => i.status === 'Under Treatment').length,
    recovering: injuries.filter((i) => i.status === 'Recovering').length,
    notFit: injuries.filter((i) => i.status === 'Not Fit to Play').length,
    recovered: injuries.filter((i) => i.status === 'Fully Recovered').length,
    appointments: injuries.filter((i) => i.appointmentDate).length,
  };

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
      <DoctorSidebar />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col gap-4 overflow-auto">

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex justify-between items-center shadow-xl">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Welcome, Mr. {doctorName} 👨‍⚕️
            </h2>
            <p className="text-white/50 text-sm mt-1">Manage injury reports & medical appointments</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-lg">
            <Link to="/profile">{doctorName.charAt(0).toUpperCase()}</Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 text-center shadow-xl transition-transform hover:scale-105">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Total Injured</p>
            <p className="text-4xl font-black text-white">{stats.total}</p>
          </div>
          <div className="bg-red-500/15 backdrop-blur-lg border border-red-400/30 rounded-3xl p-5 text-center shadow-xl transition-transform hover:scale-105">
            <p className="text-red-300/70 text-xs uppercase tracking-widest mb-1">Under Treatment</p>
            <p className="text-4xl font-black text-red-300">{stats.treatment}</p>
          </div>
          <div className="bg-yellow-500/15 backdrop-blur-lg border border-yellow-400/30 rounded-3xl p-5 text-center shadow-xl transition-transform hover:scale-105">
            <p className="text-yellow-300/70 text-xs uppercase tracking-widest mb-1">Recovering</p>
            <p className="text-4xl font-black text-yellow-300">{stats.recovering}</p>
          </div>
          <div className="bg-green-500/15 backdrop-blur-lg border border-green-400/30 rounded-3xl p-5 text-center shadow-xl transition-transform hover:scale-105">
            <p className="text-green-300/70 text-xs uppercase tracking-widest mb-1">Fully Recovered</p>
            <p className="text-4xl font-black text-green-300">{stats.recovered}</p>
          </div>
        </div>

        {/* Today's Appointments Banner */}
        <div className="bg-blue-500/15 backdrop-blur-lg border border-blue-400/30 rounded-3xl p-5 flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-4">
            <div className="text-3xl">📅</div>
            <div>
              <p className="text-white font-bold text-lg">
                {stats.appointments} Appointment{stats.appointments !== 1 ? 's' : ''} Scheduled
              </p>
              <p className="text-blue-300/70 text-sm">Click on any injury card to manage appointments</p>
            </div>
          </div>
          <span className="bg-blue-500 text-white text-sm font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/30">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Search & Filter Tabs */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="🔍  Search by name, sport, or injury..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 w-full"
            />
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'treatment', label: '🔴 Treatment', count: stats.treatment },
                { key: 'recovering', label: '🟡 Recovering', count: stats.recovering },
                { key: 'notfit', label: '🟠 Not Fit', count: stats.notFit },
                { key: 'recovered', label: '🟢 Recovered', count: stats.recovered },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Injury Cards Grid */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center text-white/50 mt-12 text-lg">
              <div className="text-5xl mb-4">🏥</div>
              <p>No injury reports found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((injury) => (
                <InjuryCard key={injury._id} injury={injury} onAssign={setSelectedInjury} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Modal */}
      {selectedInjury && (
        <AppointmentModal
          injury={selectedInjury}
          onClose={() => setSelectedInjury(null)}
          onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
}

export default DoctorDashboard;