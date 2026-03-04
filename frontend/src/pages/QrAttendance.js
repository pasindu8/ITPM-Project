
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';


function QrAttendance() {
    return (
        <div 
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
            style={{ backgroundImage: `url(${bgImage})` }}
            >
            <Sidebar/>
            <div className="flex-1 flex flex-col md:flex-row gap-6 h-full">
  
                {/* --- Left Side: QR Generator Section --- */}
                <div className="flex-[2] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden text-center">
                    
                    {/* Decorative Glow Background */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -translate-x-10 -translate-y-10"></div>
                    
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Scan to Mark Attendance</h2>
                    <p className="text-white/60 font-medium mb-10 bg-white/5 px-4 py-1 rounded-full border border-white/10">
                    Session: Today 4:00 PM | <span className="text-blue-300">Cricket Practice</span>
                    </p>
                    
                    {/* QR Container with Pulse Animation */}
                    <div className="relative group">
                    <div className="absolute -inset-4 bg-blue-500/30 rounded-[2rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-[2rem] shadow-2xl transition-transform duration-500 hover:scale-105">
                        <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DynamicSession_ID_2026" 
                        alt="QR Code"
                        className="w-56 h-56 md:w-64 md:h-64"
                        />
                    </div>
                    </div>
                    
                    {/* Timer Section */}
                    <div className="mt-12 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-yellow-400 font-mono text-2xl font-bold bg-black/20 px-6 py-2 rounded-2xl border border-yellow-400/30">
                        <span className="animate-ping w-2 h-2 bg-yellow-400 rounded-full"></span>
                        ⏱ 04:59
                    </div>
                    <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold">QR changes automatically</p>
                    </div>
                </div>

                {/* --- Right Side: Live Attendance Feed --- */}
                <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-6 shadow-xl flex flex-col h-[600px] md:h-auto">
                    <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-xl font-bold text-white">Live Feed</h3>
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-black border border-green-500/30">
                        12 PRESENT
                    </span>
                    </div>
                    
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {/* Attendance Item 1 */}
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✔</div>
                        <div>
                            <p className="text-white font-semibold text-sm">Nimal Perera</p>
                            <p className="text-white/40 text-[10px] uppercase">Student ID: IT2100</p>
                        </div>
                        </div>
                        <span className="text-white/60 text-xs font-mono">4:02 PM</span>
                    </div>

                    {/* Attendance Item 2 */}
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✔</div>
                        <div>
                            <p className="text-white font-semibold text-sm">Kasun Silva</p>
                            <p className="text-white/40 text-[10px] uppercase">Student ID: IT2145</p>
                        </div>
                        </div>
                        <span className="text-white/60 text-xs font-mono">4:05 PM</span>
                    </div>

                    {/* Attendance Item 3 */}
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✔</div>
                        <div>
                            <p className="text-white font-semibold text-sm">Dasun Shanaka</p>
                            <p className="text-white/40 text-[10px] uppercase">Student ID: IT2190</p>
                        </div>
                        </div>
                        <span className="text-white/60 text-xs font-mono">4:06 PM</span>
                    </div>
                    </div>

                    {/* Footer Info */}
                    <button className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 rounded-xl text-sm font-bold transition-all">
                    Download Full List
                    </button>
                </div>
            </div>
            
        </div>
    );
}

export default QrAttendance;