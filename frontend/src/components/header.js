import headerlogo from '../assets/logo1.png';
import { NavLink  } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);


  return (
    <header>
      <nav>
        {/* <img src={headerlogo} alt="Logo" width="240" height="51.5" className="logoimg" /> */}
        <ul>
          <li>
            <NavLink 
              to="/"
              end
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#ff6f61" : "#333333",
              })}
            >
              Home
            </NavLink >
          </li>
          
          {!isLoggedIn && (
            <>

          <li>
            <NavLink
              to="/login"
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#ff6f61" : "#333333",
              })}
            >
              Login
            </NavLink >
          </li>
          <li>
            <NavLink
              to="/register"
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#ff6f61" : "#333333",
              })}
            >
              Sign Up
            </NavLink >
            </li>
            
            </>
          )}
           {isLoggedIn && (
            <li>
            <NavLink
              to="/logout"
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#ff6f61" : "#333333",
              })}
            >
              Logout
            </NavLink >
          </li>
          )}

        </ul>
      </nav>
    </header>
  );
}

export default Header;
