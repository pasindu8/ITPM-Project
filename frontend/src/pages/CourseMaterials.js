import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UploadCloud, FileText, CheckSquare, Presentation, Calendar, Trash2, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import bgImage from '../assets/6903344.jpg';
import LecturerSidebar from '../components/LecturerSidebar.js';
import Loader from '../components/Loader.js';
import { lecturerDelete, lecturerGet, lecturerPostFormData } from '../utils/lecturerApi';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'image/png',
  'image/jpeg'
]);

const CourseMaterials = () => {
  const [activeTab, setActiveTab] = useState('notes');
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [newUpload, setNewUpload] = useState({ title: '', subject: '', type: 'notes', deadline: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsResult, subjectsResult] = await Promise.all([
        lecturerGet('/materials'),
        lecturerGet('/subjects')
      ]);

      setMaterials(materialsResult.data || []);
      setSubjects(subjectsResult.data || []);
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setNewUpload({ title: '', subject: '', type: 'notes', deadline: '' });
    setSelectedFile(null);
  };

  const openUploadModal = () => {
    setUploadModalOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Material?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      background: '#1a1a2e',
      color: '#fff',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Delete'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await lecturerDelete(`/materials/${id}`);
          setMaterials((prev) => prev.filter((m) => m._id !== id));
          Swal.fire({ title: 'Deleted!', text: 'The material has been deleted.', icon: 'success', background: '#1a1a2e', color: '#fff' });
        } catch (error) {
          Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
        }
      }
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    const normalizedTitle = newUpload.title.trim();
    const normalizedSubject = newUpload.subject.trim().toUpperCase();
    const normalizedType = newUpload.type.trim();
    const normalizedDeadline = newUpload.deadline.trim();

    if (!normalizedTitle || !normalizedSubject) {
      Swal.fire({ title: 'Error', text: 'Please fill all required fields', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (normalizedTitle.length < 3 || normalizedTitle.length > 120) {
      Swal.fire({ title: 'Invalid Title', text: 'Title must be between 3 and 120 characters', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    const subjectExists = subjects.some((subject) => subject.code === normalizedSubject);
    if (!subjectExists) {
      Swal.fire({ title: 'Invalid Subject', text: 'Please select a valid subject', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (['assignments', 'vivas'].includes(normalizedType) && !normalizedDeadline) {
      Swal.fire({ title: 'Deadline Required', text: 'Please select a deadline date for this category', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (normalizedDeadline && Number.isNaN(new Date(normalizedDeadline).getTime())) {
      Swal.fire({ title: 'Invalid Date', text: 'Please select a valid deadline date', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (!selectedFile) {
      Swal.fire({ title: 'File Required', text: 'Please select a file to upload', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      Swal.fire({ title: 'File Too Large', text: 'Maximum file size is 10MB', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    if (selectedFile.type && !ALLOWED_FILE_MIME_TYPES.has(selectedFile.type)) {
      Swal.fire({ title: 'Unsupported File', text: 'Please upload PDF, DOC, DOCX, PPT, XLS, TXT, ZIP, PNG, or JPG file', icon: 'error', background: '#1a1a2e', color: '#fff' });
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('title', normalizedTitle);
      formData.append('subjectCode', normalizedSubject);
      formData.append('type', normalizedType);
      formData.append('deadline', normalizedDeadline);
      formData.append('file', selectedFile);

      const result = await lecturerPostFormData('/materials', formData);

      setMaterials((prev) => [result.data, ...prev]);
      closeUploadModal();
      Swal.fire({ title: 'Success', text: 'Material uploaded successfully', icon: 'success', background: '#1a1a2e', color: '#fff' });
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'notes', label: 'Lecture Notes', icon: <FileText size={18} /> },
    { id: 'assignments', label: 'Assignments', icon: <CheckSquare size={18} /> },
    { id: 'presentations', label: 'Presentations', icon: <Presentation size={18} /> },
    { id: 'vivas', label: 'Viva Schedules', icon: <Calendar size={18} /> }
  ];

  const filteredMaterials = useMemo(
    () => materials.filter((m) => m.type === activeTab),
    [materials, activeTab]
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
        
        {/* Header Controls */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
             <div className="p-3 bg-white/20 rounded-xl shadow-inner text-white">
               <UploadCloud size={28} />
             </div>
             <div>
               <h1 className="text-2xl md:text-3xl font-bold font-poppins text-white">Course Materials</h1>
               <p className="text-white/70">Manage uploads for all your subjects</p>
             </div>
          </div>
          <button 
            onClick={openUploadModal}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/30"
          >
            <UploadCloud size={20} /> Upload Material
          </button>
        </div>

        {/* Main Content Box */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden">
          
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-white/10 bg-white/5 p-2 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white shadow-inner border border-white/10' 
                    : 'text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* List Area */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {filteredMaterials.map((item) => (
                <div key={item._id} className="flex flex-col md:flex-row justify-between items-center p-5 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-white/30 transition group">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-white/10 text-white/50 rounded-xl group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition">
                      {item.type === 'notes' && <FileText size={24} />}
                      {item.type === 'assignments' && <CheckSquare size={24} />}
                      {item.type === 'presentations' && <Presentation size={24} />}
                      {item.type === 'vivas' && <Calendar size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{item.title}</h3>
                      <div className="text-sm text-white/50 mt-1 flex gap-3">
                        <span className="bg-white/10 px-2 py-0.5 rounded-md text-white/80 border border-white/10">{item.subject}</span>
                        <span>Uploaded: {item.date}</span>
                        {item.deadline && <span className="text-rose-400 font-medium whitespace-nowrap border border-rose-400/30 px-2 py-0.5 rounded-md bg-rose-400/10">Deadline: {item.deadline}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        const fileUrl = item.fileUrl || item.file;
                        if (!fileUrl) {
                          Swal.fire({ title: 'Unavailable', text: 'File URL is not available', icon: 'error', background: '#1a1a2e', color: '#fff' });
                          return;
                        }
                        window.open(fileUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 rounded-lg font-semibold transition border border-indigo-500/30"
                    >
                      <Download size={16} /> Download
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredMaterials.length === 0 && (
                <div className="text-center py-12">
                  <UploadCloud size={64} className="mx-auto text-white/20 mb-4" />
                  <h3 className="text-xl font-bold text-white/70">No {activeTab} uploaded yet</h3>
                  <p className="text-white/40 mt-2">Click the upload button to add materials to this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white mb-6">Upload Material</h2>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Title</label>
                <input 
                  type="text" required maxLength={120}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/30 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition"
                  value={newUpload.title}
                  onChange={(e) => setNewUpload({...newUpload, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Subject</label>
                  <select required
                    className="w-full p-3 rounded-xl bg-[#1e1e38] border border-white/20 text-white focus:border-indigo-400 outline-none"
                    value={newUpload.subject}
                    onChange={(e) => setNewUpload({...newUpload, subject: e.target.value.toUpperCase()})}
                  >
                    <option value="">Select...</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject.code}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">Category</label>
                  <select 
                    className="w-full p-3 rounded-xl bg-[#1e1e38] border border-white/20 text-white focus:border-indigo-400 outline-none"
                    value={newUpload.type}
                    onChange={(e) => setNewUpload({...newUpload, type: e.target.value})}
                  >
                    <option value="notes">Lecture Notes</option>
                    <option value="assignments">Assignment</option>
                    <option value="presentations">Presentation</option>
                    <option value="vivas">Viva Schedule</option>
                  </select>
                </div>
              </div>

              {['assignments', 'vivas'].includes(newUpload.type) && (
                <div>
                   <label className="block text-sm font-semibold text-white/80 mb-2">Deadline / Schedule Date</label>
                   <input 
                     type="date"
                     min={new Date().toISOString().split('T')[0]}
                     className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white outline-none"
                     value={newUpload.deadline}
                     onChange={(e) => setNewUpload({...newUpload, deadline: e.target.value})}
                     style={{ colorScheme: 'dark' }}
                   />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg"
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:bg-white/5 cursor-pointer transition bg-white/5"
                >
                  <UploadCloud size={32} className="mx-auto text-white/50 mb-2" />
                  <p className="text-white/50 text-sm">Click to browse file here</p>
                  {selectedFile && (
                    <p className="text-white/80 text-sm mt-3 font-semibold">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={closeUploadModal}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/30"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseMaterials;
