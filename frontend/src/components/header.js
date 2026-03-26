
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoMain from "../assets/logo1v3.png";
import "../styles/header.css"; 

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // සාමාන්‍ය Link එකකට දෙන Style එක (Active නම් නිල් පාට වෙනවා, නැත්නම් සාමාන්‍ය විදිහට පේනවා)
  const navItemClass = ({ isActive }) => 
    `px-5 py-2 rounded-xl font-semibold transition-all duration-300 ${
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  // Sign Up එකට වෙනස් පෙනුමක් දෙන්න (Border එකක් එක්ක)
  const signUpClass = ({ isActive }) => 
    `px-5 py-2 rounded-xl font-bold transition-all duration-300 border ${
      isActive 
        ? "bg-white text-blue-900 border-white shadow-lg" 
        : "bg-transparent text-white border-white/30 hover:bg-white/20"
    }`;

  return (
    <header>
      <div className="header-inner">

        <a href="#" className="logo">
          <div className="logo-icon">
            <img
              src={logoMain}
              alt="SmartSport logo"
              style={{ width: "40px", height: "40px", objectFit: "contain", backgroundColor: "#ffffff", borderRadius: "50%" }}
            />
          </div>
          <span className="logo-text">Smart<span>Sport</span></span>
        </a>

        
        <div className="header-actions">

          {!isLoggedIn && (
            <>
              <li>
                <NavLink to="/login" className="login-btn">
                  Login
                </NavLink>
              </li>
            </>
          )}

          {isLoggedIn && (
            <>
            <div className="notif-wrapper">
            <button className="notif-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notif-badge"></span>
            </button>

            <div className="notif-dropdown">
              <div className="notif-header">Notifications</div>

              <div className="notif-item">
                <span className="notif-dot new"></span>
                <div>
                  <div className="notif-msg">Your match analysis for <strong>Chelsea vs Arsenal</strong> is ready.</div>
                  <div className="notif-time">2 minutes ago</div>
                </div>
              </div>

              <div className="notif-item">
                <span className="notif-dot new"></span>
                <div>
                  <div className="notif-msg"><strong>Live now:</strong> NBA — Lakers vs Heat. Score update available.</div>
                  <div className="notif-time">10 minutes ago</div>
                </div>
              </div>

              <div className="notif-item">
                <span className="notif-dot read"></span>
                <div>
                  <div className="notif-msg">Your weekly performance report has been generated.</div>
                  <div className="notif-time">Yesterday</div>
                </div>
              </div>
            </div>
          </div>
            <li>
              <NavLink to="/logout" className="login-btn">
                Logout
              </NavLink>
            </li>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

export default Header;