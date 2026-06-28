import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';


const VALID_TYPES = ['Review', 'Therapy', 'Medication'];


function TreatmentLog() {
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ student: '', studentId: '', date: '', note: '', type: 'Review' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSubmitError('');
  };

  const validateForm = () => {
    const nextErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!form.studentId) {
      nextErrors.studentId = 'Please select a student';
    }

    if (!form.date) {
      nextErrors.date = 'Date is required';
    } else if (form.date > today) {
      nextErrors.date = 'Date cannot be in the future';
    }

    const trimmedNote = form.note.trim();
    if (!trimmedNote) {
      nextErrors.note = 'Treatment note is required';
    } else if (trimmedNote.length < 3) {
      nextErrors.note = 'Treatment note must be at least 3 characters';
    } else if (trimmedNote.length > 1000) {
      nextErrors.note = 'Treatment note is too long (max 1000 characters)';
    }

    if (!VALID_TYPES.includes(form.type)) {
      nextErrors.type = 'Invalid treatment type';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Fetch logs and available student list on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [logsRes, studentsRes] = await Promise.all([
          fetch('http://localhost:5000/auth/treatment-logs', {
            headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
          }),
          fetch('http://localhost:5000/auth/medical-profiles', {
            headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
          }),
        ]);

        if (logsRes.ok) {
          const data = await logsRes.json();
          setLogs(data);
        } else {
          console.error('Failed to fetch treatment logs');
        }

        if (studentsRes.ok) {
          const profiles = await studentsRes.json();
          const options = (profiles || [])
            .filter((p) => p?.id && p?.name)
            .map((p) => ({ id: p.id, name: p.name }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setStudents(options);
        } else {
          console.error('Failed to fetch students for treatment log');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      student: form.student,
      studentId: form.studentId,
      date: form.date,
      type: form.type,
      note: form.note.trim(),
    };

    // Optimistic UI — add to top of list immediately
    const tempId = `temp-${Date.now()}`;
    const localEntry = { _id: tempId, ...payload };
    setLogs((prev) => [localEntry, ...prev]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/auth/treatment-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save treatment log');
      }

      const saved = await res.json();
      // Replace temp entry with real saved one
      setLogs((prev) => prev.map((l) => (l._id === tempId ? saved : l)));
      setForm({ student: '', studentId: '', date: '', note: '', type: 'Review' });
      setErrors({});
    } catch (error) {
      // Roll back optimistic entry on failure
      setLogs((prev) => prev.filter((l) => l._id !== tempId));
      setSubmitError(error.message || 'Failed to save treatment log');
    } finally {
      setSubmitting(false);
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
          <div>
            <select
              value={form.studentId}
              onChange={(e) => {
                const selected = students.find((s) => s.id === e.target.value);
                setField('studentId', e.target.value);
                setField('student', selected ? selected.name : '');
              }}
              className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
            {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId}</p>}
          </div>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400"
          />
          {errors.date && <p className="md:col-span-2 text-red-400 text-xs -mt-2">{errors.date}</p>}

          <div>
            <select
              value={form.type}
              onChange={(e) => setField('type', e.target.value)}
              className="w-full bg-gray-800 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400"
            >
              <option value="Review">Review</option>
              <option value="Therapy">Therapy</option>
              <option value="Medication">Medication</option>
            </select>
            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || students.length === 0}
            className="bg-blue-500 hover:bg-blue-400 rounded-xl px-4 py-2.5 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? '⏳ Saving...' : '+ Add Log Entry'}
          </button>

          <textarea
            value={form.note}
            onChange={(e) => setField('note', e.target.value)}
            placeholder="Treatment note"
            rows={3}
            maxLength={1000}
            className="md:col-span-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 resize-none"
          />
          {errors.note && <p className="md:col-span-2 text-red-400 text-xs -mt-2">{errors.note}</p>}
          {submitError && <p className="md:col-span-2 text-red-400 text-sm">{submitError}</p>}
          {students.length === 0 && (
            <p className="md:col-span-2 text-amber-300 text-sm">No students available to log treatment at the moment.</p>
          )}
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
                    <div>
                      <p className="text-white font-semibold">{log.student}</p>
                      {log.studentId && <p className="text-white/40 text-xs">{log.studentId}</p>}
                    </div>
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
