import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';

function TrainingDrillLibrary() {
    const drills = [
      { id: 1, title: "Cover Drive Mastery", category: "Batting", duration: "20 min", intensity: "Medium", video: "https://img.youtube.com/vi/placeholder1/0.jpg" },
      { id: 2, title: "Fast Bowling Accuracy", category: "Bowling", duration: "30 min", intensity: "High", video: "https://img.youtube.com/vi/placeholder2/0.jpg" },
      { id: 3, title: "Slip Catching Drills", category: "Fielding", duration: "15 min", intensity: "Low", video: "https://img.youtube.com/vi/placeholder3/0.jpg" },
      { id: 4, title: "Agility Ladder Work", category: "Fitness", duration: "10 min", intensity: "High", video: "https://img.youtube.com/vi/placeholder4/0.jpg" },
    ];

    return (
        <div 
            className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <Sidebar/>

            {/* --- Main Content Section --- */}
            <div className="flex-1 flex flex-col gap-4 overflow-auto px-2">
                
                {/* Header with Search */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-white">📂 Training Drill Library</h2>
                        <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Manage your coaching resources</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search drills..." 
                            className="flex-1 md:w-64 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95">
                            + Add New
                        </button>
                    </div>
                </div>

                {/* Categories Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['All Drills', 'Batting', 'Bowling', 'Fielding', 'Fitness', 'Tactics'].map((cat) => (
                        <button key={cat} className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full text-white/80 text-sm transition-all">
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Drills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drills.map((drill) => (
                        <div key={drill.id} className="group bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-b-4 border-b-blue-500">
                            {/* Video Placeholder / Image */}
                            <div className="relative h-44 bg-black/40 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <span className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter">
                                    {drill.category}
                                </span>
                                <button className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white text-xl hover:scale-110 transition-transform">
                                    ▶
                                </button>
                            </div>

                            {/* Drill Content */}
                            <div className="p-6">
                                <h3 className="text-white text-lg font-bold mb-3">{drill.title}</h3>
                                <div className="flex justify-between items-center text-white/60 text-xs border-t border-white/10 pt-4">
                                    <div className="flex items-center gap-1">
                                        <span>⏱</span> {drill.duration}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>🔥</span> 
                                        <span className={drill.intensity === "High" ? "text-red-400" : "text-green-400"}>
                                            {drill.intensity} Intensity
                                        </span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all">
                                    View Full Guide
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Tactics Note Area */}
                <div className="mt-4 bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-6 flex items-start gap-4">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h4 className="text-yellow-400 font-bold text-sm">Coach's Pro Tip</h4>
                        <p className="text-white/70 text-sm italic mt-1 leading-relaxed">
                            "Remember to focus on the 'Fast Bowling Accuracy' drill during the rainy season sessions in the indoor nets. It helps students maintain their line and length when the pitch is faster."
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TrainingDrillLibrary;