require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const AllDataRoutes = require('./routes/AllDataRoutes');
const SendAlertsRoutes = require('./routes/AlertRoutes');
const scheduleTrainRoutes = require('./routes/scheduleTrainRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const scoutRoutes = require('./routes/scoutRoutes');
const InventoryRoutes = require('./routes/InventoryRoutes');
const trainingDrillRoutes = require('./routes/trainingDrillRoutes');
const matchResultRoutes = require('./routes/matchResultRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const lecturerRoutes = require('./routes/lecturerRoutes');

const timetableRoutes = require('./routes/timetableRoutes');
const studentGlobalRoutes = require('./routes/studentGlobalRoutes');

const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.use('/auth', authRoutes);
app.use('/auth', AllDataRoutes);
app.use('/auth', SendAlertsRoutes);
app.use('/schedule', scheduleTrainRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/scout', scoutRoutes);
app.use('/inventory', InventoryRoutes);
app.use('/drills', trainingDrillRoutes);
app.use('/matchresult', matchResultRoutes);
app.use('/performance', performanceRoutes);
app.use('/lecturer', lecturerRoutes);
app.use('/auth', doctorRoutes);

app.use('/lecturer', lecturerRoutes);

app.use('/api/timetable', timetableRoutes);
app.use('/api/student', studentGlobalRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

