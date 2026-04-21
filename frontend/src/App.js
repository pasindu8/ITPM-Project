import "./styles/loading.css";
import "./styles/App.css";

import Footer from "./components/footer.js";
import Header from "./components/header.js";
import Loader from "./components/Loader.js";

import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';

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
import NextRegisterCoach from "./pages/NextRegisterCoach.js";
import GradeSession from "./pages/GradeSession.js";
import LecturerDashboard from "./pages/LecturerDashboard.js";
import SubjectManagement from "./pages/SubjectManagement.js";
import CourseMaterials from "./pages/CourseMaterials.js";
import StudentMarks from "./pages/StudentMarks.js";
import LecturerScheduleAndConflicts from "./pages/LecturerScheduleAndConflicts.js";
import { getStoredToken, isTokenValid, clearAuthStorage } from "./utils/auth";

import Appointments from "./pages/Appointments.js";
import DoctorDashboard from "./pages/DoctorDashboard.js";
import InjuryReportForm from "./pages/InjuryReportForm.js";
import InjuryReports from "./pages/InjuryReports.js";
import RecoveryPlans from "./pages/RecoveryPlans.js";
import MedicalProfile from "./pages/MedicalProfile.js";
import MedicalClearance from "./pages/MedicalClearance.js";
import FollowUpTracker from "./pages/FollowUpTracker.js";
import TreatmentLog from "./pages/TreatmentLog.js";
import EmergencyReferrals from "./pages/EmergencyReferrals.js";

import React, { useEffect, useState } from 'react';

// Title එක වෙනස් කරන Logic එක මෙතන තියෙන්නේ
const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'SmartSport | Welcome',
      '/login': 'SmartSport | Login',
      '/register': 'SmartSport | Register',
      '/Dashboard': 'SmartSport | Dashboard',
      '/CoachDashboard': 'SmartSport | Coach Dashboard',
      '/ScheduleAndConflicts': 'SmartSport | Schedule & Conflicts',
      '/EquipmentInventory': 'SmartSport | Equipment & Inventory',
      '/SendAlerts': 'SmartSport | Send Alerts',
      '/PlayerManagement': 'SmartSport | Players',
      '/QrAttendance': 'SmartSport | Attendance',
      '/PerformanceAnalytics': 'SmartSport | Analytics',
      '/MatchHistory': 'SmartSport | Match Records',
      '/LecturerDashboard': 'SmartSport | Lecturer Dashboard',
      '/SubjectManagement': 'SmartSport | Subject Management',
      '/CourseMaterials': 'SmartSport | Course Materials',
      '/StudentMarks': 'SmartSport | Student Marks',
      '/LecturerScheduleAndConflicts': 'SmartSport | Lecturer Schedule',
      '/MedicalProfile': 'SmartSport | Medical Profiles',
      '/MedicalClearance': 'SmartSport | Medical Clearance',
      '/FollowupTracker': 'SmartSport | Follow-Up Tracker',
      '/TreatmentLog': 'SmartSport | Treatment Log',
      '/EmergencyReferrals': 'SmartSport | Emergency Referrals'
    };

    document.title = titles[location.pathname] || 'SmartSport';
  }, [location]);

  return null; 
};

