# **SmartSport 🏆**
### **Integrated University Sports & Learning Management System**

> *"Sports. Academics. One Platform. Zero Clashes."*

---

[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-lightgrey?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-blueviolet?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Material UI](https://img.shields.io/badge/Material_UI-MUI-blue?logo=mui&logoColor=white)](https://mui.com/)
[![Google Gemini API](https://img.shields.io/badge/AI-Gemini%20API-orange?logo=google-gemini&logoColor=white)](https://ai.google.dev/)

**SmartSport** is a state-of-the-art Web Application designed to solve a major challenge in university settings: **balancing academic commitments and athletic schedules for student-athletes**. By integrating academic timetables, training schedules, medical recovery workflows, and inventory tracking, SmartSport empowers students, coaches, lecturers, and medical staff to coordinate seamlessly with **Zero Clashes**.

---

## 📋 Table of Contents
1. [Overview](#-overview)
2. [Technology Stack](#-technology-stack)
3. [Key Features & Role-Based Workflows](#-key-features--role-based-workflows)
4. [Project Architecture](#-project-architecture)
5. [Installation & Setup Guide](#-installation--setup-guide)
6. [Core System Workflows](#-core-system-workflows)
7. [Screenshots & Design Philosophy](#-screenshots--design-philosophy)

---

## 📌 Overview
Student-athletes frequently face scheduling conflicts where vital training sessions overlap with lectures or exams. Additionally, coordinating medical clearance, tracking sports equipment inventory, logging player attendance, and updating grades often require multiple disjointed systems. 

**SmartSport** resolves these problems by providing:
*   **Real-time clash detection** between academic timetables and athletic training sessions.
*   **Automated notifications** through Email and WhatsApp.
*   **An end-to-end medical workflow** from injury occurrence to return-to-play clearance.
*   **Academic progress tracking** specifically for student-athletes.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React (v19)** | Declarative, component-based user interface |
| | **Tailwind CSS** & **MUI (Material UI)** | Modern, responsive, and responsive utility styling |
| | **Recharts** | Interactive charts and analytics for player performance |
| | **SweetAlert2** | Premium popups and user-facing notifications |
| | **jsPDF** & **jsPDF-AutoTable** | Dynamic generation of PDF reports (medical, inventory, etc.) |
| **Backend** | **Node.js** & **Express.js (v5)** | High-performance, asynchronous backend routing and API |
| | **MongoDB** & **Mongoose** | Flexible document database for user profiles, lectures, and records |
| | **Multer** | Efficient multipart/form-data parsing for file uploads |
| **Integrations** | **Google Gemini API (`@google/generative-ai`)** | AI features such as lineup optimization and scouting insights |
| | **Custom WhatsApp API Gateway** | Direct WhatsApp notification system to alert students of schedules/clashes |
| | **Nodemailer** | Automatic transactional email dispatching |

---

## 🚀 Key Features & Role-Based Workflows

SmartSport utilizes role-based authorization to tailor workspaces for four key user roles:

### 1. 🎓 Student-Athlete Module
*   **Unified Dashboard**: Tracks class timetables, upcoming matches, training times, and deadlines in one central calendar.
*   **Conflict Resolution**: Notifies athletes when lectures and training sessions clash, letting them notify coaches or lecturers instantly.
*   **Academic Portal**: View subject details, download lecturer-uploaded course materials, and track grades.
*   **Medical Hub**: View customized recovery plans, treatment logs, and return-to-play clearance status.

### 2. 🏋️ Coach Module
*   **Smart Scheduling**: When creating a session, the backend cross-references the student-athletes' academic schedules and flags any potential clashes.
*   **Multi-Channel Alerts**: Send alerts (individual or team-wide) that are automatically delivered to the players' emails and WhatsApp accounts.
*   **QR-Based Attendance**: Generate dynamic session QR codes which players scan to instantly record attendance.
*   **Scouting & Lineup Optimizer**: Leverage AI analytics and Gemini integration to match optimal team lineups and review scouting reports.
*   **Performance Analytics**: Assess player stats via interactive charts, radar graphs, and performance grading.
*   **Equipment Inventory**: Manage available equipment counts, assign them to specific sports, and monitor stock levels.

### 3. 🩺 Medical Officer (Doctor) Module
*   **Dashboard & Appointments**: Organize and schedule check-ups and treatment appointments.
*   **Injury Reporting**: Log injuries, detail affected areas, track severity levels, and map recovery stages.
*   **Treatment Logs & Recovery Plans**: Customize rehabilitative training routines, log treatments, and trace progress.
*   **Return-to-Play Clearance**: Grant official medical clearances once the recovery checklist is successfully completed.
*   **Emergency Referrals & Follow-ups**: Facilitate fast referrals during emergencies and track patient follow-up progress.

### 4. 📖 Lecturer Module
*   **Lecturer Dashboard**: Manage timetables, track classes, and review list of student-athletes in each course.
*   **Course Material Manager**: Add course syllabi, assign files (PDFs, docs, slides), and share materials.
*   **Student Grading**: Add and review student exam marks and assignments.
*   **Schedule Integration**: Ensure make-up lectures do not conflict with pre-scheduled varsity matches.

---

## 📂 Project Architecture

```
ITPM-Project/
├── backend/
│   ├── config/            # Database connection configuration (Mongoose setup)
│   ├── controllers/       # Business logic (Auth, Alerts, Timetables, Sessions, etc.)
│   ├── middleware/        # JWT authorization & error handler middlewares
│   ├── models/            # Mongoose Schemas (User, Student, Coach, Doctor, Train, Alert, etc.)
│   ├── routes/            # API Route definitions mapping to Controllers
│   ├── uploads/           # Storage directory for course materials and report files
│   ├── utils/             # Utility helpers (Send email services, auth storage checks)
│   ├── index.js           # Server entry point
│   └── package.json       # Backend scripts and dependency configurations
└── frontend/
    ├── public/            # Public static assets (HTML template, favicon)
    ├── src/
    │   ├── assets/        # App logos, default profile pictures, and visuals
    │   ├── components/    # Reusable layout components (Header, Footer, Loader)
    │   ├── pages/         # Page components (Dashboards, Login, Injury Reports, etc.)
    │   ├── styles/        # CSS sheets (Tailwind integrations, loaders)
    │   ├── utils/         # Auth checkers, API configuration
    │   ├── App.js         # Core routing system & protected route rules
    │   └── index.js       # Frontend mount point
    ├── package.json       # Frontend scripts and package details
    ├── tailwind.config.js # Tailwind CSS design system rules
    └── postcss.config.js  # PostCSS preprocessing configuration
```

---

## ⚙️ Installation & Setup Guide

Follow these steps to run the SmartSport application locally:

### 1. Clone the Repository
```bash
git clone <repository_url>
cd ITPM-Project
```

### 2. Configure the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_google_gemini_api_key
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_gmail_username@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
4. Run the server:
   ```bash
   node index.js
   ```
   *The backend will run on `http://localhost:5000`*

### 3. Configure the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   *The application will launch on `http://localhost:3000`*

---

## 🛠️ Core System Workflows

### 📅 Automatic Clash Detection
When a **Coach** schedules a training session:
1. The backend retrieves the academic groups of all students associated with that sport.
2. It queries the academic lecture timetable for those groups on the selected date.
3. If an overlap exists, the session status is flagged as `Conflict` and the specific affected student names along with their conflicting lectures are attached to the training session record.
4. The coach is prompted to either **Keep & Notify** (sending an alert to the athlete) or **Reschedule**.

---

## 🤝 Development & Credits
This platform was built by **SLIIT ITPM Students** as an academic group project. 

For inquiries, support, or feedback, please click the **Help & Support** button on the landing page of the application.
