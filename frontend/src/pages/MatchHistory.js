import React, { useState, useEffect } from 'react';
import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';
import Swal from 'sweetalert2';

function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch all match results
  const fetchMatchResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/matchresult/all', {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMatches(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching match results:', error);
      Swal.fire('Error', 'Failed to load match results', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchResults();
  }, []);

  // Add new match result
  const handleAddMatch = async () => {
    const { value: formValues } = await Swal.fire({
      title: '🏆 Add Match Result',
      html: `
        <input id="tournament" class="swal2-input" placeholder="Tournament Name" style="width: 80%;">
        <input id="opponent" class="swal2-input" placeholder="Opponent Team" style="width: 80%;">
        <input id="date" type="date" class="swal2-input" style="width: 80%;">
        <select id="result" class="swal2-input" style="width: 80%;">
          <option value="">Select Result</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
          <option value="Draw">Draw</option>
          <option value="Tie">Tie</option>
        </select>
        <input id="score" class="swal2-input" placeholder="Score (e.g., 154/4 vs 150/8)" style="width: 80%;">
        <input id="mom" class="swal2-input" placeholder="Man of the Match" style="width: 80%;">
        <input id="venue" class="swal2-input" placeholder="Venue (Optional)" style="width: 80%;">
        <textarea id="notes" class="swal2-textarea" placeholder="Notes (Optional)" style="width: 80%;"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Match',
      confirmButtonColor: '#10b981',
      preConfirm: () => {
        return {
          tournament: document.getElementById('tournament').value,
          opponent: document.getElementById('opponent').value,
          date: document.getElementById('date').value,
          result: document.getElementById('result').value,
          score: document.getElementById('score').value,
          mom: document.getElementById('mom').value,
          venue: document.getElementById('venue').value,
          notes: document.getElementById('notes').value
        }
      }
    });

    if (formValues) {
      const { tournament, opponent, date, result, score, mom } = formValues;
      if (!tournament || !opponent || !date || !result || !score || !mom) {
        Swal.fire('Error', 'Please fill all required fields', 'error');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/matchresult/add', {
          method: 'POST',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValues)
        });

        const data = await response.json();
        if (data.success) {
          Swal.fire('Success!', 'Match result added successfully', 'success');
          fetchMatchResults();
        } else {
          Swal.fire('Error', data.message, 'error');
        }
      } catch (error) {
        console.error('Error adding match:', error);
        Swal.fire('Error', 'Failed to add match result', 'error');
      }
    }
  };

  // Delete match result
  const handleDeleteMatch = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete this match result',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/matchresult/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          Swal.fire('Deleted!', 'Match result has been deleted', 'success');
          fetchMatchResults();
        } else {
          Swal.fire('Error', data.message, 'error');
        }
      } catch (error) {
        console.error('Error deleting match:', error);
        Swal.fire('Error', 'Failed to delete match result', 'error');
      }
    }
  };

  // Edit match result
  const handleEditMatch = async (match) => {
    const { value: formValues } = await Swal.fire({
      title: '✏️ Edit Match Result',
      html: `
        <input id="tournament" class="swal2-input" value="${match.tournament}" placeholder="Tournament Name" style="width: 80%;">
        <input id="opponent" class="swal2-input" value="${match.opponent}" placeholder="Opponent Team" style="width: 80%;">
        <input id="date" type="date" class="swal2-input" value="${match.date}" style="width: 80%;">
        <select id="result" class="swal2-input" style="width: 80%;">
          <option value="Won" ${match.result === 'Won' ? 'selected' : ''}>Won</option>
          <option value="Lost" ${match.result === 'Lost' ? 'selected' : ''}>Lost</option>
          <option value="Draw" ${match.result === 'Draw' ? 'selected' : ''}>Draw</option>
          <option value="Tie" ${match.result === 'Tie' ? 'selected' : ''}>Tie</option>
        </select>
        <input id="score" class="swal2-input" value="${match.score}" placeholder="Score" style="width: 80%;">
        <input id="mom" class="swal2-input" value="${match.mom}" placeholder="Man of the Match" style="width: 80%;">
        <input id="venue" class="swal2-input" value="${match.venue || ''}" placeholder="Venue (Optional)" style="width: 80%;">
        <textarea id="notes" class="swal2-textarea" placeholder="Notes (Optional)" style="width: 80%;">${match.notes || ''}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Match',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        return {
          tournament: document.getElementById('tournament').value,
          opponent: document.getElementById('opponent').value,
          date: document.getElementById('date').value,
          result: document.getElementById('result').value,
          score: document.getElementById('score').value,
          mom: document.getElementById('mom').value,
          venue: document.getElementById('venue').value,
          notes: document.getElementById('notes').value
        }
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/matchresult/update/${match._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValues)
        });

        const data = await response.json();
        if (data.success) {
          Swal.fire('Success!', 'Match result updated successfully', 'success');
          fetchMatchResults();
        } else {
          Swal.fire('Error', data.message, 'error');
        }
      } catch (error) {
        console.error('Error updating match:', error);
        Swal.fire('Error', 'Failed to update match result', 'error');
      }
    }
  };

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
          <button 
            onClick={handleAddMatch}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>+</span> Add Match Result
          </button>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center">
            <p className="text-white/50 text-[10px] uppercase font-bold">Total Matches</p>
            <h2 className="text-2xl font-black text-white">{stats.totalMatches}</h2>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl text-center">
            <p className="text-green-400 text-[10px] uppercase font-bold">Wins</p>
            <h2 className="text-2xl font-black text-green-400">{stats.wins}</h2>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-2xl text-center">
            <p className="text-red-400 text-[10px] uppercase font-bold">Losses</p>
            <h2 className="text-2xl font-black text-red-400">{stats.losses}</h2>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl text-center">
            <p className="text-blue-400 text-[10px] uppercase font-bold">Win Rate</p>
            <h2 className="text-2xl font-black text-blue-400">{stats.winRate}%</h2>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 space-y-4 pb-4">
          <h3 className="text-white font-bold px-2 mt-4">Past Match Records</h3>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-10 text-center">
              <p className="text-white/50 text-lg">No match results yet. Add your first match!</p>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match._id} className="group bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center hover:bg-white/20 transition-all border-l-8 shadow-lg" 
                   style={{ borderLeftColor: match.result === "Won" ? "#4ade80" : match.result === "Lost" ? "#ff6b6b" : "#fbbf24" }}>
                
                <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                  {/* Result Badge */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xs shadow-inner ${
                    match.result === "Won" ? "bg-green-500/20 text-green-400 border border-green-500/40" : 
                    match.result === "Lost" ? "bg-red-500/20 text-red-400 border border-red-500/40" :
                    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                  }`}>
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
                    <button 
                      onClick={() => handleEditMatch(match)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition-all">
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteMatch(match._id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-all">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default MatchHistory;