
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';


function ScheduleAndConflicts() {
    return (
        <div 
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
            style={{ backgroundImage: `url(${bgImage})` }}
            >
            <Sidebar/>
            <div className="flex-1 flex flex-col gap-6">
  
                {/* --- Header Section --- */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span>📅</span> Schedule & Conflicts
                    </h2>
                    <button className="bg-white hover:bg-blue-50 text-blue-900 px-6 py-2.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center gap-2">
                    <span className="text-xl">+</span> Add Session
                    </button>
                </div>

                {/* --- Sessions List Section --- */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex-1 overflow-y-auto h-[500px] custom-scrollbar">
                    <h3 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-2">
                    Upcoming Training Sessions
                    <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded text-white/50 tracking-widest uppercase">March 2026</span>
                    </h3>
                    
                    <div className="space-y-4">
                    
                    {/* --- Normal Session (All Clear) --- */}
                    <div className="group bg-white/5 border border-white/10 p-6 rounded-[1.8rem] flex justify-between items-center transition-all hover:bg-white/10 hover:-translate-y-1">
                        <div className="flex items-center gap-6">
                        <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30 text-center min-w-[70px]">
                            <p className="text-green-400 text-xs font-bold uppercase">Mar</p>
                            <p className="text-white text-2xl font-black">01</p>
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-bold group-hover:text-green-300 transition-colors">Cricket Nets Practice</h3>
                            <div className="flex items-center gap-3 mt-1">
                            <span className="text-white/60 text-sm flex items-center gap-1">🕒 4:00 PM - 6:00 PM</span>
                            <span className="text-white/30 text-sm">|</span>
                            <span className="text-white/60 text-sm flex items-center gap-1">📍 Main Ground</span>
                            </div>
                        </div>
                        </div>
                        <span className="bg-green-500/20 text-green-400 border border-green-500/40 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">
                        All Clear
                        </span>
                    </div>

                    {/* --- Conflict Session (Warning) --- */}
                    <div className="group bg-red-500/10 border border-red-500/20 p-6 rounded-[1.8rem] flex justify-between items-center transition-all hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <div className="flex items-center gap-6">
                        <div className="bg-red-500/20 p-4 rounded-2xl border border-red-500/30 text-center min-w-[70px]">
                            <p className="text-red-400 text-xs font-bold uppercase">Mar</p>
                            <p className="text-white text-2xl font-black">02</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                            <h3 className="text-white text-xl font-bold">Fitness Training</h3>
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black uppercase animate-pulse">Conflict</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                            <span className="text-white/60 text-sm flex items-center gap-1">🕒 9:00 AM - 11:00 AM</span>
                            <span className="text-white/30 text-sm">|</span>
                            <span className="text-white/60 text-sm flex items-center gap-1">📍 Indoor Gym</span>
                            </div>
                            <p className="text-yellow-400 text-sm font-semibold mt-2 flex items-center gap-1">
                            ⚠️ 3 Students have IT Lectures at this time
                            </p>
                        </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="bg-white text-red-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-red-50 transition-colors">
                            Manage Conflict
                            </button>
                            <button className="text-white/40 hover:text-white/90 text-[10px] font-bold uppercase underline transition-colors">
                            Reschedule
                            </button>
                        </div>
                    </div>

                    </div>

                    {/* Footer Calendar Hint */}
                    <div className="mt-8 text-center">
                        <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Synchronized with University Timetable</p>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default ScheduleAndConflicts;