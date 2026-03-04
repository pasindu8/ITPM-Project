import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function TimetableUpload() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire("Error", "Please select an image first!", "error");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `${token}`
        }
      });

      setData(res.data); // Gemini එකෙන් එවන JSON array එක
      Swal.fire("Success", "Timetable extracted successfully!", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to process image.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-6">Upload Timetable Image</h2>
      
      <div className="flex gap-4 mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
        <input type="file" onChange={handleFileChange} className="file:bg-blue-600 file:border-none file:px-4 file:py-2 file:rounded-lg file:text-white cursor-pointer" />
        <button 
          onClick={handleUpload} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Processing..." : "Extract Data"}
        </button>
      </div>

      {/* ලැබෙන දත්ත පෙන්වන Table එක */}
      {data.length > 0 && (
        <div className="overflow-x-auto bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/10 text-blue-400">
                <th className="p-4 border-b border-white/10">Day</th>
                <th className="p-4 border-b border-white/10">Time</th>
                <th className="p-4 border-b border-white/10">Subject</th>
                <th className="p-4 border-b border-white/10">Lecturer</th>
                <th className="p-4 border-b border-white/10">Venue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-white/5 transition">
                  <td className="p-4 border-b border-white/5">{item.day}</td>
                  <td className="p-4 border-b border-white/5">{item.time}</td>
                  <td className="p-4 border-b border-white/5">
                    <span className="font-bold">{item.subjectCode}</span><br/>
                    <span className="text-sm text-gray-400">{item.subjectName}</span>
                  </td>
                  <td className="p-4 border-b border-white/5 text-sm">{item.lecturer}</td>
                  <td className="p-4 border-b border-white/5"><span className="bg-blue-900/40 px-2 py-1 rounded border border-blue-400/30 text-xs">{item.venue}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TimetableUpload;