import bgImage from '../assets/6903344.jpg';
import Sidebar from '../components/Sidebar.js';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function TrainingDrillLibrary() {
    const [drills, setDrills] = useState([]);
    const [filteredDrills, setFilteredDrills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Drills');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchDrills();
    }, []);

    useEffect(() => {
        filterDrills();
    }, [selectedCategory, searchQuery, drills]);

    const fetchDrills = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch('http://localhost:5000/drills/all', {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            });
            const result = await res.json();
            if (res.ok) {
                setDrills(result.data);
                setFilteredDrills(result.data);
            } else {
                console.error("Failed to fetch drills");
            }
        } catch (error) {
            console.error("Error fetching drills:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterDrills = () => {
        let filtered = drills;

        // Filter by category
        if (selectedCategory !== 'All Drills') {
            filtered = filtered.filter(drill => drill.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(drill => 
                drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                drill.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredDrills(filtered);
    };

    const handleAddDrill = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Training Drill',
            html: `
                <input type="text" id="title" class="swal2-input" placeholder="Drill Title">
                <select id="category" class="swal2-input">
                    <option value="" disabled selected>Category</option>
                    <option value="Batting">Batting</option>
                    <option value="Bowling">Bowling</option>
                    <option value="Fielding">Fielding</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Tactics">Tactics</option>
                </select>
                <input type="text" id="duration" class="swal2-input" placeholder="Duration (e.g., 20 min)">
                <select id="intensity" class="swal2-input">
                    <option value="" disabled selected>Intensity</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <textarea id="description" class="swal2-textarea" placeholder="Description"></textarea>
                <input type="text" id="videoUrl" class="swal2-input" placeholder="Video URL (optional)">
            `,
            confirmButtonText: 'Add Drill',
            focusConfirm: false,
            preConfirm: () => {
                const title = Swal.getPopup().querySelector('#title').value;
                const category = Swal.getPopup().querySelector('#category').value;
                const duration = Swal.getPopup().querySelector('#duration').value;
                const intensity = Swal.getPopup().querySelector('#intensity').value;
                const description = Swal.getPopup().querySelector('#description').value;
                const videoUrl = Swal.getPopup().querySelector('#videoUrl').value;

                if (!title || !category || !duration || !intensity) {
                    Swal.showValidationMessage('Please fill in all required fields');
                    return false;
                }

                return { title, category, duration, intensity, description, videoUrl };
            }
        });

        if (formValues) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/drills/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${token}`
                    },
                    body: JSON.stringify(formValues),
                });

                const result = await res.json();

                if (!res.ok) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: result.message || 'Failed to add drill'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Drill added successfully'
                    });
                    fetchDrills();
                }
            } catch (error) {
                console.error("Error adding drill:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while adding the drill'
                });
            }
        }
    };

    const handleDeleteDrill = async (drillId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/drills/delete/${drillId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `${token}`
                    }
                });

                if (res.ok) {
                    Swal.fire('Deleted!', 'Drill has been deleted.', 'success');
                    fetchDrills();
                } else {
                    Swal.fire('Error', 'Failed to delete drill', 'error');
                }
            } catch (error) {
                console.error("Error deleting drill:", error);
                Swal.fire('Error', 'An error occurred', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 md:w-64 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button 
                            onClick={handleAddDrill}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95">
                            + Add New
                        </button>
                    </div>
                </div>

                {/* Categories Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['All Drills', 'Batting', 'Bowling', 'Fielding', 'Fitness', 'Tactics'].map((cat) => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-4 py-2 border rounded-full text-sm transition-all ${
                                selectedCategory === cat 
                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                    : 'bg-white/5 hover:bg-white/20 border-white/10 text-white/80'
                            }`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Drills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDrills.length > 0 ? (
                        filteredDrills.map((drill) => (
                            <div key={drill._id} className="group bg-white/10 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-b-4 border-b-blue-500">
                                {/* Video Placeholder / Image */}
                                <div className="relative h-44 bg-black/40 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <span className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tighter">
                                        {drill.category}
                                    </span>
                                    {drill.videoUrl ? (
                                        <a href={drill.videoUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white text-xl hover:scale-110 transition-transform">
                                            ▶
                                        </a>
                                    ) : (
                                        <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white/40 text-xl">
                                            📹
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteDrill(drill._id)}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-full flex items-center justify-center text-white text-sm transition-all z-10">
                                        ×
                                    </button>
                                </div>

                                {/* Drill Content */}
                                <div className="p-6">
                                    <h3 className="text-white text-lg font-bold mb-3">{drill.title}</h3>
                                    {drill.description && (
                                        <p className="text-white/60 text-xs mb-3 line-clamp-2">{drill.description}</p>
                                    )}
                                    <div className="flex justify-between items-center text-white/60 text-xs border-t border-white/10 pt-4">
                                        <div className="flex items-center gap-1">
                                            <span>⏱</span> {drill.duration}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>🔥</span> 
                                            <span className={drill.intensity === "High" ? "text-red-400" : drill.intensity === "Low" ? "text-green-400" : "text-yellow-400"}>
                                                {drill.intensity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <p className="text-white/50 text-lg">No drills found. Add your first drill!</p>
                        </div>
                    )}
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