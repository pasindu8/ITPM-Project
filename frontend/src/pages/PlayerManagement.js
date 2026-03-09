
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';


function PlayerManagement() {
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
                    <span>🏃‍♂️</span> Player Management
                    </h2>
                    <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search players..." 
                        className="bg-white/20 border border-white/30 rounded-full py-2 px-5 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-blue-400 w-64 transition-all"
                    />
                    </div>
                </div>

                {/* --- Player Table Section --- */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-white/5 border-bottom border-white/10">
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Player Name</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Role / Position</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Performance Rating</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest">Health Status</th>
                            <th className="p-5 text-white/70 font-bold uppercase text-xs tracking-widest text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                        
                        {/* Row 1: Fit Player */}
                        <tr className="hover:bg-white/5 transition-colors group">
                            <td className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">NP</div>
                                <span className="text-white font-medium">Nimal Perera</span>
                            </div>
                            </td>
                            <td className="p-5 text-white/80">Batsman</td>
                            <td className="p-5">
                            <div className="flex flex-col gap-1">
                                <div className="flex text-yellow-400 text-sm">⭐⭐⭐⭐</div>
                                <span className="text-xs text-white/50">(8/10)</span>
                            </div>
                            </td>
                            <td className="p-5">
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                                ✔ Fit
                            </span>
                            </td>
                            <td className="p-5 text-center">
                            <button className="px-4 py-2 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-all transform active:scale-95 shadow-md">
                                Edit
                            </button>
                            </td>
                        </tr>

                        {/* Row 2: Injured Player */}
                        <tr className="bg-red-500/10 hover:bg-red-500/20 transition-colors group">
                            <td className="p-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-md">KS</div>
                                <span className="text-white font-medium">Kasun Silva</span>
                            </div>
                            </td>
                            <td className="p-5 text-white/80">Fast Bowler</td>
                            <td className="p-5">
                            <div className="flex flex-col gap-1">
                                <div className="flex text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                                <span className="text-xs text-white/50">(9/10)</span>
                            </div>
                            </td>
                            <td className="p-5">
                            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                                🏥 Injured (Knee)
                            </span>
                            </td>
                            <td className="p-5 text-center">
                            <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all transform active:scale-95 shadow-md">
                                Update
                            </button>
                            </td>
                        </tr>

                        </tbody>
                    </table>
                    </div>
                </div>
                </div>
            
        </div>
    );
}

export default PlayerManagement;