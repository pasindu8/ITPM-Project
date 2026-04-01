import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import bgImage from '../assets/6903344.jpg'; // ඔයාගේ background image එක

function NextRegisterCoach() {
  const navigate = useNavigate();
  const [sport, setSport] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const userId = localStorage.getItem("userId");

    const data = {
        userId, 
        sport
    };

    try {
        // ඔයාගේ Backend API එක මෙතනට දාන්න
        const res = await fetch('http://localhost:5000/auth/addCoachSport', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok) {
            Swal.fire("Success", "Sport assigned successfully!", "success").then(() => {
                navigate("/verification"); 
            });
        } else {
            Swal.fire("Error", result.message, "error");
        }
    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="w-full max-w-md p-8 rounded-[40px] bg-white/10 backdrop-blur-2xl border-[1.5px] border-white/30 text-white shadow-2xl">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold tracking-wide">Coach Setup</h2>
            <p className="text-sm text-white/70 mt-1">Select your primary sport</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <div className="border-b border-white/40 pb-2">
                <select 
                    required
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    className="w-full bg-transparent outline-none text-white px-2 cursor-pointer [&>option]:text-black"
                >
                    <option value="" disabled>Select Sport</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Volleyball">Volleyball</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-full text-lg hover:shadow-lg transition-all active:scale-95">
                Complete Setup
            </button>
        </form>
      </div>
    </div>
  );
}

export default NextRegisterCoach;