import { NavLink } from 'react-router-dom';

function DoctorSidebar() {
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${isActive
      ? 'bg-white/30 text-white font-bold border border-white/30 shadow-md'
      : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="w-full md:w-72 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
      <h2 className="text-2xl font-bold text-white text-center mb-6 tracking-wide">Doctor Panel</h2>

      <nav className="flex flex-col gap-2">
        <NavLink to="/" className={navItemClass}>
          <span>🏠</span> Home
        </NavLink>

        <NavLink to="/DoctorDashboard" className={navItemClass}>
          <span>📊</span> Dashboard
        </NavLink>

        <NavLink to="/Appointments" className={navItemClass}>
          <span>📅</span> Appointments
        </NavLink>

     

        <NavLink to="/Injuryreports" className={navItemClass}>
          <span>🩺</span> Injury Reports
        </NavLink>

        <NavLink to="/Recoveryplans" className={navItemClass}>
          <span>💪</span> Recovery Plans
        </NavLink>

        <NavLink to="/MedicalProfile" className={navItemClass}>
          <span>🧾</span> Medical Profiles
        </NavLink>

        <NavLink to="/MedicalClearance" className={navItemClass}>
          <span>✅</span> Medical Clearance
        </NavLink>

        <NavLink to="/FollowupTracker" className={navItemClass}>
          <span>📈</span> Follow-Up Tracker
        </NavLink>

        <NavLink to="/TreatmentLog" className={navItemClass}>
          <span>📚</span> Treatment Log
        </NavLink>

        <NavLink to="/EmergencyReferrals" className={navItemClass}>
          <span>🚨</span> Emergency Referrals
        </NavLink>

      </nav>
    </div>
  );
}

export default DoctorSidebar;
