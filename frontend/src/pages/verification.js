import React, { useState, useEffect } from 'react';
import Swal from "sweetalert2";
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/6903344.jpg'; // Image path එක හරිද බලන්න

function Verification() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30); // තත්පර 30ක timer එකක්

  // Countdown Timer Logic
  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendOTP = async (e) => {
    if (e) e.preventDefault(); // Link එක ක්ලික් කළාම පිටුව refresh වීම වැළැක්වීමට

    const userId = localStorage.getItem('userId');

    try {
      const res = await fetch('http://localhost:5000/auth/resendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();

      if (res.ok) {
        setCountdown(30); // ආයෙත් තත්පර 30ක ටයිමර් එකක් පටන් ගන්නවා
        Swal.fire({
          icon: "success",
          title: "OTP Resent",
          text: "A new verification code has been sent to your email.",
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: result.message || "Could not resend OTP",
        });
      }
    } catch (error) {
      console.error("Resend Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
      });
    }
  };

  async function handleSubmit(event) {  
    event.preventDefault();
    
    const data = {
      userId: localStorage.getItem('userId'),  
      verificationCode: event.target.verificationCode.value
    };

    try {
        const res = await fetch('http://localhost:5000/auth/verify', {
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
                    navigate("/login"); 
                }
            });
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
      {/* 3D Glass Card */}
      <div className="w-full max-w-md p-10 rounded-[40px] bg-white/10 backdrop-blur-2xl backdrop-brightness-110 border-[1.5px] border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
        
        {/* Header Section */}
        <div className="text-center mb-10">
            <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm shadow-inner">
                <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-wide">Email Verification</h1>
            <p className="text-sm text-white/70">Enter the OTP sent to your email</p>
        </div>
            
        <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
            
            {/* OTP Input */}
            <div className="border-b-2 border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none text-white text-center text-3xl font-bold tracking-[0.5em] placeholder-white/30 px-2" 
                  placeholder="CODE" 
                  name="verificationCode"
                  maxLength="6"
                  required
                />
            </div>

            {/* Verify Button */}
            <button 
              type="submit" 
              className="w-full bg-white text-blue-900 font-extrabold py-4 rounded-full text-xl shadow-[0_10px_20px_rgba(255,255,255,0.3)] hover:shadow-white/40 hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
              Verify OTP
            </button>

            {/* Resend OTP Section */}
            <div className="mt-4">
               <p className="text-white/80">
                  {countdown > 0 ? (
                      <span className="opacity-70">Resend code in **{countdown}s**</span>
                  ) : (
                      // මෙතන තමයි handleResendOTP function එක call කරන්නේ
                      <button 
                        type="button"
                        onClick={handleResendOTP} 
                        className="text-white font-bold underline hover:text-blue-200 transition-colors"
                      >
                          Resend OTP
                      </button>
                  )}
               </p>
            </div>
            
            {/* Back to Login Link */}
            <div className="text-center">
                <Link to="/login" className="text-xs text-white/50 hover:text-white transition-colors">
                    Back to Login
                </Link>
            </div>

        </form>
      </div>
    </div>
  );
}

export default Verification;