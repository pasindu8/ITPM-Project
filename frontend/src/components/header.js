
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