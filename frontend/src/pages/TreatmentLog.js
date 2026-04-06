import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';



function TreatmentLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ student: '', date: '', note: '', type: 'Review' });

  // Fetch all treatment logs on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/auth/treatment-logs', {
          headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        } else {
          console.error("Failed to fetch treatment logs");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.date || !form.note) return;

    setSubmitting(true);

    // Optimistic UI — add to top of list immediately
    const tempId = `temp-${Date.now()}`;
    const localEntry = { _id: tempId, ...form };
    setLogs((prev) => [localEntry, ...prev]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/auth/treatment-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const saved = await res.json();
        // Replace temp entry with real saved one
        setLogs((prev) => prev.map((l) => (l._id === tempId ? saved : l)));
      }
    } catch {
      // Keep the optimistic entry even if request fails
    } finally {
      setSubmitting(false);
      setForm({ student: '', date: '', note: '', type: 'Review' });
    }
  };

  const typeColor = {
    Review:     'bg-blue-500/20 border-blue-400/30 text-blue-300',
    Therapy:    'bg-purple-500/20 border-purple-400/30 text-purple-300',
    Medication: 'bg-teal-500/20 border-teal-400/30 text-teal-300',
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <DoctorSidebar />

      <div className="flex-1 flex flex-col gap-4 overflow-auto">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white">Treatment Log</h2>
          <p className="text-white/60 text-sm mt-1">Document treatment sessions and clinical notes.</p>
        </div>

        {/* Add new log form */}
        <form
          onSubmit={onSubmit}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <input
            value={form.student}
            onChange={(e) => setForm({ ...form, student: e.target.value })}
            placeholder="Student name"
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-gray-800 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="Review">Review</option>
            <option value="Therapy">Therapy</option>
            <option value="Medication">Medication</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-400 rounded-xl px-4 py-2.5 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? '⏳ Saving...' : '+ Add Log Entry'}
          </button>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Treatment note"
            rows={3}
            className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 resize-none"
          />
        </form>

        {/* Log entries */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-xl">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-white/30 py-12">
              <div className="text-4xl mb-3">📝</div>
              No treatment logs yet
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div key={log._id} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                    <p className="text-white font-semibold">{log.student}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${typeColor[log.type] || typeColor.Review}`}>
                        {log.type}
                      </span>
                      <p className="text-white/60 text-xs">{log.date}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mt-2 leading-relaxed">{log.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TreatmentLog;
