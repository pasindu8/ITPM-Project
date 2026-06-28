import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import bgImage from '../assets/6903344.jpg'; 

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,20}$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '', phoneNumber: '' });

  const setField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
    setFormError('');
  };

  const validateEditForm = (values) => {
    const errors = {};
    const name = values.name.trim();
    const email = values.email.trim().toLowerCase();
    const username = values.username.trim();
    const phoneNumber = values.phoneNumber.trim();

    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length < 2 || name.length > 60) {
      errors.name = 'Name must be between 2 and 60 characters';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!username) {
      errors.username = 'Username is required';
    } else if (!USERNAME_REGEX.test(username)) {
      errors.username = 'Username must be 3-20 chars (letters, numbers, ., _, -)';
    }

    if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
      errors.phoneNumber = 'Phone must be 10-15 digits and may start with +';
    }

    return errors;
  };

  const openEditModal = () => {
    if (!user) return;
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      phoneNumber: user.phoneNumber || '',
    });
    setFormErrors({});
    setFormError('');
    setIsEditOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const errors = validateEditForm(editForm);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setFormError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        username: editForm.username.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
      };

      const res = await fetch('http://localhost:5000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser(data);
      setIsEditOpen(false);

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile details were updated successfully.',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      setFormError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Login වෙද්දී save කරපු Token එක ගන්න (Token එක නැත්නම් Login එකට යවන්න)
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId'); 
        
        if (!userId) {
            navigate('/login');
            Swal.fire("userId not found", "Please login again.", "error");
            return;
        }

        const res = await fetch('http://localhost:5000/auth/profile', { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}` 
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch profile");
        }

        setUser(data);
        setLoading(false);

      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Session Expired",
            text: error.message || "Something went wrong. Please login again.",
            confirmButtonColor: '#d33',
        }).then(() => {
            localStorage.clear();
            navigate('/login');
        });
      }
    }

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Logout!'
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.clear(); 
          navigate('/login');
        }
      })
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Glass Profile Card */}
      <div className="w-full max-w-lg p-8 rounded-[40px] bg-white/10 backdrop-blur-2xl backdrop-brightness-110 border-[1.5px] border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white relative">
        
        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center -mt-20 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white/50 shadow-2xl overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
                {/* User Image නැත්නම් මුල අකුර පෙන්වමු */}
                <span className="text-5xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className="text-3xl font-bold mt-4 tracking-wide">{user?.name}</h2>
            <p className="text-blue-200 text-sm bg-blue-900/40 px-3 py-1 rounded-full mt-2 border border-blue-400/30">
                {user?.username}
            </p>
        </div>

        {/* User Details Grid */}
        <div className="space-y-4">
            
            {/* Email Field */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center">
                <span className="text-2xl mr-4 opacity-70">📧</span>
                <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">Email Address</p>
                    <p className="text-lg font-medium">{user?.email}</p>
                </div>
            </div>

            {/* Phone Field (if available) */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center">
                <span className="text-2xl mr-4 opacity-70">📞</span>
                <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">Phone Number</p>
                    <p className="text-lg font-medium">{user?.phoneNumber || "Not Provided"}</p>
                </div>
            </div>

            {/* Role / Type Field */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center">
                <span className="text-2xl mr-4 opacity-70">🛡️</span>
                <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">Account Type</p>
                    <p className="text-lg font-medium capitalize">{user?.type || "User"}</p>
                </div>
            </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={openEditModal}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all border border-white/20"
          >
                Edit Profile
            </button>
            <button 
                onClick={handleLogout}
                className="flex-1 bg-red-500/80 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
            >
                Logout
            </button>
        </div>

      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-gray-900/95 border border-white/20 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-white/60 hover:text-white text-2xl leading-none">✕</button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none ${
                    formErrors.name ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                  }`}
                />
                {formErrors.name && <p className="text-red-300 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="text-white/70 text-sm mb-1 block">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none ${
                    formErrors.email ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                  }`}
                />
                {formErrors.email && <p className="text-red-300 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="text-white/70 text-sm mb-1 block">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setField('username', e.target.value)}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none ${
                    formErrors.username ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                  }`}
                />
                {formErrors.username && <p className="text-red-300 text-xs mt-1">{formErrors.username}</p>}
              </div>

              <div>
                <label className="text-white/70 text-sm mb-1 block">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setField('phoneNumber', e.target.value)}
                  placeholder="Optional"
                  className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none ${
                    formErrors.phoneNumber ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-blue-400'
                  }`}
                />
                {formErrors.phoneNumber && <p className="text-red-300 text-xs mt-1">{formErrors.phoneNumber}</p>}
              </div>

              {formError && <p className="text-red-300 text-sm">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;