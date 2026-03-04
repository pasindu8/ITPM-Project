import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';

function ChatCenter() {
  const contacts = [
    { id: 1, name: "Cricket Team Group", lastMsg: "Tomorrow's practice at 4PM", time: "10:30 AM", unread: 5, isGroup: true },
    { id: 2, name: "Nimal Perera", lastMsg: "Coach, I have a small injury", time: "9:15 AM", unread: 0, isGroup: false },
    { id: 3, name: "Kasun Silva", lastMsg: "Sent the fitness report", time: "Yesterday", unread: 1, isGroup: false },
  ];

  return (
    <div 
      className="min-h-screen w-full flex flex-col md:flex-row bg-cover bg-center bg-no-repeat p-4 gap-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />

      {/* --- Main Chat Interface --- */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 h-[calc(100vh-2rem)] overflow-hidden">
        
        {/* --- Left Side: Contacts List --- */}
        <div className="w-full md:w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {contacts.map((contact) => (
              <div key={contact.id} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${contact.id === 1 ? 'bg-white/20 border border-white/20' : 'hover:bg-white/5'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${contact.isGroup ? 'bg-blue-600' : 'bg-gradient-to-tr from-purple-500 to-pink-500'}`}>
                  {contact.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-semibold text-sm truncate">{contact.name}</h4>
                    <span className="text-[10px] text-white/40">{contact.time}</span>
                  </div>
                  <p className="text-white/60 text-xs truncate mt-0.5">{contact.lastMsg}</p>
                </div>
                {contact.unread > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                    {contact.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Right Side: Active Chat Window --- */}
        <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center px-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">C</div>
              <div>
                <h3 className="text-white font-bold text-sm">Cricket Team Group</h3>
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">24 Members Online</span>
              </div>
            </div>
            <div className="text-white/40 cursor-pointer hover:text-white transition-all text-xl">⋮</div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar flex flex-col">
            
            {/* Incoming Message */}
            <div className="flex flex-col items-start max-w-[80%]">
              <span className="text-white/40 text-[10px] ml-4 mb-1">Nimal Perera • 10:30 AM</span>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white p-4 rounded-2xl rounded-tl-none shadow-lg">
                Coach, will we have practice if it rains tomorrow? 🌧️
              </div>
            </div>

            {/* Outgoing Message (Coach) */}
            <div className="flex flex-col items-end max-w-[80%] self-end">
              <span className="text-white/40 text-[10px] mr-4 mb-1">You • 10:32 AM</span>
              <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-xl border border-blue-400/30">
                Yes, if it rains, we will move to the indoor nets. Be ready by 4:00 PM sharp! 🏏
              </div>
            </div>

            {/* System Notification */}
            <div className="self-center bg-white/5 px-4 py-1 rounded-full border border-white/10 text-[10px] text-white/40 uppercase tracking-widest">
              Today
            </div>

          </div>

          {/* Chat Input Area */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            <form className="flex gap-3">
              <button type="button" className="w-12 h-12 rounded-xl bg-white/10 text-white text-xl hover:bg-white/20 transition-all">+</button>
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-6 py-2 text-white outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold shadow-lg transition-all active:scale-95">
                Send
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ChatCenter;