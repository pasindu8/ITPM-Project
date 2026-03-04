import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';

function EquipmentInventory() {
  const inventory = [
    { id: 1, item: "Cricket Bats (Grade 1)", total: 10, available: 4, condition: "Good" },
    { id: 2, item: "Match Balls (Box of 12)", total: 5, available: 2, condition: "New" },
    { id: 3, item: "Batting Helmets", total: 15, available: 8, condition: "Fair" },
    { id: 4, item: "Practice Nets", total: 4, available: 4, condition: "Good" },
  ];

  const assignments = [
    { id: 101, player: "Nimal Perera", item: "Bat #04", date: "Feb 22", status: "Handed Over" },
    { id: 102, player: "Kasun Silva", item: "Helmet #09", date: "Feb 25", status: "Returned" },
  ];

  return (
    <div 
      className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />

      {/* --- Main Content Section --- */}
      <div className="flex-1 flex flex-col gap-6 overflow-auto px-2">
        
        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white">📦 Equipment & Inventory</h2>
            <p className="text-white/50 text-xs uppercase tracking-widest mt-1">Manage team gear and distribution</p>
          </div>
          <div className="flex gap-2">
             <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/20 transition-all">Audit Log</button>
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-sm">+ Add Item</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- Inventory Stock Table --- */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 px-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Current Stock Levels
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-white/40 text-[10px] uppercase tracking-widest font-black">
                    <th className="px-4 pb-2">Item Name</th>
                    <th className="px-4 pb-2">Total</th>
                    <th className="px-4 pb-2">Available</th>
                    <th className="px-4 pb-2">Condition</th>
                    <th className="px-4 pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {inventory.map((item) => (
                    <tr key={item.id} className="bg-white/5 hover:bg-white/10 transition-colors group">
                      <td className="p-4 rounded-l-2xl font-bold text-sm">{item.item}</td>
                      <td className="p-4 text-sm">{item.total}</td>
                      <td className="p-4">
                         <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${item.available < 3 ? 'text-red-400' : 'text-green-400'}`}>{item.available}</span>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(item.available/item.total)*100}%` }}></div>
                            </div>
                         </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-[10px] uppercase font-bold border border-white/10">{item.condition}</span>
                      </td>
                      <td className="p-4 rounded-r-2xl text-center">
                        <button className="text-white/40 hover:text-white transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Distribution / Hand-over List --- */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl flex flex-col">
            <h3 className="text-white font-bold mb-6 px-2">Assignments</h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {assignments.map((asgn) => (
                <div key={asgn.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 relative group overflow-hidden">
                  <div className={`absolute top-0 right-0 w-1 h-full ${asgn.status === 'Handed Over' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold text-sm">{asgn.player}</h4>
                    <span className="text-[10px] text-white/40 font-mono">{asgn.date}</span>
                  </div>
                  <p className="text-white/60 text-xs italic">Borrowed: {asgn.item}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${asgn.status === 'Handed Over' ? 'text-yellow-400 bg-yellow-400/10' : 'text-green-400 bg-green-400/10'}`}>
                      {asgn.status}
                    </span>
                    <button className="text-[10px] text-blue-300 font-bold hover:underline">Update Status</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-white text-blue-900 font-bold rounded-2xl shadow-xl hover:bg-blue-50 transition-all active:scale-95">
               Assign New Item
            </button>
          </div>

        </div>

        {/* Maintenance Alert */}
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
           <div className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center animate-bounce">⚠️</div>
           <div>
              <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider">Maintenance Required</h4>
              <p className="text-white/70 text-sm">2 Practice Nets are in "Fair" condition. Recommend repair before next tournament.</p>
           </div>
        </div>

      </div>
    </div>
  );
}

export default EquipmentInventory;