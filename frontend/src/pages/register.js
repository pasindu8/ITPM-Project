import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

// Images imports
import hide from '../assets/hide.png';
import show from '../assets/show.png';
import bgImage from '../assets/6903344.jpg';

function Register() {
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
      phoneNumber: phoneNumber
    };

    try {
        const res = await fetch('http://localhost:5000/auth/register', {
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
                navigate("/nextRegisterSTU");
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
      {/* 3D Glass Card Container */}
      <div className="w-full max-w-md p-8 md:p-10 rounded-[40px] bg-white/10 backdrop-blur-2xl backdrop-brightness-110 border-[1.5px] border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 tracking-wide">Create Account</h1>
            <p className="text-sm text-white/70">Please fill in the details to sign up</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            
            {/* Name Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Full Name" 
                  name="name"
                  required
                />
            </div>

            {/* Email Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="email" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Email Address" 
                  name="email"
                  required
                />
            </div>

            {/* Username Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Username" 
                  name="username"
                  required
                />
            </div>

            {/* Password Input */}
            <div className="border-b border-white/40 pb-2 flex items-center justify-between">
                <input 
                  type={isPassVisible ? "text" : "password"} 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Password" 
                  id="password" 
                  name="password"
                  required
                />
                <img 
                  src={isPassVisible ? show : hide} 
                  onClick={() => setPassVisible(!isPassVisible)} 
                  className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity invert" // invert එක දැම්මේ අයිකන් සුදු පාට වෙන්න
                  alt="Toggle password"
                />
            </div>

            {/* Confirm Password Input */}
            <div className="border-b border-white/40 pb-2 flex items-center justify-between">
                <input 
                  type={isConPassVisible ? "text" : "password"} 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Confirm Password" 
                  id="conpassword" 
                  name="conpassword"
                  required
                />
                <img 
                  src={isConPassVisible ? show : hide} 
                  onClick={() => setConPassVisible(!isConPassVisible)} 
                  className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity invert"
                  alt="Toggle confirm password"
                />
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

            {/* Sign Up Button */}
            <button 
              type="submit"
              disabled={!isPhone}
              className={`w-full font-extrabold py-3 rounded-full text-xl mt-2 transition-all duration-300
                ${!isPhone 
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
                  : "bg-white text-blue-900 shadow-[0_10px_20px_rgba(255,255,255,0.3)] hover:shadow-white/40 hover:-translate-y-1 active:scale-95"
                }`}
            >
              Next
            </button>


            {/* Footer Link */}
            <div className="text-center text-sm mt-4">
                <p className="text-white/80">
                  Already have an account? 
                  <Link to="/login" className="font-bold ml-1 border-b border-white hover:text-blue-200 transition-colors">
                    Login
                  </Link>
                </p>
            </div>

        </form>
      </div>
    </div>
  );
}

export default Register;