import hide from '../assets/hide.png';
import show from '../assets/show.png';
import bgImage from '../assets/6903344.jpg';
import { useNavigate} from 'react-router-dom';
import React, { useState } from 'react';
import Swal from "sweetalert2";

function ForgotPassword() {

    const [isPassVisible, setPassVisible] = useState(false);
    const [isConPassVisible, setConPassVisible] = useState(false);

    const navigate = useNavigate();
    async function handleSubmit(event) {
        event.preventDefault();
        const data = {
            uname: event.target.uname.value,
          password: event.target.password.value,
          conpassword: event.target.conpassword.value
        };
        const res = await fetch('http://localhost:5000/auth/forgot-password', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) {
            Swal.fire({
                icon: "error",
                title: "Password Change Failed",
                text: result.message,
                confirmButtonText: "OK",
            });
            return;
        } else {
            Swal.fire({
                icon: "success",
                title: "Password Change Success",
                text: result.message,
                confirmButtonText: "OK",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/verification");
                }
            });
            localStorage.setItem("userId", result.userId);
            event.target.reset();
        }
    }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
     
      <div className="w-full max-w-md p-10 rounded-[40px] bg-white/10 backdrop-blur-2xl backdrop-brightness-110 border-[1.5px] border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
        
        
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2 tracking-wide">Reset Password</h1>
            <p className="text-sm text-white/70">Enter your email and new password</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
            
           
            <div className="border-b-2 border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/80 text-lg px-2" 
                  placeholder="Username / Email" 
                  name="uname"
                  required
                />
            </div>

            
            <div className="border-b-2 border-white/40 pb-2 flex items-center justify-between">
                <input 
                  type={isPassVisible ? "text" : "password"} 
                  className="w-full bg-transparent outline-none placeholder-white/80 text-lg px-2" 
                  placeholder="New Password" 
                  name="password"
                  id="password"
                  required
                />
                
                <span 
                  onClick={() => setPassVisible(!isPassVisible)}
                  className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity p-1"
                  title={isPassVisible ? "Hide Password" : "Show Password"}
                >
                  {isPassVisible ? "🙈" : "👁️"} 
                </span>
            </div>

           
            <div className="border-b-2 border-white/40 pb-2 flex items-center justify-between">
                <input 
                  type={isConPassVisible ? "text" : "password"} 
                  className="w-full bg-transparent outline-none placeholder-white/80 text-lg px-2" 
                  placeholder="Confirm Password" 
                  name="conpassword"
                  id="conpassword"
                  required
                />
                
                <span 
                  onClick={() => setConPassVisible(!isConPassVisible)}
                  className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity p-1"
                  title={isConPassVisible ? "Hide Password" : "Show Password"}
                >
                  {isConPassVisible ? "🙈" : "👁️"}
                </span>
            </div>

            
            <button 
              type="submit" 
              className="w-full bg-white text-blue-900 font-extrabold py-4 rounded-full text-xl shadow-[0_10px_20px_rgba(255,255,255,0.3)] hover:shadow-white/40 hover:-translate-y-1 transition-all duration-300 active:scale-95 mt-4"
            >
              Change Password
            </button>

        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;