const ProtectedRoute = ({ children, allowedTypes }) => {
  const token = getStoredToken();
  const isAuthenticated = isTokenValid(token);
  const type = localStorage.getItem("type"); 

  if (!isAuthenticated) {
    clearAuthStorage();
    return <Navigate to="/login" replace />; 
  }

  if (allowedTypes && !allowedTypes.includes(type)) {
    if (type === "user") return <Navigate to="/Dashboard" />;
    if (type === "coach") return <Navigate to="/CoachDashboard" />;
    if (type === "doctor") return <Navigate to="/DoctorDashboard" />;
    if (type === "lecturer") return <Navigate to="/LecturerDashboard" />;
    
    return <Navigate to="/" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = getStoredToken();
  const isAuthenticated = isTokenValid(token);
  const types = localStorage.getItem("type");

  if (!isAuthenticated && token) {
    clearAuthStorage();
  }

  if (isAuthenticated && (types === "user")) {
    return <Navigate to="/Dashboard" />;
  }
  else if (isAuthenticated && (types === "coach")) {
    return <Navigate to="/CoachDashboard" />;
  }
  else if (isAuthenticated && (types === "doctor")) {
    return <Navigate to="/DoctorDashboard" />;
  }
  else if (isAuthenticated && (types === "lecturer")) {
    return <Navigate to="/LecturerDashboard" />;
  }

  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isDashboard = location.pathname === "/Dashboard"; // ✅ CHANGED: Only Dashboard.js page

  const hideHeaderFooter = isHomePage || isDashboard; // ✅ CHANGED: Hide on Home and Dashboard only

  useEffect(() => {
    const publicPaths = [
      "/",
      "/login",
      "/register",
      "/nextRegisterCoach",
      "/nextRegisterSTU",
      "/verification",
      "/forgotpassword",
      "/adminregister",
      "/logout"
    ];

    const validateSession = () => {
      const token = getStoredToken();

      if (!token) {
        return;
      }

      if (!isTokenValid(token)) {
        clearAuthStorage();

        if (!publicPaths.includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
      }
    };

    validateSession();
    const intervalId = setInterval(validateSession, 30000);

    return () => clearInterval(intervalId);
  }, [location.pathname, navigate]);

 useEffect(() => {
  document.title = "Loading . . .";
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div id="myDiv">
          <TitleUpdater />
          {!hideHeaderFooter && <Header />} {/* ✅ CHANGED */}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }/>
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/nextRegisterCoach" element={
              <PublicRoute>
                <NextRegisterCoach />
              </PublicRoute>
            } />
            <Route path="/nextRegisterSTU" element={
              <PublicRoute >
                <NextregisterSTU />
              </PublicRoute>
            } />
            <Route path="/verification" element={
              <PublicRoute>
                <Verification />
              </PublicRoute>
            } />
            <Route path="/forgotpassword" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/logout" element={<Logout />} />
            <Route path="/adminregister" element={
              <PublicRoute>
                <AdminRegister />
              </PublicRoute>
            } />
            <Route path="/Profile" element={
              <ProtectedRoute allowedTypes={["user", "coach", "doctor", "lecturer"]}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/Dashboard" element={
              <ProtectedRoute allowedTypes={["user"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/CoachDashboard" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <CoachDashboard />
              </ProtectedRoute>
            } />
            <Route path="/ScheduleAndConflicts" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <ScheduleAndConflicts />
              </ProtectedRoute>
            } />
            <Route path="/QrAttendance" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <QrAttendance />
              </ProtectedRoute>
            } />
            <Route path="/QrAttendance/:sessionId" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <QrAttendance />
              </ProtectedRoute>
            } />
            <Route path="/PlayerManagement" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <PlayerManagement />
              </ProtectedRoute>
            } />
            <Route path="/SendAlerts" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <SendAlerts />
              </ProtectedRoute>
            } />
            <Route path="/PerformanceAnalytics" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <PerformanceAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/TrainingDrillLibrary" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <TrainingDrillLibrary />
              </ProtectedRoute>
            } />
            <Route path="/MatchHistory" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <MatchHistory />
              </ProtectedRoute>
            } />
            <Route path="/EquipmentInventory" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <EquipmentInventory />
              </ProtectedRoute>
            } />
            <Route path="/AddSessionModal" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <AddSessionModal />
              </ProtectedRoute>
            } />
            <Route path="/LineupOptimizer" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <LineupOptimizer />
              </ProtectedRoute>
            } />
            <Route path="/MatchScouter" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <MatchScouter />
              </ProtectedRoute>
            } />
            <Route path="/MatchSummary/:sessionId" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                <MatchSummary />
              </ProtectedRoute>
            } />
            <Route path="/grade-session/:sessionId" element={
              <ProtectedRoute allowedTypes={["coach"]}>
                 <GradeSession />
              </ProtectedRoute>
            } />
            <Route path="/Appointments" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/DoctorDashboard" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/Injuryreportform" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <InjuryReportForm />
              </ProtectedRoute>
            } />
            <Route path="/Injuryreports" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <InjuryReports />
              </ProtectedRoute>
            } />
            <Route path="/Recoveryplans" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <RecoveryPlans />
              </ProtectedRoute>
            } />
            <Route path="/MedicalProfile" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <MedicalProfile />
              </ProtectedRoute>
            } />
            <Route path="/MedicalClearance" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <MedicalClearance />
              </ProtectedRoute>
            } />
            <Route path="/FollowupTracker" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <FollowUpTracker />
              </ProtectedRoute>
            } />
            <Route path="/TreatmentLog" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <TreatmentLog />
              </ProtectedRoute>
            } />
            <Route path="/EmergencyReferrals" element={
              <ProtectedRoute allowedTypes={["doctor"]}>
                 <EmergencyReferrals />
              </ProtectedRoute>
            } />
            

            <Route path="/LecturerDashboard" element={
              <ProtectedRoute allowedTypes={["lecturer"]}>
                <LecturerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/SubjectManagement" element={
              <ProtectedRoute allowedTypes={["lecturer"]}>
                <SubjectManagement />
              </ProtectedRoute>
            } />
            <Route path="/CourseMaterials" element={
              <ProtectedRoute allowedTypes={["lecturer"]}>
                <CourseMaterials />
              </ProtectedRoute>
            } />
            <Route path="/StudentMarks" element={
              <ProtectedRoute allowedTypes={["lecturer"]}>
                <StudentMarks />
              </ProtectedRoute>
            } />
            <Route path="/LecturerScheduleAndConflicts" element={
              <ProtectedRoute allowedTypes={["lecturer"]}>
                <LecturerScheduleAndConflicts />
              </ProtectedRoute>
            } />
          </Routes>

          {!hideHeaderFooter && <Footer />} {/* ✅ CHANGED */}
        </div>
      )}
    </div>
  );
}

export default App;