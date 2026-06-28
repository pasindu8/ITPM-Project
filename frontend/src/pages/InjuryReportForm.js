import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/6903344.jpg';

const SPORT_TYPES = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Athletics', 'Swimming', 'Rugby', 'Volleyball', 'Tennis', 'Other'];
const INJURY_TYPES = ['Muscle Strain', 'Ligament Sprain', 'Fracture', 'Rotator Cuff', 'Knee Injury (ACL)', 'Shin Splints', 'Tendinitis', 'Concussion', 'Back Injury', 'Other'];
const INJURY_LOCATIONS = ['Head', 'Neck', 'Shoulder', 'Upper Arm', 'Elbow', 'Forearm', 'Wrist', 'Hand', 'Chest', 'Back', 'Hip', 'Thigh', 'Knee', 'Shin', 'Ankle', 'Foot', 'Both Shins', 'Other'];

function Step({ number, label, active, done }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
        done ? 'bg-green-500 border-green-400 text-white' :
        active ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/40' :
        'bg-white/10 border-white/20 text-white/40'
      }`}>
        {done ? '✓' : number}
      </div>
      <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-blue-300' : done ? 'text-green-300' : 'text-white/30'}`}>
        {label}
      </span>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-colors";
const selectClass = "w-full bg-gray-800/80 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400 transition-colors";

function InjuryReportForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    // Step 1 — Injury Info
    sportType: '',
    injuryType: '',
    injuryLocation: '',
    dateOfInjury: '',
    // Step 2 — Student Info
    studentName: '',
    studentId: '',
    faculty: '',
    contactNumber: '',
    emergencyContact: '',
    // Step 3 — Document
    medicalDocument: null,
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});

  const fetchStudentData = async (id) => {
    if (!id.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/auth/student/${id}`, {
        headers: { Authorization: `${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          studentName: data.studentName || prev.studentName,
          faculty: data.faculty || prev.faculty,
          contactNumber: data.contactNumber || prev.contactNumber,
          emergencyContact: data.emergencyContact || prev.emergencyContact
        }));
      }
    } catch (err) {
      console.error('Error auto-filling student details:', err);
    }
  };

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.sportType) e.sportType = 'Sport type is required';
    if (!form.injuryType) e.injuryType = 'Injury type is required';
    if (!form.injuryLocation) e.injuryLocation = 'Injury location is required';
    if (!form.dateOfInjury) e.dateOfInjury = 'Date of injury is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.studentName.trim()) e.studentName = 'Student name is required';
    if (!form.studentId.trim()) e.studentId = 'Student ID is required';
    if (!form.faculty.trim()) e.faculty = 'Faculty is required';
    if (!form.contactNumber.trim()) e.contactNumber = 'Contact number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const token = localStorage.getItem('token');
      const payload = new FormData();
      payload.append('studentName', form.studentName);
      payload.append('studentId', form.studentId);
      payload.append('sportType', form.sportType);
      payload.append('injuryType', form.injuryType);
      payload.append('injuryLocation', form.injuryLocation);
      payload.append('dateOfInjury', form.dateOfInjury);
      payload.append('status', 'Under Treatment');
      payload.append('recoveryStage', 'Injured');

      if (form.medicalDocument) {
        payload.append('medicalDocument', form.medicalDocument);
      }

      const res = await fetch('http://localhost:5000/auth/injuries', {
        method: 'POST',
        headers: { 'Authorization': `${token}` },
        body: payload,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit injury report');
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit injury report');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center max-w-lg shadow-2xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-green-500/40 animate-bounce">
            ✅
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Report Submitted!</h2>
          <p className="text-white/60 mb-2 text-lg">Your injury report has been sent to:</p>
          <div className="space-y-3 mt-5 mb-8">
            {[
              { to: 'Sports Unit', desc: 'Official records updated', icon: '🏛️', color: 'border-blue-400/30 bg-blue-500/10 text-blue-300' },
              { to: 'Doctor', desc: 'Medical review initiated', icon: '🩺', color: 'border-green-400/30 bg-green-500/10 text-green-300' },
              { to: 'Coach', desc: 'Training adjustments made', icon: '🏅', color: 'border-purple-400/30 bg-purple-500/10 text-purple-300' },
            ].map((item) => (
              <div key={item.to} className={`flex items-center gap-3 p-3 rounded-2xl border ${item.color}`}>
                <span className="text-2xl">{item.icon}</span>
                <div className="text-left">
                  <p className="font-bold">{item.to}</p>
                  <p className="text-xs opacity-70">{item.desc}</p>
                </div>
                <span className="ml-auto text-green-400 font-bold">✓ Sent</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSubmitted(false); setStep(1); setForm({ sportType: '', injuryType: '', injuryLocation: '', dateOfInjury: '', studentName: '', studentId: '', faculty: '', contactNumber: '', emergencyContact: '', medicalDocument: null, additionalNotes: '' }); }}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all font-medium"
            >
              New Report
            </button>
            <button
              onClick={() => navigate('/InjuryReports')}
              className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/30"
            >
              View All Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-2xl">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">🩹 Injury Report Form</h1>
          <p className="text-white/50">Fill in the details below. The system will notify all stakeholders automatically.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Step number={1} label="Injury Info" active={step === 1} done={step > 1} />
          <div className={`flex-1 max-w-12 h-0.5 mb-5 rounded-full ${step > 1 ? 'bg-green-400' : 'bg-white/15'}`} />
          <Step number={2} label="Student Details" active={step === 2} done={step > 2} />
          <div className={`flex-1 max-w-12 h-0.5 mb-5 rounded-full ${step > 2 ? 'bg-green-400' : 'bg-white/15'}`} />
          <Step number={3} label="Document & Submit" active={step === 3} done={false} />
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* ── STEP 1: Injury Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                🏅 Step 1 — Injury Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Sport Type" required>
                  <select value={form.sportType} onChange={(e) => set('sportType', e.target.value)} className={selectClass}>
                    <option value="">Select sport...</option>
                    {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.sportType && <p className="text-red-400 text-xs mt-1">{errors.sportType}</p>}
                </FormField>

                <FormField label="Injury Type" required>
                  <select value={form.injuryType} onChange={(e) => set('injuryType', e.target.value)} className={selectClass}>
                    <option value="">Select injury type...</option>
                    {INJURY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.injuryType && <p className="text-red-400 text-xs mt-1">{errors.injuryType}</p>}
                </FormField>

                <FormField label="Injury Location" required>
                  <select value={form.injuryLocation} onChange={(e) => set('injuryLocation', e.target.value)} className={selectClass}>
                    <option value="">Select location...</option>
                    {INJURY_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.injuryLocation && <p className="text-red-400 text-xs mt-1">{errors.injuryLocation}</p>}
                </FormField>

                <FormField label="Date of Injury" required>
                  <input
                    type="date"
                    value={form.dateOfInjury}
                    min={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]} 
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => set('dateOfInjury', e.target.value)}
                    className={inputClass}
                  />
                  {errors.dateOfInjury && <p className="text-red-400 text-xs mt-1">{errors.dateOfInjury}</p>}
                </FormField>
              </div>

              {/* Preview Badge */}
              {(form.sportType || form.injuryType) && (
                <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-2xl flex gap-3 items-center flex-wrap">
                  <span className="text-blue-300/70 text-sm">Summary:</span>
                  {form.sportType && <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">🏅 {form.sportType}</span>}
                  {form.injuryType && <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">🩹 {form.injuryType}</span>}
                  {form.injuryLocation && <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">📍 {form.injuryLocation}</span>}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Student Details ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                👤 Step 2 — Student Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Full Name" required>
                  <input type="text" value={form.studentName} onChange={(e) => set('studentName', e.target.value)}
                    placeholder="e.g. Kasun Perera" className={inputClass} />
                  {errors.studentName && <p className="text-red-400 text-xs mt-1">{errors.studentName}</p>}
                </FormField>

                <FormField label="Student ID (Type & Click Outside to Auto-fill)" required>
                  <input type="text" value={form.studentId} 
                    onChange={(e) => set('studentId', e.target.value)}
                    onBlur={(e) => fetchStudentData(e.target.value)}
                    placeholder="e.g. IT23630116" className={inputClass} />
                  {errors.studentId && <p className="text-red-400 text-xs mt-1">{errors.studentId}</p>}
                </FormField>

                <FormField label="Faculty" required>
                  <input type="text" value={form.faculty} onChange={(e) => set('faculty', e.target.value)}
                    placeholder="e.g. Faculty of Engineering" className={inputClass} />
                  {errors.faculty && <p className="text-red-400 text-xs mt-1">{errors.faculty}</p>}
                </FormField>

                <FormField label="Contact Number" required>
                  <input type="tel" value={form.contactNumber} onChange={(e) => set('contactNumber', e.target.value)}
                    placeholder="e.g. 077 123 4567" className={inputClass} />
                  {errors.contactNumber && <p className="text-red-400 text-xs mt-1">{errors.contactNumber}</p>}
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Emergency Contact">
                    <input type="tel" value={form.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)}
                      placeholder="Emergency contact number" className={inputClass} />
                  </FormField>
                </div>
              </div>

              {/* Automated Workflow Info Banner */}
              <div className="p-4 bg-orange-500/10 border border-orange-400/20 rounded-2xl">
                <p className="text-orange-300 text-sm font-semibold mb-2">⚡ Automated Workflow — After Submission:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: '🏛️', label: 'Sports Unit', desc: 'Records updated' },
                    { icon: '🩺', label: 'Doctor', desc: 'Review initiated' },
                    { icon: '🏅', label: 'Coach', desc: 'Training adjusted' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-lg">{item.icon}</p>
                      <p className="text-white text-xs font-semibold">{item.label}</p>
                      <p className="text-white/40 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Document & Submit ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                📄 Step 3 — Upload Document & Submit
              </h3>

              {/* Document Upload */}
              <FormField label="Medical Document (Optional)">
                <div
                  className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400/50 hover:bg-blue-500/5 transition-all"
                  onClick={() => document.getElementById('docInput').click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) set('medicalDocument', f); }}
                >
                  {form.medicalDocument ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📄</span>
                      <p className="text-green-300 font-semibold">{form.medicalDocument.name}</p>
                      <p className="text-white/40 text-xs">{(form.medicalDocument.size / 1024).toFixed(1)} KB</p>
                      <button onClick={(e) => { e.stopPropagation(); set('medicalDocument', null); }} className="text-red-400 text-xs hover:underline mt-1">Remove</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl text-white/30">☁️</span>
                      <p className="text-white/50 font-medium">Drag & drop or click to upload</p>
                      <p className="text-white/30 text-xs">PDF, JPG, PNG — Max 10 MB</p>
                    </div>
                  )}
                  <input id="docInput" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => set('medicalDocument', e.target.files[0])} />
                </div>
              </FormField>

              {/* Additional Notes */}
              <FormField label="Additional Notes">
                <textarea
                  value={form.additionalNotes}
                  onChange={(e) => set('additionalNotes', e.target.value)}
                  rows={3}
                  placeholder="Any additional details about the injury or circumstances..."
                  className={`${inputClass} resize-none`}
                />
              </FormField>

              {/* Summary Review */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <p className="text-white font-bold text-sm uppercase tracking-wide mb-3">📋 Report Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: 'Sport', value: form.sportType },
                    { label: 'Injury', value: form.injuryType },
                    { label: 'Location', value: form.injuryLocation },
                    { label: 'Date', value: form.dateOfInjury ? new Date(form.dateOfInjury).toLocaleDateString() : '' },
                    { label: 'Student', value: form.studentName },
                    { label: 'Student ID', value: form.studentId },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="flex flex-col">
                      <p className="text-white/40 text-xs">{label}</p>
                      <p className="text-white font-medium">{value}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all font-medium">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext}
                className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/30">
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '⏳ Submitting...' : '✅ Submit Report'}
              </button>
            )}
          </div>

          {submitError && (
            <p className="text-red-400 text-sm mt-3 text-center">{submitError}</p>
          )}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/30 text-xs mt-5">
          🔒 Secure cloud storage · 📱 Accessible from any device · ⚡ Instant notifications
        </p>
      </div>
    </div>
  );
}

export default InjuryReportForm;
