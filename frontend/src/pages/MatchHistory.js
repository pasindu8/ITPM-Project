import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';

function MatchHistory() {
  const matches = [
    { id: 1, tournament: "Inter-University Championship", opponent: "UOM Cricket Team", date: "Feb 20, 2026", result: "Won", score: "154/4 (18.2) vs 150/8 (20)", mom: "Nimal Perera" },
    { id: 2, tournament: "Friendly Series", opponent: "SLIIT Warriors", date: "Feb 15, 2026", result: "Lost", score: "120/10 (19.1) vs 121/2 (15.4)", mom: "Opponent Player" },
    { id: 3, tournament: "Annual T20 Cup", opponent: "Japura Stallions", date: "Jan 28, 2026", result: "Won", score: "180/2 (20) vs 140/9 (20)", mom: "Dasun Shanaka" },
  ];

  return (
    <div 
      className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />

      {/* --- Main Content Section --- */}
      <div className="flex-1 flex flex-col gap-4 overflow-auto px-2">
        
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white">🏆 Tournament & Match History</h2>
            <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Track team performance & trophies</p>
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>+</span> Add Match Result
          </button>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center">
            <p className="text-white/50 text-[10px] uppercase font-bold">Total Matches</p>
            <h2 className="text-2xl font-black text-white">12</h2>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl text-center">
            <p className="text-green-400 text-[10px] uppercase font-bold">Wins</p>
            <h2 className="text-2xl font-black text-green-400">08</h2>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-2xl text-center">
            <p className="text-red-400 text-[10px] uppercase font-bold">Losses</p>
            <h2 className="text-2xl font-black text-red-400">04</h2>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl text-center">
            <p className="text-blue-400 text-[10px] uppercase font-bold">Win Rate</p>
            <h2 className="text-2xl font-black text-blue-400">66%</h2>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 space-y-4 pb-4">
          <h3 className="text-white font-bold px-2 mt-4">Past Match Records</h3>
          
          {matches.map((match) => (
            <div key={match.id} className="group bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center hover:bg-white/20 transition-all border-l-8 shadow-lg" 
                 style={{ borderLeftColor: match.result === "Won" ? "#4ade80" : "#ff6b6b" }}>
              
              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                {/* Result Badge */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xs shadow-inner ${match.result === "Won" ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"}`}>
                  {match.result.toUpperCase()}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-white text-lg font-bold">{match.opponent}</h4>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-tight">{match.tournament} • {match.date}</p>
                  <p className="text-blue-300 font-mono text-sm mt-2">{match.score}</p>
                </div>

                <div className="hidden lg:block text-right px-6 border-r border-white/10">
                  <p className="text-white/40 text-[10px] uppercase font-bold">Man of the Match</p>
                  <p className="text-yellow-400 font-semibold text-sm">🏅 {match.mom}</p>
                </div>

                <div className="flex gap-2">
                  <button className="p-2 bg-white/5 hover:bg-white/20 text-white rounded-lg transition-all">📄 Stats</button>
                  <button className="p-2 bg-white/5 hover:bg-white/20 text-white rounded-lg transition-all">✏️ Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default MatchHistory;