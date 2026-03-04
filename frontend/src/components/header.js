
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
    // z-50 නිසා අනිත් හැමදේටම වඩා මේක උඩින් පේනවා. fixed නිසා උඩටම ඇලිලා තියෙනවා
    <header className="fixed top-0 left-0 right-0 z-50 p-2 bg-transparent shadow-lg backdrop-blur-md border border-white/20">
      <nav className="max-w-7xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex justify-between items-center shadow-2xl">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
           {/* ඔයාගේ Logo එක තියෙනවා නම් මේක පාවිච්චි කරන්න */}
           {/* <img src={headerlogo} alt="Logo" className="h-10 w-auto object-contain" /> */}
           
           {/* Logo එක නැති වෙලාවට පේන්න ලස්සන Text එකක් */}
           <div className="flex items-center gap-2 cursor-pointer">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">S</span>
              <span className="text-xl font-black text-white tracking-widest uppercase">SportsPro</span>
           </div>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center gap-2 m-0 p-0 list-none">
          <li>
            <NavLink to="/" end className={navItemClass}>
              Home
            </NavLink>
          </li>
          
          {!isLoggedIn && (
            <>
              <li>
                <NavLink to="/login" className={navItemClass}>
                  Login
                </NavLink>
              </li>
              <li className="ml-2">
                <NavLink to="/register" className={signUpClass}>
                  Sign Up
                </NavLink>
              </li>
            </>
          )}

          {isLoggedIn && (
            <li className="ml-2">
              <NavLink 
                to="/logout" 
                className="px-5 py-2 rounded-xl font-bold transition-all duration-300 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white shadow-lg"
              >
                Logout
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;