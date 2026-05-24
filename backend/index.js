require('dotenv').config();
const connectToMongo = require("./database/db");
const express = require("express");
const app = express();
const path = require("path");
connectToMongo();
const port = 4000 || process.env.PORT;
var cors = require("cors");

app.use(
  cors({
    origin: process.env.FRONTEND_API_LINK,
  })
);

app.use(express.json()); //to convert request data to json

app.get("/", (req, res) => {
  res.send("Hello 👋 I am Working Fine 🚀");
});

app.use("/media", express.static(path.join(__dirname, "media")));

app.use("/api/admin", require("./routes/details/admin-details.route"));
app.use("/api/faculty", require("./routes/details/faculty-details.route"));
app.use('/api', require('./routes/resetPassword.routes'));

app.use("/api/student", require("./routes/details/student-details.route"));

app.use("/api/branch", require("./routes/branch.route"));
// Removed college‑specific routes not needed for eNote
// app.use("/api/subject", require("./routes/subject.route"));
// app.use("/api/notice", require("./routes/notice.route"));
// app.use("/api/timetable", require("./routes/timetable.route"));
// app.use("/api/material", require("./routes/material.route"));
// app.use("/api/exam", require("./routes/exam.route"));
// app.use("/api/marks", require("./routes/marks.route"));

// Note routes – new feature
app.use("/api/note", require("./routes/note.routes"));
app.use("/api/public-note", require("./routes/publicNote.routes"));

// Audit routes
app.use("/api/audit", require("./routes/audit.route"));

// Attendance routes – new feature
app.use("/api/attendance", require("./routes/attendance.route"));

app.listen(port, () => {
  console.log(`Server Listening On http://localhost:${port}`);
});
