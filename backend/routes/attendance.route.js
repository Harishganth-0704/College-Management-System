const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/attendance.controller");
const auth = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(auth);

// ── FACULTY routes ─────────────────────────────────
// Submit / update attendance for a session
router.post("/", ctrl.submitAttendance);

// Get all sessions created by this faculty
router.get("/my-sessions", ctrl.getMySessions);

// Get students belonging to a branch+semester (for the sheet)
router.get("/students", ctrl.getStudentsForClass);

// ── STUDENT routes ─────────────────────────────────
// Attendance summary grouped by subject
router.get("/my-summary", ctrl.getMyAttendanceSummary);

// Date-wise detail (optionally filtered by subject)
router.get("/my-detail", ctrl.getMyAttendanceDetail);

// ── ADMIN routes ───────────────────────────────────
router.get("/admin-summary/:studentId", ctrl.getStudentAttendanceSummary);
router.get("/admin-summary",            ctrl.getAdminAttendanceStats);

// ── FACULTY notifications ──────────────────────────
router.get("/faculty-low-attendance",   ctrl.getFacultyLowAttendance);

// ── STUDENT report (printable HTML) ───────────────
router.get("/my-report",                ctrl.getMyAttendanceReport);

module.exports = router;
