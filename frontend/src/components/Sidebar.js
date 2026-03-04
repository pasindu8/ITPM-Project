import { NavLink } from 'react-router-dom';

function Sidebar() {
  
  // Active ද නැද්ද යන්න මත Class එක වෙනස් කරන Function එක
  const navItemClass = ({ isActive }) => {
    return `flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
      isActive
        ? "bg-white/30 text-white font-bold border border-white/30 shadow-md" // පිටුවේ ඉන්නකොට (Active) පේන විදිහ
        : "text-white/80 hover:bg-white/10 hover:text-white" // වෙන පිටුවක ඉන්නකොට (Inactive) පේන විදිහ
    }`;
  };

  return (
    <div className="w-full md:w-72 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
      <h2 className="text-2xl font-bold text-white text-center mb-6 tracking-wide">Coach Panel</h2>

      <nav className="flex flex-col gap-2">
        <NavLink to="/CoachDashboard" className={navItemClass}>
          <span>🏠</span> Dashboard
        </NavLink>

        <NavLink to="/ScheduleAndConflicts" className={navItemClass}>
          <span>📅</span> Schedule & Conflicts
        </NavLink>

        <NavLink to="/QrAttendance" className={navItemClass}>
          <span>📷</span> QR Attendance
        </NavLink>

        <NavLink to="/PlayerManagement" className={navItemClass}>
          <span>🏃‍♂️</span> Player Management
        </NavLink>

        <NavLink to="/SendAlerts" className={navItemClass}>
          <span>📢</span> Send Alerts
        </NavLink>

        <NavLink to="/MatchHistory" className={navItemClass}>
          <span>🏆</span> Match History
        </NavLink>

        <NavLink to="/PerformanceAnalytics" className={navItemClass}>
          <span>📊</span> Performance Analytics
        </NavLink>

        <NavLink to="/TrainingDrillLibrary" className={navItemClass}>
          <span>🎯</span> Training Drill Library
        </NavLink>

        <NavLink to="/ChatCenter" className={navItemClass}>
          <span>💬</span> Chat Center
        </NavLink>

        <NavLink to="/EquipmentInventory" className={navItemClass}>
          <span>📦</span> Equipment Inventory
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;