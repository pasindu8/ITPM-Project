import "./styles/loading.css";
import "./styles/App.css";

import Footer from "./components/footer.js";
import Header from "./components/header.js";

import { Route, Routes } from "react-router-dom";

import Home from "./pages/home.js";
import Login from "./pages/login.js";
import Register from "./pages/register.js";
import AdminRegister from "./pages/AdminRegister.js";
import Verification from "./pages/verification.js";
import ForgotPassword from "./pages/forgotpassword.js";
import Logout from "./pages/logout.js";
import Profile from "./pages/Profile.js";
import Dashboard from "./pages/Dashboard.js";
import CoachDashboard from "./pages/CoachDashboard.js";
import ScheduleAndConflicts from "./pages/ScheduleAndConflicts.js";
import QrAttendance from "./pages/QrAttendance.js";
import PlayerManagement from "./pages/PlayerManagement.js";
import SendAlerts from "./pages/SendAlerts.js";
import PerformanceAnalytics from "./pages/PerformanceAnalytics.js";
import TrainingDrillLibrary from "./pages/TrainingDrillLibrary.js";
import MatchHistory from "./pages/MatchHistory.js";
import EquipmentInventory from "./pages/EquipmentInventory.js";
import NextregisterSTU from "./pages/nextRegisterSTU.js";
import AddSessionModal from "./pages/AddSessionModal.js";
import LineupOptimizer from "./pages/LineupOptimizer.js";
import MatchScouter from "./pages/MatchScouter.js";
import MatchSummary from "./pages/MatchSummary.js";
 
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
        <div className="loader" >
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
            <Route path="/adminregister" element={<AdminRegister />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/CoachDashboard" element={<CoachDashboard />} />
            <Route path="/ScheduleAndConflicts" element={<ScheduleAndConflicts />} />
            <Route path="/QrAttendance" element={<QrAttendance />} />
            <Route path="/QrAttendance/:sessionId" element={<QrAttendance />} />
            <Route path="/PlayerManagement" element={<PlayerManagement />} />
            <Route path="/SendAlerts" element={<SendAlerts />} />
            <Route path="/PerformanceAnalytics" element={<PerformanceAnalytics />} />
            <Route path="/TrainingDrillLibrary" element={<TrainingDrillLibrary />} />
            <Route path="/MatchHistory" element={<MatchHistory />} />
            <Route path="/EquipmentInventory" element={<EquipmentInventory />} />
            <Route path="/nextRegisterSTU" element={<NextregisterSTU />} />
            <Route path="/AddSessionModal" element={<AddSessionModal />} />
            <Route path="/LineupOptimizer" element={<LineupOptimizer />} />
            <Route path="/MatchScouter" element={<MatchScouter />} />
            <Route path="/MatchSummary/:sessionId" element={<MatchSummary />} />
          </Routes>
          <Footer />
        </div>
      )}
    </div>
  );
}

export default App;
