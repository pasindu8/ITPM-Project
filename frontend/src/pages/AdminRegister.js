import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

// Images imports
import hide from '../assets/hide.png';
import show from '../assets/show.png';
import bgImage from '../assets/6903344.jpg';

function AdminRegister() {

  const navigate = useNavigate();
  const [isPassVisible, setPassVisible] = useState(false);
  const [isConPassVisible, setConPassVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verification, setVerification] = useState('');
  const [isPhonesend, setIsPhonesend] = useState(false);
  const [isPhone, setIsPhone] = useState(false);

  async function handleVerifyPhone(e) {
    
    e.preventDefault();

    const cleanedNumber = phoneNumber.replace("+", "");

    const data = {
      phoneNumber: cleanedNumber
    };

    try {
        const res = await fetch('http://localhost:5000/auth/verify-phone', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
        });

        const result = await res.json();
        if (!res.ok) {
            Swal.fire({
            icon: "error",
            title: "Phone Verification Failed",
            text: result.message,
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
            });
        } else {
            Swal.fire({
            icon: "success",
            title: "Success",
            text: result.message,
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
            });
            localStorage.setItem("phoneverificationCode", result.phoneverificationCode);
            localStorage.setItem("phoneNumber", result.phoneNumber);
            setIsPhonesend(true);
        } 
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again.",
        });
    }
  }

  async function handleVerifyCode(e) {

    e.preventDefault();

    const storedCode = localStorage.getItem("phoneverificationCode");
    const localPhoneNumber = localStorage.getItem("phoneNumber");
    setPhoneNumber(localPhoneNumber);

    if (verification === storedCode) {
        Swal.fire({
            icon: "success",
            title: "Phone Verified",
            text: "Your phone number has been verified successfully.",
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
        });
        setIsPhone(true);
    } else {
        Swal.fire({
            icon: "error", 
            title: "Verification Failed",
            text: "The verification code you entered is incorrect. Please try again.",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
        });
      }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    // Form Data
    const data = {
      name: event.target.name.value,
      email: event.target.email.value,
      username: event.target.username.value,
      password: event.target.password.value,
      conpassword: event.target.conpassword.value,
      phoneNumber: phoneNumber,
      role: event.target.role.value,
      adminCode: event.target.adminCode.value
    };

    try {
        const res = await fetch('http://localhost:5000/auth/register-admin', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
        Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: result.message,
            confirmButtonText: "OK",
            confirmButtonColor: "#d33",
        });
        } else {
            Swal.fire({
            icon: "success",
            title: "Success",
            text: result.message,
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
            }).then((result) => {
            if (result.isConfirmed) {
                navigate("/verification");
            }
            });
            localStorage.setItem("userId", result.userId);
            event.target.reset();
        } 
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again.",
        });
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-lg p-8 rounded-[40px] bg-white/10 backdrop-blur-2xl backdrop-brightness-110 border-[1.5px] border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
        
        {/* Header with Shield Icon */}
        <div className="text-center mb-6">
            <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-3xl">🛡️</span>
            </div>
            <h1 className="text-3xl font-bold tracking-wide">Admin Registration</h1>
            <p className="text-sm text-white/70 mt-1">Restricted Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            
            {/* --- ADMIN SECRET CODE (Highlighted) --- */}
            <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 backdrop-blur-md">
                <label className="text-xs text-red-200 uppercase font-bold tracking-wider ml-1">Security Clearance</label>
                <input 
                    type="text" 
                    className="w-full bg-transparent outline-none text-white placeholder-red-200/50 text-lg px-1 mt-1 font-mono" 
                    placeholder="Enter Admin Secret Key" 
                    name="adminCode"
                    required
                />
            </div>
            {/* --------------------------------------- */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="border-b border-white/40 pb-2">
                    <input type="text" className="w-full bg-transparent outline-none placeholder-white/70 px-2" placeholder="Full Name" name="name" required />
                </div>
                {/* Email */}
                <div className="border-b border-white/40 pb-2">
                    <input type="email" className="w-full bg-transparent outline-none placeholder-white/70 px-2" placeholder="Email" name="email" required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Username */}
                <div className="border-b border-white/40 pb-2">
                    <input type="text" className="w-full bg-transparent outline-none placeholder-white/70 px-2" placeholder="Username" name="username" required />
                </div>
                
                {/* Role Selection Dropdown */}
                <div className="border-b border-white/40 pb-2">
                    <select 
                        name="role"
                        className="w-full bg-transparent outline-none text-white px-2 cursor-pointer [&>option]:text-black" // Option text black for visibility
                    >
                        <option value="" disabled selected>Select Role</option>
                        <option value="moderator">Moderator</option>
                        <option value="editor">Editor</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Passwords */}
            <div className="border-b border-white/40 pb-2 flex items-center justify-between">
                <input type={isPassVisible ? "text" : "password"} className="w-full bg-transparent outline-none placeholder-white/70 px-2" placeholder="Password" name="password" required />
                <img src={isPassVisible ? show : hide} onClick={() => setPassVisible(!isPassVisible)} className="w-5 h-5 cursor-pointer opacity-70 invert" alt="toggle"/>
            </div>

            <div className="border-b border-white/40 pb-2 flex items-center justify-between">
                <input type={isConPassVisible ? "text" : "password"} className="w-full bg-transparent outline-none placeholder-white/70 px-2" placeholder="Confirm Password" name="conpassword" required />
                <img src={isConPassVisible ? show : hide} onClick={() => setConPassVisible(!isConPassVisible)} className="w-5 h-5 cursor-pointer opacity-70 invert" alt="toggle"/>
            </div>

            {!isPhonesend && !isPhone &&(
            <div className="mt-2 mb-2">
                <div className="flex items-center bg-white/20 backdrop-blur-md border border-white/40 rounded-full p-1.5 shadow-inner transition-all focus-within:bg-white/30 focus-within:border-white">
                    <input 
                        type="tel" 
                        className="w-[200px] flex-grow bg-transparent outline-none text-white placeholder-white/80 px-2 text-lg" 
                        placeholder="+94 7X XXXXXXX"
                        maxLength="12"  
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={handleVerifyPhone}
                        className="bg-blue-900/90 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform active:scale-95 border border-white/20"
                    >
                        Send OTP
                    </button>
                </div>
            </div>
            )}
            {isPhonesend && !isPhone && (
            <div className="mt-2 mb-2">
                <div className="flex items-center bg-white/20 backdrop-blur-md border border-white/40 rounded-full p-1.5 shadow-inner transition-all focus-within:bg-white/30 focus-within:border-white">
                    <input 
                        type="tel"
                        maxLength="6" 
                        className="flex-grow bg-transparent outline-none text-white placeholder-white/80 px-3 text-lg" 
                        placeholder="XXXXXX" 
                        value={verification}
                        onChange={(e) => setVerification(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={handleVerifyCode}
                        className="bg-blue-900/90 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform active:scale-95 border border-white/20"
                    >
                        Verify
                    </button>
                </div>
            </div>
            )}
            {isPhone && (
              <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  value={"+"+phoneNumber}
                  name="phoneNumber"
                  readOnly
                  required
                />
            </div>
            )}

            {/* Submit Button - Gold Color for Admin */}
            <button 
              type="submit"
              disabled={!isPhone}
              className={`w-full shadow-lg font-extrabold py-3 rounded-full text-xl mt-2 transition-all duration-300
                ${!isPhone 
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-[0_10px_20px_rgba(255,255,255,0.3)] hover:shadow-orange-500/50 hover:-translate-y-1 transition-all active:scale-95"
                }`}
            >
              Register Admin
            </button>

            <div className="text-center text-sm mt-2">
                <Link to="/login" className="text-white/60 hover:text-white transition-colors">
                    Cancel & Return to Login
                </Link>
            </div>

        </form>
      </div>
    </div>
  );
}

export default AdminRegister;