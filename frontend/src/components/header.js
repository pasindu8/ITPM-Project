
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoMain from "../assets/logo1v3.png";
import "../styles/header.css"; 
import { getStoredToken, isTokenValid, clearAuthStorage } from "../utils/auth";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      const token = getStoredToken();
      const isValid = isTokenValid(token);

      if (!isValid && token) {
        clearAuthStorage();
      }

      setIsLoggedIn(isValid);
    };

    syncAuthState();

    const intervalId = setInterval(syncAuthState, 30000);
    window.addEventListener("storage", syncAuthState);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);


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