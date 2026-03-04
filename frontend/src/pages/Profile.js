import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import bgImage from '../assets/6903344.jpg'; 

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
            <button className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all border border-white/20">
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
    </div>
  );
}

export default Profile;