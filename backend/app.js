const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/', require('./routes/resetPassword.routes'));

// const examRoutes = require("./routes/exam.routes"); // Removed – not needed for eNote
// const marksRoutes = require("./routes/marks.routes"); // Removed – not needed for eNote
// const timetableRoutes = require("./routes/timetable.routes"); // Removed – not needed for eNote
// const subjectRoutes = require("./routes/subject.routes"); // Removed – not needed for eNote
// const noticeRoutes = require("./routes/notice.routes"); // Removed – not needed for eNoted({ extended: true }));

// Error handling middleware
module.exports = app;
