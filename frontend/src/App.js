import "./styles/loading.css";
import "./styles/App.css";

import Footer from "./components/footer.js";
import Header from "./components/header.js";

import { Route, Routes } from "react-router-dom";

import Home from "./pages/home.js";
import Login from "./pages/login.js";
import Register from "./pages/register.js";
import Verification from "./pages/verification.js";
import ForgotPassword from "./pages/forgotpassword.js";
import Logout from "./pages/logout.js";
 
import { useEffect, useState } from "react";


function App() {
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <div className="loader">
            <div className="pl">
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__dot"></div>
            <div className="pl__text">Loading…</div>
            </div>
        </div>
      ) : (
        <div id="myDiv">
          <Header />
          <br />
          <br />
          <br />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
          <Footer />
        </div>
      )}
    </div>
  );
}

export default App;
