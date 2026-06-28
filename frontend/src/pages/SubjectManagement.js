import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import Swal from 'sweetalert2';
import bgImage from '../assets/6903344.jpg';
import LecturerSidebar from '../components/LecturerSidebar.js';
import Loader from '../components/Loader.js';
import { lecturerDelete, lecturerGet, lecturerPost, lecturerPut } from '../utils/lecturerApi';

const ALLOWED_SEMESTERS = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];
const SUBJECT_CODE_REGEX = /^[A-Z]{2,6}[0-9]{2,4}$/;

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ id: '', name: '', semester: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const result = await lecturerGet('/subjects');
      const mapped = (result.data || []).map((sub) => ({
        _id: sub._id,
        id: sub.code,
        name: sub.name,
        semester: sub.semester
      }));
      setSubjects(mapped);
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      background: '#1a1a2e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lecturerDelete(`/subjects/${id}`);
          setSubjects((prev) => prev.filter((s) => s._id !== id));
          Swal.fire({ title: 'Deleted!', text: 'Subject has been deleted.', icon: 'success', background: '#1a1a2e', color: '#fff' });
        } catch (error) {
          Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
        }
      }
    });
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();

    const normalizedCode = newSubject.id.trim().toUpperCase();
    const normalizedName = newSubject.name.trim();
    const normalizedSemester = newSubject.semester.trim().toUpperCase();

    if (!normalizedCode || !normalizedName || !normalizedSemester) {
      Swal.fire({ title: 'Error', text: 'Please fill all fields', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (!SUBJECT_CODE_REGEX.test(normalizedCode)) {
      Swal.fire({ title: 'Invalid Subject ID', text: 'Use format like IT3050', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (normalizedName.length < 3 || normalizedName.length > 100) {
      Swal.fire({ title: 'Invalid Subject Name', text: 'Name must be between 3 and 100 characters', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (!ALLOWED_SEMESTERS.includes(normalizedSemester)) {
      Swal.fire({ title: 'Invalid Semester', text: 'Please select a valid semester', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    const duplicateLocal = subjects.some(
      (subject) => subject.id.toUpperCase() === normalizedCode && subject._id !== editingSubjectId
    );

    if (duplicateLocal) {
      Swal.fire({ title: 'Duplicate Subject ID', text: 'This subject ID already exists', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    try {
      if (editingSubjectId) {
        const result = await lecturerPut(`/subjects/${editingSubjectId}`, {
          code: normalizedCode,
          name: normalizedName,
          semester: normalizedSemester
        });

        const updated = result.data;
        setSubjects((prev) => prev.map((subject) => (
          subject._id === updated._id
            ? {
                _id: updated._id,
                id: updated.code,
                name: updated.name,
                semester: updated.semester
              }
            : subject
        )));

        Swal.fire({ title: 'Success', text: 'Subject updated successfully', icon: 'success', background: '#1a1a2e', color: '#fff' });
      } else {
        const result = await lecturerPost('/subjects', {
          code: normalizedCode,
          name: normalizedName,
          semester: normalizedSemester
        });

        const created = result.data;
        setSubjects((prev) => [
          ...prev,
          {
            _id: created._id,
            id: created.code,
            name: created.name,
            semester: created.semester
          }
        ]);

        Swal.fire({ title: 'Success', text: 'Subject added successfully', icon: 'success', background: '#1a1a2e', color: '#fff' });
      }

      setNewSubject({ id: '', name: '', semester: '' });
      setEditingSubjectId(null);
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    }
  };

  const openAddModal = () => {
    setEditingSubjectId(null);
    setNewSubject({ id: '', name: '', semester: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubjectId(subject._id);
    setNewSubject({
      id: subject.id,
      name: subject.name,
      semester: subject.semester
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubjectId(null);
    setNewSubject({ id: '', name: '', semester: '' });
  };

  const filteredSubjects = subjects.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loader autoHide={false} />;
  }

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
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-poppins text-white">Subject Management</h1>
              <p className="text-white/70">Manage your assigned academic subjects</p>
            </div>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-500/30"
          >
            <Plus size={20} /> Add New Subject
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden">
          
          {/* Search Bar */}
          <div className="p-6 border-b border-white/10 bg-white/5">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="text" 
                placeholder="Search subject by ID or Name..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-white/70 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b border-white/10">Subject ID</th>
                  <th className="p-4 font-semibold border-b border-white/10">Subject Name</th>
                  <th className="p-4 font-semibold border-b border-white/10">Semester</th>
                  <th className="p-4 font-semibold border-b border-white/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredSubjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-white/5 transition">
                    <td className="p-4 py-5 font-medium text-white">{sub.id}</td>
                    <td className="p-4 py-5 text-white/80 font-semibold">{sub.name}</td>
                    <td className="p-4 py-5 text-white/70">
                      <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-lg text-sm font-semibold">{sub.semester}</span>
                    </td>
                    <td className="p-4 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          className="p-2 text-blue-400 hover:bg-white/10 rounded-lg transition"
                          title="Edit"
                          onClick={() => openEditModal(sub)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className="p-2 text-red-400 hover:bg-white/10 rounded-lg transition" 
                          title="Delete"
                          onClick={() => handleDelete(sub._id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-white/50">No subjects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingSubjectId ? 'Update Subject' : 'Add New Subject'}
            </h2>
            
            <form onSubmit={handleSaveSubject} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Subject ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. IT3050"
                  maxLength={6}
                  minLength={6}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition"
                  value={newSubject.id}
                  onChange={(e) => setNewSubject({...newSubject, id: e.target.value.replace(/\s+/g, '').toUpperCase()})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Subject Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Machine Learning"
                  maxLength={100}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Semester</label>
                <select 
                  className="w-full p-3 rounded-xl bg-[#1e1e38] border border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition"
                  value={newSubject.semester}
                  onChange={(e) => setNewSubject({...newSubject, semester: e.target.value})}
                >
                  <option value="">Select Semester</option>
                  <option value="Y1S1">Year 1 Sem 1</option>
                  <option value="Y1S2">Year 1 Sem 2</option>
                  <option value="Y2S1">Year 2 Sem 1</option>
                  <option value="Y2S2">Year 2 Sem 2</option>
                  <option value="Y3S1">Year 3 Sem 1</option>
                  <option value="Y3S2">Year 3 Sem 2</option>
                  <option value="Y4S1">Year 4 Sem 1</option>
                  <option value="Y4S2">Year 4 Sem 2</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition border border-white/10"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/30"
                >
                  {editingSubjectId ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubjectManagement;
