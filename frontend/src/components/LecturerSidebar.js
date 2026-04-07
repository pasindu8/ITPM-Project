import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, ClipboardCheck, CalendarClock, GraduationCap } from 'lucide-react';

function LecturerSidebar() {
  const navItemClass = ({ isActive }) => {
    return `flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
      isActive
        ? 'bg-white/30 text-white font-bold border border-white/30 shadow-md'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;
  };

  return (
    <div className="w-full md:w-72 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
      <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-wide flex items-center justify-center gap-2">
        <GraduationCap size={24} /> Lecturer Panel
      </h2>
      <p className="text-white/60 text-sm text-center mb-4">Academic module controls</p>

      <nav className="flex flex-col gap-2">
        <NavLink to="/LecturerDashboard" className={navItemClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/SubjectManagement" className={navItemClass}>
          <BookOpen size={18} /> Subject Management
        </NavLink>

        <NavLink to="/CourseMaterials" className={navItemClass}>
          <FileText size={18} /> Course Materials
        </NavLink>

        <NavLink to="/StudentMarks" className={navItemClass}>
          <ClipboardCheck size={18} /> Student Marks
        </NavLink>

        <NavLink to="/LecturerScheduleAndConflicts" className={navItemClass}>
          <CalendarClock size={18} /> Schedule & Conflicts
        </NavLink>
      </nav>
    </div>
  );
}

export default LecturerSidebar;
