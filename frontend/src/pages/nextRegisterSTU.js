import Swal from "sweetalert2";
import bgImage from '../assets/6903344.jpg';
import { useNavigate } from 'react-router-dom'; 

function NextregisterSTU() { 
  const navigate = useNavigate(); 

  async function handleSubmit(event) {
    event.preventDefault();
    const usrId = localStorage.getItem("userId");
    const data = {
      userId: usrId,
      studentId: event.target.studentId.value,
      faculty: event.target.faculty.value,
      academicYear: event.target.academicYear.value,
      academicSemester: event.target.academicSemester.value,
      group: event.target.group.value,
      sport: event.target.sport.value,
      playingStyle: event.target.playingStyle.value,
      bloodGroup: event.target.bloodGroup.value,
      emergencyContact: event.target.emergencyContact.value,
      allergiesMedicalConditions: event.target.allergiesMedicalConditions.value
    };

    try {
        const res = await fetch('http://localhost:5000/auth/register-stu', {
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
                    navigate("/verification"); // දැන් මේක වැඩ කරයි
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
      {/* 3D Glass Card Container */}
      <div className="w-full max-w-md p-8 md:p-10 rounded-[40px] bg-white/10 backdrop-blur-2xl backdrop-brightness-110 border-[1.5px] border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 tracking-wide">Create Account</h1>
            <p className="text-sm text-white/70">Please fill in the details to sign up</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
            
            {/* Student id Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Student ID" 
                  name="studentId"
                  required
                />
            </div>

            {/* faculty Input */}
                        <div className="border-b border-white/40 pb-2">
                <select 
                    name="faculty"
                    required
                    className="w-full bg-transparent outline-none text-white text-lg px-2 cursor-pointer appearance-none"
                    defaultValue=""
                >
                    <option value="" disabled hidden className="text-black">Select Faculty</option>

                    <option value="FOC" className="text-black">Faculty of Computing</option>
                    <option value="SOB" className="text-black">School of Business</option>
                    <option value="FOE" className="text-black">Faculty of Engineering</option>
                    <option value="SOA" className="text-black">School of Architecture</option>
                    <option value="FOHS" className="text-black">Faculty of Humanities & Sciences</option>
                </select>
            </div>
            
            {/* Academic year Input */}
           <div className="border-b border-white/40 pb-2">
                <select 
                    name="academicYear"
                    required
                    className="w-full bg-transparent outline-none text-white text-lg px-2 cursor-pointer appearance-none"
                    defaultValue=""
                >
                    <option value="" disabled hidden className="text-black">Select Academic Year</option>
                    
                    <option value="1y" className="text-black">1st Year</option>
                    <option value="2y" className="text-black">2nd Year</option>
                    <option value="3y" className="text-black">3rd Year</option>
                    <option value="4y" className="text-black">4th Year</option>
                </select>
            </div>

            {/* Academic semester Input */}
           <div className="border-b border-white/40 pb-2">
                <select 
                    name="academicSemester"
                    required
                    className="w-full bg-transparent outline-none text-white text-lg px-2 cursor-pointer appearance-none"
                    defaultValue=""
                >
                    <option value="" disabled hidden className="text-black">Select Academic Semester</option>
                    
                    <option value="1s" className="text-black">1st Semester</option>
                    <option value="2s" className="text-black">2nd Semester</option>
                </select>
            </div>

            {/* group Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Group" 
                  name="group"
                  required
                />
            </div>

            {/* sport Input */}
            <div className="border-b border-white/40 pb-2">
                <select 
                    name="sport"
                    required
                    className="w-full bg-transparent outline-none text-white text-lg px-2 cursor-pointer appearance-none"
                    defaultValue=""
                >
                    <option value="" disabled hidden className="text-black">Select Sport</option>
                    
                    <option value="cricket" className="text-black">Cricket</option>
                    <option value="football" className="text-black">Football</option>
                    <option value="basketball" className="text-black">Basketball</option>
                    <option value="volleyball" className="text-black">Volleyball</option>
                </select>
            </div>


            {/* playing style Input */}
           <div className="border-b border-white/40 pb-2">
                <select 
                    name="playingStyle"
                    required
                    className="w-full bg-transparent outline-none text-white text-lg px-2 cursor-pointer appearance-none"
                    defaultValue=""
                >
                    <option value="" disabled hidden className="text-black">Select Playing Style</option>
                    
                    <option value="Right-handed" className="text-black">Right-handed</option>
                    <option value="Left-handed" className="text-black">Left-handed</option>
                </select>
            </div>

            {/* blood group Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Blood Group" 
                  name="bloodGroup"
                  required
                />
            </div>

            {/* Emergency Contact Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Emergency Contact" 
                  name="emergencyContact"
                  required
                />
            </div>

            {/* allergies & medical conditions Input */}
            <div className="border-b border-white/40 pb-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none placeholder-white/70 text-lg px-2" 
                  placeholder="Allergies & Medical Conditions" 
                  name="allergiesMedicalConditions"
                />
            </div>
            {/* Sign Up Button */}
            <button 
              type="submit"
              className="w-full font-extrabold py-3 rounded-full text-xl mt-2 transition-all duration-300 bg-white text-blue-900 shadow-[0_10px_20px_rgba(255,255,255,0.3)] hover:shadow-white/40 hover:-translate-y-1 active:scale-95"
            >
              Sign Up
            </button>

        </form>
      </div>
    </div>
  );
}

export default NextregisterSTU;