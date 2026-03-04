require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const AllDataRoutes = require('./routes/AllDataRoutes');
const SendAlertsRoutes = require('./routes/AlertRoutes');
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/auth', AllDataRoutes);
app.use('/auth', SendAlertsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

