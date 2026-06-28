import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';



const statusConfig = {
  'Under Treatment': { color: 'bg-red-500/20 text-red-300 border-red-400/40', icon: '🔴' },
  'Recovering':      { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40', icon: '🟡' },
  'Not Fit to Play': { color: 'bg-orange-500/20 text-orange-300 border-orange-400/40', icon: '🟠' },
  'Fully Recovered': { color: 'bg-green-500/20 text-green-300 border-green-400/40', icon: '🟢' },
};

function RescheduleModal({ appt, onClose, onSave }) {
  const [date, setDate] = useState(appt?.appointmentDate || '');
  const [time, setTime] = useState(appt?.appointmentTime || '');
  const [notes, setNotes] = useState(appt?.medicalNotes || '');

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...appt, appointmentDate: date, appointmentTime: time, medicalNotes: notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">📅 Reschedule Appointment</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <div className="mb-5 p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-white font-semibold">{appt?.studentName}</p>
          <p className="text-white/50 text-sm">{appt?.injuryType} · {appt?.injuryLocation}</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">New Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                min={new Date().toISOString().split('T')[0]} 
                max={new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-1 block">New Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm mb-1 block">Update Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes..." required
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all font-medium">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/30">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, isPast, onReschedule }) {
  const cfg = statusConfig[appt.status] || statusConfig['Under Treatment'];
  const date = new Date(`${appt.appointmentDate}T${appt.appointmentTime || '00:00'}`);
  const isToday = new Date().toDateString() === new Date(appt.appointmentDate).toDateString();

  return (
    <div className={`relative p-5 rounded-2xl border transition-all hover:bg-white/10 ${
      isPast ? 'bg-white/5 border-white/10 opacity-70' : isToday ? 'bg-blue-500/10 border-blue-400/30' : 'bg-white/5 border-white/10'
    }`}>
      {isToday && !isPast && (
        <span className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">TODAY</span>
      )}

      <div className="flex items-start gap-4">
        {/* Time block */}
        <div className={`rounded-2xl px-4 py-3 text-center min-w-16 flex-shrink-0 ${isPast ? 'bg-white/5' : 'bg-blue-500/20 border border-blue-400/30'}`}>
          <p className="text-white font-bold text-lg leading-none">{appt.appointmentTime || '—'}</p>
          <p className={`text-xs mt-1 ${isPast ? 'text-white/30' : 'text-blue-300/70'}`}>
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-white font-bold text-base">{appt.studentName}</h4>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
              {cfg.icon} {appt.status}
            </span>
          </div>
          <p className="text-white/50 text-sm mt-0.5">{appt.studentId} · {appt.sportType}</p>
          <p className="text-white/70 text-sm mt-1">🩹 {appt.injuryType} — {appt.injuryLocation}</p>

          {appt.medicalNotes && (
            <div className="mt-2 p-2 bg-white/5 rounded-xl border-l-2 border-blue-400">
              <p className="text-white/60 text-xs leading-relaxed">{appt.medicalNotes}</p>
            </div>
          )}

          <div className="flex gap-2 mt-3 flex-wrap">
            {appt.restPeriod && (
              <span className="text-xs px-2.5 py-1 bg-purple-500/15 border border-purple-400/30 text-purple-300 rounded-full">
                🛌 {appt.restPeriod}
              </span>
            )}
            {appt.treatment && (
              <span className="text-xs px-2.5 py-1 bg-teal-500/15 border border-teal-400/30 text-teal-300 rounded-full">
                💊 {appt.treatment}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {!isPast && (
          <button
            onClick={() => onReschedule(appt)}
            className="flex-shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            ✏️ Reschedule
          </button>
        )}
      </div>
    </div>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/injuries', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const withAppts = data.filter((i) => i.appointmentDate);
          setAppointments(withAppts);
        } else {
          console.error("Failed to fetch appointments");
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
    setAppointments((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    setRescheduleTarget(null);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = appointments
    .filter((a) => new Date(a.appointmentDate) >= today)
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const past = appointments
    .filter((a) => new Date(a.appointmentDate) < today)
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

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
          <h2 className="text-2xl font-bold text-white">📅 Medical Appointments</h2>
          <p className="text-white/50 text-sm mt-1">Scheduled appointments for injured students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-500/15 border border-blue-400/30 rounded-3xl p-5 text-center shadow-xl">
            <p className="text-blue-300/70 text-xs uppercase tracking-widest mb-1">Total</p>
            <p className="text-4xl font-black text-blue-300">{appointments.length}</p>
          </div>
          <div className="bg-green-500/15 border border-green-400/30 rounded-3xl p-5 text-center shadow-xl">
            <p className="text-green-300/70 text-xs uppercase tracking-widest mb-1">Upcoming</p>
            <p className="text-4xl font-black text-green-300">{upcoming.length}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-3xl p-5 text-center shadow-xl">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Past</p>
            <p className="text-4xl font-black text-white">{past.length}</p>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📌 Upcoming Appointments
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{upcoming.length}</span>
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-white/30 text-center py-8">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <AppointmentCard key={a._id} appt={a} isPast={false} onReschedule={setRescheduleTarget} />
              ))}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white/60 mb-4 flex items-center gap-2">
              🕐 Past Appointments
              <span className="bg-white/20 text-white/60 text-xs px-2 py-0.5 rounded-full">{past.length}</span>
            </h3>
            <div className="space-y-3">
              {past.map((a) => (
                <AppointmentCard key={a._id} appt={a} isPast={true} onReschedule={setRescheduleTarget} />
              ))}
            </div>
          </div>
        )}
      </div>

      {rescheduleTarget && (
        <RescheduleModal appt={rescheduleTarget} onClose={() => setRescheduleTarget(null)} onSave={handleSave} />
      )}
    </div>
  );
}

export default Appointments;
