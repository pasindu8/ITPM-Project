import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';
import bgImage from '../assets/6903344.jpg';
import LecturerSidebar from '../components/LecturerSidebar.js';
import Loader from '../components/Loader.js';
import { lecturerGet, lecturerPost } from '../utils/lecturerApi';

const LecturerScheduleAndConflicts = () => {
  const [scheduleData, setScheduleData] = useState({
    title: '',
    subject: '',
    type: 'viva',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchScheduleData = async () => {
    try {
      setLoadingSchedules(true);
      const [subjectsResult, schedulesResult] = await Promise.all([
        lecturerGet('/subjects'),
        lecturerGet('/schedules')
      ]);

      setSubjects(subjectsResult.data || []);
      setSchedules(schedulesResult.data || []);
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    } finally {
      setLoadingSchedules(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  if (pageLoading) {
    return <Loader autoHide={false} />;
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduleData.title || !scheduleData.date || !scheduleData.startTime || !scheduleData.endTime) {
      Swal.fire({ title: 'Error', text: 'Please fill all required fields', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    try {
      const result = await lecturerPost('/schedules', {
        title: scheduleData.title,
        subjectCode: scheduleData.subject,
        type: scheduleData.type,
        date: scheduleData.date,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime
      });

      const saved = result.data;

      if (saved.status === 'Conflict') {
        const conflictLines = (saved.conflicts || [])
          .slice(0, 3)
          .map((conflict) => `• ${conflict.label} (${conflict.startTime} - ${conflict.endTime})`)
          .join('<br/>');

        Swal.fire({
          title: '⚠️ Conflict Detected!',
          html: `This event has conflicts:<br/><br/>${conflictLines || 'Conflicting activities found.'}`,
          icon: 'warning',
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        });
      } else {
        Swal.fire({
          title: 'Successfully Scheduled!',
          text: `Your ${scheduleData.type} has been scheduled with zero conflicts.`,
          icon: 'success',
          background: '#1a1a2e',
          color: '#fff',
          confirmButtonColor: '#10b981'
        });
      }

      setScheduleData({ title: '', subject: '', type: 'viva', date: '', startTime: '', endTime: '' });
      fetchScheduleData();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    }
  };

  return (
    <div 
        className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
        style={{ backgroundImage: `url(${bgImage})` }}
    >
      <LecturerSidebar />
      <div className="flex-1 flex flex-col gap-4 overflow-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500/80 to-rose-600/80 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-white shadow-xl mb-2 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-poppins flex items-center gap-3">
               <ShieldAlert size={32} /> Smart Scheduling
            </h1>
            <p className="text-rose-100 mt-2 max-w-lg leading-relaxed text-sm">
              Schedule academic events with confidence. Our system automatically checks against student sports practices, practical sessions, and matches to prevent timetable conflicts.
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-3xl hidden md:block border border-white/30 shadow-inner">
            <CalendarIcon size={48} className="text-white opacity-90" />
          </div>
        </div>

        {/* Form area */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-8 flex-1">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
            Create Schedule Entry
          </h2>
          
          <form onSubmit={handleScheduleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/80 mb-2">Event Title</label>
                <input 
                  type="text" required placeholder="e.g. SE Assignment 2 Viva"
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 outline-none transition"
                  value={scheduleData.title}
                  onChange={(e) => setScheduleData({...scheduleData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Subject</label>
                <select required
                  className="w-full p-4 rounded-xl bg-[#1e1e38] border border-white/20 text-white focus:border-rose-400 outline-none"
                  value={scheduleData.subject}
                  onChange={(e) => setScheduleData({...scheduleData, subject: e.target.value})}
                >
                  <option value="">Select... </option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Event Type</label>
                <select 
                  className="w-full p-4 rounded-xl bg-[#1e1e38] border border-white/20 text-white focus:border-rose-400 outline-none"
                  value={scheduleData.type}
                  onChange={(e) => setScheduleData({...scheduleData, type: e.target.value})}
                >
                  <option value="viva">Viva Session</option>
                  <option value="presentation">Presentation</option>
                  <option value="exam">Practical Exam</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 mt-6">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-1.5"><CalendarIcon size={16}/> Date</label>
                <input
                  type="date"
                  required
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none"
                  value={scheduleData.date}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-1.5"><Clock size={16}/> Start Time</label>
                <input 
                  type="time" required
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none"
                  value={scheduleData.startTime}
                  onChange={(e) => setScheduleData({...scheduleData, startTime: e.target.value})}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-1.5"><Clock size={16}/> End Time</label>
                <input 
                  type="time" required
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none"
                  value={scheduleData.endTime}
                  onChange={(e) => setScheduleData({...scheduleData, endTime: e.target.value})}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-0.5">
                <CheckCircle2 size={20} /> Verify & Schedule Event
              </button>
            </div>
          </form>

          {/* Helper Note for testing */}
          <div className="mt-8 bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl text-sm flex gap-3 text-blue-100 font-medium items-center">
            <AlertTriangle size={20} className="text-blue-400 flex-shrink-0" />
            <p>
              <b>Smart Tip:</b> Conflict checks now run against existing academic schedules, training sessions, and previously saved lecturer events.
            </p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Saved Schedule Entries</h3>
            {loadingSchedules ? (
              <p className="text-white/60">Loading schedules...</p>
            ) : schedules.length === 0 ? (
              <p className="text-white/50">No schedule entries yet.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {schedules.map((entry) => (
                  <div key={entry._id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold">{entry.title} ({entry.subjectCode})</p>
                      <p className="text-white/60 text-sm">{new Date(entry.date).toLocaleDateString()} | {entry.startTime} - {entry.endTime}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md w-fit ${entry.status === 'Conflict' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default LecturerScheduleAndConflicts;
