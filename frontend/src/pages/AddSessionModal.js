import React, { useState } from 'react';
import Swal from 'sweetalert2';

const AddSessionModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        sessionName: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        recurrence: 'Once',
        team: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleSubmit(event) {
        event.preventDefault();

        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:5000/schedule/add-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}` 
                },
                body: JSON.stringify(formData), 
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to add session");
            }

            Swal.fire({
                icon: "success",
                title: "Session Added Successfully",
                text: result.message,
                confirmButtonText: "OK",
            });

            onClose();
            setFormData({ sessionName: '', location: '', date: '', startTime: '', endTime: '', recurrence: 'Once', team: '', description: '' }); // Reset state
            
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed to Add Session",
                text: error.message,
                confirmButtonText: "OK",
            });
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#4182f9] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">New Training Session</h2>
                    <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <section className="bg-white/10 p-5 rounded-2xl">
                                <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wider">General Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-white/60 text-xs block mb-1">Session Name</label>
                                        <input name="sessionName" value={formData.sessionName} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:border-white/50" placeholder="e.g. Cricket Nets Practice" />
                                    </div>
                                    <div>
                                        <label className="text-white/60 text-xs block mb-1">Location</label>
                                        <input name="location" value={formData.location} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:border-white/50" placeholder="e.g. Main Ground" />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white/10 p-5 rounded-2xl">
                                <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wider">Team</h3>
                                <select name="team" value={formData.team} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:border-white/50">
                                    <option value="" className="text-black">Select Team</option>
                                    <option value="cricket" className="text-black">Cricket</option>
                                </select>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <section className="bg-white/10 p-5 rounded-2xl">
                                <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wider">Date & Time</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-white/60 text-xs block mb-1">Date</label>
                                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-white/60 text-xs block mb-1">Start Time</label>
                                        <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-white/60 text-xs block mb-1">End Time</label>
                                        <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none" />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white/10 p-5 rounded-2xl">
                                <h3 className="text-white/80 text-sm font-semibold mb-4 uppercase tracking-wider">Description/Notes</h3>
                                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none h-24" placeholder="Additional details..."></textarea>
                            </section>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-black/10 flex justify-between items-center">
                        <button type="button" onClick={onClose} className="text-white/60 hover:text-white underline underline-offset-4">Cancel</button>
                        <div className="flex gap-4">
                            {/* මෙතන type="button" දැමීම අනිවාර්යයි */}
                            <button type="submit" className="bg-white text-[#4182f9] px-8 py-2 rounded-xl font-bold hover:bg-white/90 shadow-lg">Add Session</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSessionModal;