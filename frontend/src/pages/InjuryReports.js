import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import DoctorSidebar from '../components/DoctorSidebar';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';


const statusConfig = {
  'Under Treatment': { color: 'bg-red-500/20 text-red-300 border-red-400/40', dot: 'bg-red-400', icon: '🔴' },
  'Recovering': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40', dot: 'bg-yellow-400', icon: '🟡' },
  'Not Fit to Play': { color: 'bg-orange-500/20 text-orange-300 border-orange-400/40', dot: 'bg-orange-400', icon: '🟠' },
  'Fully Recovered': { color: 'bg-green-500/20 text-green-300 border-green-400/40', dot: 'bg-green-400', icon: '🟢' },
};



function DetailModal({ injury, onClose, onEdit, onDelete }) {
  if (!injury) return null;
  const cfg = statusConfig[injury.status] || statusConfig['Under Treatment'];
  const hasDocument = Boolean(injury.medicalDocument);
  const documentUrl = hasDocument
    ? (injury.medicalDocument.startsWith('http')
        ? injury.medicalDocument
        : `http://localhost:5000${injury.medicalDocument.startsWith('/') ? '' : '/'}${injury.medicalDocument}`)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 border border-white/20 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">📋 Injury Report Details</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">✕</button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xl font-bold">{injury.studentName}</p>
              <p className="text-white/50 text-sm">{injury.studentId}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
              {cfg.icon} {injury.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sport', value: injury.sportType, icon: '🏅' },
              { label: 'Injury Type', value: injury.injuryType, icon: '🩹' },
              { label: 'Location', value: injury.injuryLocation, icon: '📍' },
              { label: 'Date', value: new Date(injury.dateOfInjury).toLocaleDateString(), icon: '📆' },
              { label: 'Rest Period', value: injury.restPeriod || '—', icon: '🛌' },
              { label: 'Treatment', value: injury.treatment || '—', icon: '💊' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-white/50 text-xs mb-1">{icon} {label}</p>
                <p className="text-white font-medium text-sm">{value}</p>
              </div>
            ))}
          </div>

          {injury.medicalNotes && (
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-400/20">
              <p className="text-blue-300/70 text-xs uppercase tracking-wide mb-2">📝 Medical Notes</p>
              <p className="text-white/80 text-sm leading-relaxed">{injury.medicalNotes}</p>
            </div>
          )}

          <div className={`flex items-center gap-3 p-3 rounded-xl ${hasDocument ? 'bg-green-500/10 border border-green-400/20' : 'bg-white/5 border border-white/10'}`}>
            <span className="text-2xl">{hasDocument ? '📄' : '📭'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs mb-0.5">Medical Document</p>
              <p className={`text-sm font-medium break-all ${hasDocument ? 'text-green-300' : 'text-white/30'}`}>
                {injury.medicalDocument || 'No document uploaded'}
              </p>
            </div>
            {hasDocument && (
              <button
                type="button"
                onClick={() => window.open(documentUrl, '_blank', 'noopener,noreferrer')}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/35 border border-green-400/40 text-green-200 text-xs font-semibold whitespace-nowrap transition-all"
              >
                View File
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onEdit(injury)}
            className="py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/35 text-blue-200 font-semibold transition-all border border-blue-400/30"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(injury._id)}
            className="py-3 rounded-xl bg-red-500/20 hover:bg-red-500/35 text-red-200 font-semibold transition-all border border-red-400/30"
          >
            Delete
          </button>
          <button onClick={onClose} className="py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/20">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ form, setForm, onClose, onSave, saving }) {
  if (!form) return null;

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400';
  const statusOptions = ['Under Treatment', 'Recovering', 'Not Fit to Play', 'Fully Recovered'];
  const recoveryOptions = ['Injured', 'Treatment', 'Light Training', 'Fully Fit'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900/95 border border-white/20 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white">✏️ Edit Injury Report</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-white/70 text-xs mb-1">Student Name</p>
            <input className={inputClass} value={form.studentName || ''} onChange={(e) => setForm((p) => ({ ...p, studentName: e.target.value }))} />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Student ID</p>
            <input className={inputClass} value={form.studentId || ''} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Sport</p>
            <input className={inputClass} value={form.sportType || ''} onChange={(e) => setForm((p) => ({ ...p, sportType: e.target.value }))} />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Injury Type</p>
            <input className={inputClass} value={form.injuryType || ''} onChange={(e) => setForm((p) => ({ ...p, injuryType: e.target.value }))} />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Location</p>
            <input className={inputClass} value={form.injuryLocation || ''} onChange={(e) => setForm((p) => ({ ...p, injuryLocation: e.target.value }))} />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Date of Injury</p>
            <input type="date" className={inputClass} value={form.dateOfInjury || ''} onChange={(e) => setForm((p) => ({ ...p, dateOfInjury: e.target.value }))} />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Status</p>
            <select className={inputClass} value={form.status || 'Under Treatment'} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Recovery Stage</p>
            <select className={inputClass} value={form.recoveryStage || 'Injured'} onChange={(e) => setForm((p) => ({ ...p, recoveryStage: e.target.value }))}>
              {recoveryOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Rest Period</p>
            <input className={inputClass} value={form.restPeriod || ''} onChange={(e) => setForm((p) => ({ ...p, restPeriod: e.target.value }))} placeholder="e.g. 2 weeks" />
          </div>
          <div>
            <p className="text-white/70 text-xs mb-1">Treatment</p>
            <input className={inputClass} value={form.treatment || ''} onChange={(e) => setForm((p) => ({ ...p, treatment: e.target.value }))} placeholder="e.g. Physiotherapy" />
          </div>
          <div className="md:col-span-2">
            <p className="text-white/70 text-xs mb-1">Medical Notes</p>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={form.medicalNotes || ''}
              onChange={(e) => setForm((p) => ({ ...p, medicalNotes: e.target.value }))}
              placeholder="Doctor notes"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button onClick={onClose} className="py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/20">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all border border-blue-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InjuryReports() {
  const navigate = useNavigate();
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchInjuries = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/auth/injuries', {
        headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInjuries(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setActionError(errorData.message || 'Failed to fetch injuries');
      }
    } catch (err) {
      setActionError('Failed to fetch injuries');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchInjuries(true);
  }, []);

  const openEditModal = (inj) => {
    setActionError('');
    setActionMessage('');
    setEditing({
      ...inj,
      dateOfInjury: inj.dateOfInjury ? new Date(inj.dateOfInjury).toISOString().split('T')[0] : '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;

    if (!editing.studentName?.trim() || !editing.studentId?.trim() || !editing.sportType?.trim() || !editing.injuryType?.trim() || !editing.injuryLocation?.trim() || !editing.dateOfInjury) {
      setActionError('Please fill all required fields before saving.');
      return;
    }

    setSaving(true);
    setActionError('');
    setActionMessage('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        studentName: editing.studentName,
        studentId: editing.studentId,
        sportType: editing.sportType,
        injuryType: editing.injuryType,
        injuryLocation: editing.injuryLocation,
        dateOfInjury: editing.dateOfInjury,
        status: editing.status,
        recoveryStage: editing.recoveryStage,
        restPeriod: editing.restPeriod || '',
        treatment: editing.treatment || '',
        medicalNotes: editing.medicalNotes || '',
      };

      const res = await fetch(`http://localhost:5000/auth/injuries/${editing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update report');
      }

      const updated = await res.json();
      setInjuries((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setSelected((prev) => (prev && prev._id === updated._id ? updated : prev));
      setEditing(null);
      setActionMessage('Injury report updated successfully.');
    } catch (err) {
      setActionError(err.message || 'Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (injuryId) => {
    const confirmed = window.confirm('Are you sure you want to delete this injury report?');
    if (!confirmed) return;

    setActionError('');
    setActionMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/auth/injuries/${injuryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete report');
      }

      setInjuries((prev) => prev.filter((item) => item._id !== injuryId));
      setSelected((prev) => (prev && prev._id === injuryId ? null : prev));
      setEditing((prev) => (prev && prev._id === injuryId ? null : prev));
      setActionMessage('Injury report deleted successfully.');
    } catch (err) {
      setActionError(err.message || 'Failed to delete report');
    }
  };

  const filtered = injuries.filter((inj) => {
    const matchStatus = statusFilter === 'all' || inj.status === statusFilter;
    const matchSearch =
      !search ||
      inj.studentName.toLowerCase().includes(search.toLowerCase()) ||
      inj.injuryType.toLowerCase().includes(search.toLowerCase()) ||
      inj.sportType.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  function handleAddInjury() {
    navigate('/InjuryReportForm');
  }

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
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl grid grid-cols-2 gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">📋 Injury Reports</h2>
            <p className="text-white/50 text-sm mt-1 pl-2">All submitted injury reports from students and sports officers</p>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={handleAddInjury} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl">Add Injury Report</button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([status, cfg]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`rounded-3xl p-5 text-center shadow-xl transition-all hover:scale-105 border ${statusFilter === status ? 'ring-2 ring-blue-400' : ''
                } ${cfg.color}`}
            >
              <p className="text-xs uppercase tracking-widest mb-1 opacity-70">{status}</p>
              <p className="text-3xl font-black">{injuries.filter((i) => i.status === status).length}</p>
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="🔍  Search by name, sport, or injury..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 w-full"
          />
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); }}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-medium transition-all border border-white/20 whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>

        {(actionMessage || actionError) && (
          <div className={`rounded-2xl px-4 py-3 border ${actionError ? 'bg-red-500/10 border-red-400/30 text-red-200' : 'bg-green-500/10 border-green-400/30 text-green-200'}`}>
            {actionError || actionMessage}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl overflow-x-auto">
          <p className="text-white/60 text-sm mb-4">Showing {filtered.length} of {injuries.length} reports</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/50 uppercase text-xs tracking-widest border-b border-white/10">
                <th className="text-left pb-3 pr-4">Student</th>
                <th className="text-left pb-3 pr-4">Sport</th>
                <th className="text-left pb-3 pr-4">Injury</th>
                <th className="text-left pb-3 pr-4">Location</th>
                <th className="text-left pb-3 pr-4">Date</th>
                <th className="text-left pb-3 pr-4">Status</th>
                <th className="text-left pb-3 pr-4">Doc</th>
                <th className="text-left pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-white/30 py-12 text-base">
                    <div className="text-4xl mb-3">📭</div>
                    No reports found
                  </td>
                </tr>
              ) : filtered.map((inj) => {
                const cfg = statusConfig[inj.status] || statusConfig['Under Treatment'];
                return (
                  <tr key={inj._id} className="hover:bg-white/5 transition-all">
                    <td className="py-4 pr-4">
                      <p className="text-white font-semibold">{inj.studentName}</p>
                      <p className="text-white/40 text-xs">{inj.studentId}</p>
                    </td>
                    <td className="py-4 pr-4 text-white/70">{inj.sportType}</td>
                    <td className="py-4 pr-4 text-white/70">{inj.injuryType}</td>
                    <td className="py-4 pr-4 text-white/70">{inj.injuryLocation}</td>
                    <td className="py-4 pr-4 text-white/70">{new Date(inj.dateOfInjury).toLocaleDateString()}</td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                        {cfg.icon} {inj.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {inj.medicalDocument
                        ? <span className="text-green-400 font-bold" title={inj.medicalDocument}>✅</span>
                        : <span className="text-white/20">—</span>}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelected(inj)}
                          title="View"
                          aria-label="View"
                          className="w-9 h-9 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 text-blue-300 hover:text-white rounded-xl transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(inj)}
                          title="Edit"
                          aria-label="Edit"
                          className="w-9 h-9 flex items-center justify-center bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/30 text-amber-300 hover:text-white rounded-xl transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(inj._id)}
                          title="Delete"
                          aria-label="Delete"
                          className="w-9 h-9 flex items-center justify-center bg-red-500/20 hover:bg-red-500/35 border border-red-400/30 text-red-300 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <DetailModal
          injury={selected}
          onClose={() => setSelected(null)}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      {editing && (
        <EditModal
          form={editing}
          setForm={setEditing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
          saving={saving}
        />
      )}
    </div>
  );
}

export default InjuryReports;
