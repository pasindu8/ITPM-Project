import React, { useEffect, useState } from 'react';
import { Users, Filter, Save, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import bgImage from '../assets/6903344.jpg';
import LecturerSidebar from '../components/LecturerSidebar.js';
import Loader from '../components/Loader.js';
import { lecturerGet, lecturerPut } from '../utils/lecturerApi';

const StudentMarks = () => {
  const [subject, setSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setPageLoading(true);
        const result = await lecturerGet('/subjects');
        setSubjects(result.data || []);
      } catch (error) {
        Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
      } finally {
        setPageLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    setStudents([]);
  }, [subject]);

  if (pageLoading) {
    return <Loader autoHide={false} />;
  }

  const handleMarkChange = (id, field, newMark) => {
    setStudents((prev) => prev.map((s) => (
      s.id === id ? { ...s, [field]: newMark } : s
    )));
  };

  const getAverage = (student) => {
    const values = [student.assignmentMark, student.vivaMark, student.presentationMark]
      .filter((value) => value !== '' && value !== null && value !== undefined)
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value));

    if (!values.length) {
      return null;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return (total / values.length).toFixed(1);
  };

  const handleLoadStudents = async () => {
    if (!subject) {
      Swal.fire({ title: 'Error', text: 'Please select a subject first.', icon: 'warning', background: '#1a1a2e', color: '#fff' });
      return;
    }

    try {
      setLoading(true);

      const [studentsResult, marksResult] = await Promise.all([
        lecturerGet('/students', { subjectCode: subject }),
        lecturerGet('/marks', { subjectCode: subject })
      ]);

      const markMap = new Map(
        (marksResult.data || []).map((row) => [
          String(row.studentId),
          {
            assignmentMark: row.assignmentMark ?? '',
            vivaMark: row.vivaMark ?? '',
            presentationMark: row.presentationMark ?? ''
          }
        ])
      );

      const mergedRows = (studentsResult.data || []).map((student) => ({
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        subjectCode: subject,
        assignmentMark: markMap.get(String(student._id))?.assignmentMark ?? '',
        vivaMark: markMap.get(String(student._id))?.vivaMark ?? '',
        presentationMark: markMap.get(String(student._id))?.presentationMark ?? ''
      }));

      setStudents(mergedRows);
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarks = async () => {
    if (!subject) {
      Swal.fire({ title: 'Error', text: 'Please select a subject first.', icon: 'warning', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (!students.length) {
      Swal.fire({ title: 'Error', text: 'Please load students first.', icon: 'warning', background: '#1a1a2e', color: '#fff' });
      return;
    }

    try {
      setLoading(true);

      const invalidMark = students.find((student) => {
        const values = [student.assignmentMark, student.vivaMark, student.presentationMark];
        return values.some((value) => {
          if (value === '' || value === null || value === undefined) {
            return false;
          }

          const parsed = Number(value);
          return Number.isNaN(parsed) || parsed < 0 || parsed > 100;
        });
      });

      if (invalidMark) {
        Swal.fire({ title: 'Invalid Marks', text: `Please check marks for ${invalidMark.studentId}. Values must be between 0 and 100.`, icon: 'warning', background: '#1a1a2e', color: '#fff' });
        setLoading(false);
        return;
      }

      await lecturerPut('/marks/bulk', {
        subjectCode: subject,
        marks: students.map((student) => ({
          studentId: student.id,
          assignmentMark: student.assignmentMark,
          vivaMark: student.vivaMark,
          presentationMark: student.presentationMark
        }))
      });

      Swal.fire({
        icon: 'success',
        title: 'Marks Saved!',
        text: 'Student marks have been successfully updated in the system.',
        background: '#1a1a2e',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });

      await handleLoadStudents();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    } finally {
      setLoading(false);
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
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="p-3 bg-white/20 rounded-xl shadow-inner text-white">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-poppins text-white">Student Progress & Marks</h1>
              <p className="text-white/70">Update grades for assignments, vivas, and presentations</p>
            </div>
          </div>
        </div>

        {/* Filter Area */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-white/80 mb-2">Subject</label>
            <select 
              className="w-full p-3 rounded-xl bg-[#1e1e38] border border-white/20 text-white focus:border-purple-400 outline-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Select Subject...</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleLoadStudents}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/10 px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto h-[46px]"
            >
              <Filter size={18} /> Load Students
            </button>
          </div>
        </div>

        {/* Marks Table */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white/60 flex flex-col items-center justify-center h-full">
              <Users size={64} className="mb-4 text-white/20" />
              <p>Loading students...</p>
            </div>
          ) : (!subject || !students.length) ? (
            <div className="p-12 text-center text-white/50 flex flex-col items-center justify-center h-full">
              <Users size={64} className="mb-4 text-white/20" />
              <p>Please select a Subject, then click Load Students.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1 p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-white/70 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b border-white/10">Student ID</th>
                      <th className="p-4 font-semibold border-b border-white/10">Subject ID</th>
                      <th className="p-4 font-semibold border-b border-white/10">Student Name</th>
                      <th className="p-4 font-semibold border-b border-white/10 text-right">Assignment</th>
                      <th className="p-4 font-semibold border-b border-white/10 text-right">Viva</th>
                      <th className="p-4 font-semibold border-b border-white/10 text-right">Presentation</th>
                      <th className="p-4 font-semibold border-b border-white/10 text-center">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-white/5 transition">
                        <td className="p-4 py-4 font-medium text-white">{student.studentId}</td>
                        <td className="p-4 py-4 text-white/80">{student.subjectCode}</td>
                        <td className="p-4 py-4 text-white/80 font-semibold">{student.name}</td>

                        <td className="p-4 py-4 text-right">
                          <input 
                            type="number" 
                            min="0" max="100"
                            placeholder="-"
                            className={`w-24 p-2 text-center rounded-lg border font-bold outline-none focus:ring-2 ${
                              student.assignmentMark !== ''
                                ? 'bg-green-500/10 border-green-500/40 text-green-300 focus:border-green-400 focus:ring-green-400/30'
                                : 'bg-white/10 border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/30'
                            }`}
                            value={student.assignmentMark}
                            onChange={(e) => handleMarkChange(student.id, 'assignmentMark', e.target.value)}
                          />
                        </td>
                        <td className="p-4 py-4 text-right">
                          <input 
                            type="number" 
                            min="0" max="100"
                            placeholder="-"
                            className={`w-24 p-2 text-center rounded-lg border font-bold outline-none focus:ring-2 ${
                              student.vivaMark !== '' 
                                ? 'bg-green-500/10 border-green-500/40 text-green-300 focus:border-green-400 focus:ring-green-400/30' 
                                : 'bg-white/10 border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/30'
                            }`}
                            value={student.vivaMark}
                            onChange={(e) => handleMarkChange(student.id, 'vivaMark', e.target.value)}
                          />
                        </td>

                        <td className="p-4 py-4 text-right">
                          <input 
                            type="number" 
                            min="0" max="100"
                            placeholder="-"
                            className={`w-24 p-2 text-center rounded-lg border font-bold outline-none focus:ring-2 ${
                              student.presentationMark !== ''
                                ? 'bg-green-500/10 border-green-500/40 text-green-300 focus:border-green-400 focus:ring-green-400/30'
                                : 'bg-white/10 border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/30'
                            }`}
                            value={student.presentationMark}
                            onChange={(e) => handleMarkChange(student.id, 'presentationMark', e.target.value)}
                          />
                        </td>

                        <td className="p-4 py-4 text-center">
                          {getAverage(student) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold">
                              <CheckCircle size={12} /> Avg {getAverage(student)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end">
                <button 
                  onClick={handleSaveMarks}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/30 text-white px-8 py-3 rounded-xl font-semibold transition"
                >
                  <Save size={20} /> Save All Marks
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentMarks;
