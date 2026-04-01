import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';

const GradeSession = ({ isOpen, onClose, sessionId, team }) => {
    const navigate = useNavigate();
    const { sessionId: routeSessionId } = useParams();

    const effectiveSessionId = sessionId || routeSessionId;
    const shouldRender = typeof isOpen === 'boolean' ? isOpen : Boolean(routeSessionId);

    const [formData, setFormData] = useState({
        studentId: '',
        score: '5',
        effort: 'Average',
        technique: 'Good',
        tacticalAwareness: 'Average',
        stamina: 'High',
        focus: 'Focused',
        teamwork: 'Good',
        discipline: 'Excellent',
        feedback: ''
    });

    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    useEffect(() => {
        if (!shouldRender) return;

        const fetchStudents = async () => {
            if (!effectiveSessionId) {
                setStudents([]);
                return;
            }

            try {
                setStudentsLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/performance/students/${effectiveSessionId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `${token}`
                    }
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to load students');
                }

                setStudents(result.data || []);
            } catch (error) {
                setStudents([]);
                Swal.fire({
                    icon: 'error',
                    title: 'Student Load Failed',
                    text: error.message
                });
            } finally {
                setStudentsLoading(false);
            }
        };

        fetchStudents();
    }, [shouldRender, effectiveSessionId, team]);

    useEffect(() => {
        if (!shouldRender) return;

        document.body.classList.add('hide-app-header');

        return () => {
            document.body.classList.remove('hide-app-header');
        };
    }, [shouldRender]);

    const handleClose = () => {
        if (typeof onClose === 'function') {
            onClose();
            return;
        }

        navigate('/ScheduleAndConflicts');
    };

    if (!shouldRender) return null;

    const handleChange = (event) => {
        setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!effectiveSessionId) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Session ID not found.' });
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/performance/add-grade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    sessionId: effectiveSessionId
                })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit grade');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Performance Saved!',
                confirmButtonText: 'OK'
            });

            handleClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        }
    };

    const labelClass = 'text-[#dbeafe] text-[11px] uppercase tracking-wide mb-1.5 block font-semibold';
    const fieldClass = 'w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white focus:bg-white/25 transition-all [&>option]:text-black';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[200] p-4">
            <div className="w-[1200px] h-[500px] rounded-[2rem] shadow-2xl border border-[#8fb2ff]/40 bg-gradient-to-br from-[#4b84ea] via-[#3d73dd] to-[#2f60c7]">
                <div className="flex justify-between items-center pt-4 pb-4 pl-6 pr-6 border-b border-white/20 bg-white/5">
                    <div>
                        <h2 className="text-[20px] font-black text-white leading-none">Student Performance Grading</h2>
                        <p className="text-[#dbeafe] text-sm mt-2">Evaluate training impact with technical, tactical, and mindset metrics.</p>
                    </div>
                    <button onClick={handleClose} className="text-white/60 hover:text-white text-3xl transition-colors" aria-label="Close grading modal">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-3 md:p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <section className="bg-white/10 p-2 rounded-2xl border border-white/20 shadow-lg shadow-blue-900/10">
                            <h3 className="text-[#e0edff] text-[15px] font-extrabold mb-2 uppercase tracking-wide">General Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Student Name</label>
                                    <select name="studentId" value={formData.studentId} onChange={handleChange} required className={fieldClass}>
                                        <option value="">{studentsLoading ? 'Loading students...' : '-- Choose Student --'}</option>
                                        {students.map((student) => (
                                            <option key={student._id} value={student._id}>
                                                {student.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Overall Rating (1-10)</label>
                                    <select name="score" value={formData.score} onChange={handleChange} className={fieldClass}>
                                        {[...Array(10)].map((_, index) => (
                                            <option key={index + 1} value={index + 1}>
                                                {index + 1} - {index < 5 ? 'Needs Work' : index < 8 ? 'Good' : 'Elite'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Teamwork</label>
                                    <select name="teamwork" value={formData.teamwork} onChange={handleChange} className={fieldClass}>
                                        <option value="Good">Great Team Player</option>
                                        <option value="Neutral">Individualistic</option>
                                        <option value="Needs Improvement">Needs to Cooperate</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white/10 p-2 rounded-2xl border border-white/20 shadow-lg shadow-blue-900/10">
                            <h3 className="text-[#e0edff] text-[15px] font-extrabold mb-2 uppercase tracking-wide">Technical Evaluation</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Effort Level</label>
                                    <select name="effort" value={formData.effort} onChange={handleChange} className={fieldClass}>
                                        <option value="High">High (Very Active)</option>
                                        <option value="Average">Average</option>
                                        <option value="Low">Low (Passive)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Technique/Skill</label>
                                    <select name="technique" value={formData.technique} onChange={handleChange} className={fieldClass}>
                                        <option value="Excellent">Excellent</option>
                                        <option value="Good">Good</option>
                                        <option value="Developing">Developing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Tactical Awareness</label>
                                    <select name="tacticalAwareness" value={formData.tacticalAwareness} onChange={handleChange} className={fieldClass}>
                                        <option value="Excellent">Excellent</option>
                                        <option value="Average">Average</option>
                                        <option value="Developing">Developing</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white/10 p-2 rounded-2xl border border-white/20 shadow-lg shadow-blue-900/10">
                            <h3 className="text-[#e0edff] text-[15px] font-extrabold mb-2 uppercase tracking-wide">Physical & Mindset</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Stamina/Endurance</label>
                                    <select name="stamina" value={formData.stamina} onChange={handleChange} className={fieldClass}>
                                        <option value="High">Strong</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Poor">Fatigued Quickly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Focus & Concentration</label>
                                    <select name="focus" value={formData.focus} onChange={handleChange} className={fieldClass}>
                                        <option value="Focused">Focused</option>
                                        <option value="Average">Distracted at times</option>
                                        <option value="Poor">Unfocused</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Discipline</label>
                                    <select name="discipline" value={formData.discipline} onChange={handleChange} className={fieldClass}>
                                        <option value="Excellent">Very Disciplined</option>
                                        <option value="Good">Follows Rules</option>
                                        <option value="Fair">Occasional Issues</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/20">
                        <button type="button" onClick={handleClose} className="text-[#dbeafe] hover:text-white underline underline-offset-4 transition-colors font-semibold text-[15px]">
                            Cancel
                        </button>
                        <button type="submit" className="bg-[#e8edf9] hover:bg-white text-[#356edd] px-5 py-3 rounded-2xl font-black text-[15px] shadow-lg transition-all transform active:scale-95">
                            Submit Grade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GradeSession;
