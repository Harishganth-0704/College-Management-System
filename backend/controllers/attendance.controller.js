const Attendance = require("../models/attendance.model");
const StudentDetails = require("../models/details/student-details.model");
const ApiResponse = require("../utils/ApiResponse");

// ─────────────────────────────────────────────────────────────
// FACULTY: Submit attendance for a class
// POST /api/attendance
// Body: { subject, branchId, semester, date, records: [{studentId, status}] }
// ─────────────────────────────────────────────────────────────
exports.submitAttendance = async (req, res) => {
  try {
    const { subject, branchId, semester, date, records } = req.body;

    if (!subject || !branchId || !semester || !date || !records?.length) {
      return ApiResponse.badRequest(
        "subject, branchId, semester, date and records are required"
      ).send(res);
    }

    // Normalize date to midnight UTC so the unique index works correctly
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Upsert: if the faculty already submitted for this class, overwrite
    const filter = {
      subject,
      branchId,
      semester: Number(semester),
      date: normalizedDate,
      facultyId: req.userId,
    };

    const attendance = await Attendance.findOneAndUpdate(
      filter,
      { ...filter, records },
      { upsert: true, new: true }
    );

    return ApiResponse.success(attendance, "Attendance submitted successfully").send(res);
  } catch (err) {
    console.error("Submit Attendance Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// FACULTY: Get all attendance sessions created by the logged-in faculty
// GET /api/attendance/my-sessions?branchId=&semester=&subject=
// ─────────────────────────────────────────────────────────────
exports.getMySessions = async (req, res) => {
  try {
    const filter = { facultyId: req.userId };
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.semester) filter.semester = Number(req.query.semester);
    if (req.query.subject) filter.subject = new RegExp(req.query.subject, "i");

    const sessions = await Attendance.find(filter)
      .populate("branchId", "name branchId")
      .sort({ date: -1 });

    return ApiResponse.success(sessions, "Sessions fetched").send(res);
  } catch (err) {
    console.error("Get Sessions Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// FACULTY: Get students for a branch+semester (to build the attendance sheet)
// GET /api/attendance/students?branchId=&semester=
// ─────────────────────────────────────────────────────────────
exports.getStudentsForClass = async (req, res) => {
  try {
    const { branchId, semester } = req.query;
    if (!branchId || !semester) {
      return ApiResponse.badRequest("branchId and semester are required").send(res);
    }

    const students = await StudentDetails.find(
      { branchId, semester: Number(semester), status: "active" },
      "firstName middleName lastName enrollmentNo"
    ).sort({ enrollmentNo: 1 });

    return ApiResponse.success(students, "Students fetched").send(res);
  } catch (err) {
    console.error("Get Students Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Get my attendance summary grouped by subject
// GET /api/attendance/my-summary
// ─────────────────────────────────────────────────────────────
exports.getMyAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.userId;

    // Find all attendance records where this student appears
    const sessions = await Attendance.find({
      "records.studentId": studentId,
    }).select("subject date records");

    // Group by subject and count
    const summary = {};

    sessions.forEach((session) => {
      const subj = session.subject;
      if (!summary[subj]) {
        summary[subj] = { subject: subj, total: 0, present: 0, absent: 0, late: 0 };
      }

      const record = session.records.find(
        (r) => r.studentId.toString() === studentId.toString()
      );
      if (record) {
        summary[subj].total++;
        summary[subj][record.status]++;
      }
    });

    // Convert to array and add percentage
    const summaryArray = Object.values(summary).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    return ApiResponse.success(summaryArray, "Attendance summary fetched").send(res);
  } catch (err) {
    console.error("Get My Attendance Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Get my detailed attendance per subject (date-wise)
// GET /api/attendance/my-detail?subject=
// ─────────────────────────────────────────────────────────────
exports.getMyAttendanceDetail = async (req, res) => {
  try {
    const studentId = req.userId;
    const filter = { "records.studentId": studentId };
    if (req.query.subject) filter.subject = new RegExp(req.query.subject, "i");

    const sessions = await Attendance.find(filter)
      .select("subject date records")
      .sort({ date: 1 });

    const detail = sessions.map((session) => {
      const record = session.records.find(
        (r) => r.studentId.toString() === studentId.toString()
      );
      return {
        subject: session.subject,
        date: session.date,
        status: record ? record.status : "absent",
      };
    });

    return ApiResponse.success(detail, "Attendance detail fetched").send(res);
  } catch (err) {
    console.error("Get My Attendance Detail Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: Get attendance summary for any student
// GET /api/attendance/admin-summary/:studentId
// ─────────────────────────────────────────────────────────────
exports.getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const sessions = await Attendance.find({
      "records.studentId": studentId,
    }).select("subject date records");

    const summary = {};
    sessions.forEach((session) => {
      const subj = session.subject;
      if (!summary[subj]) {
        summary[subj] = { subject: subj, total: 0, present: 0, absent: 0, late: 0 };
      }
      const record = session.records.find(
        (r) => r.studentId.toString() === studentId
      );
      if (record) {
        summary[subj].total++;
        summary[subj][record.status]++;
      }
    });

    const summaryArray = Object.values(summary).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    return ApiResponse.success(summaryArray, "Student attendance fetched").send(res);
  } catch (err) {
    console.error("Admin Get Student Attendance Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN: System-wide attendance stats for dashboard
// GET /api/attendance/admin-summary
// ─────────────────────────────────────────────────────────────
exports.getAdminAttendanceStats = async (req, res) => {
  try {
    const allSessions = await Attendance.find({}).select("records");
    const totalSessions = allSessions.length;

    let totalPresent = 0, totalRecords = 0, lowAttendanceStudents = new Set();

    // Per-student aggregate
    const studentMap = {};
    for (const session of allSessions) {
      for (const rec of session.records) {
        const sid = rec.studentId.toString();
        if (!studentMap[sid]) studentMap[sid] = { total: 0, present: 0 };
        studentMap[sid].total++;
        if (rec.status === "present") studentMap[sid].present++;
        totalRecords++;
        if (rec.status === "present") totalPresent++;
      }
    }

    for (const [sid, s] of Object.entries(studentMap)) {
      const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
      if (pct < 75) lowAttendanceStudents.add(sid);
    }

    const avgAttendance = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    return ApiResponse.success({
      totalSessions,
      avgAttendance,
      lowAttendanceCount: lowAttendanceStudents.size,
    }, "Admin attendance stats fetched").send(res);
  } catch (err) {
    console.error("Admin Stats Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// FACULTY: Get list of students with low attendance in their classes
// GET /api/attendance/faculty-low-attendance
// ─────────────────────────────────────────────────────────────
exports.getFacultyLowAttendance = async (req, res) => {
  try {
    const facultyId = req.userId;
    const sessions = await Attendance.find({ facultyId }).select("subject records");

    const studentSubjectMap = {};
    for (const session of sessions) {
      for (const rec of session.records) {
        const key = `${rec.studentId}-${session.subject}`;
        if (!studentSubjectMap[key]) {
          studentSubjectMap[key] = { studentId: rec.studentId, subject: session.subject, total: 0, present: 0 };
        }
        studentSubjectMap[key].total++;
        if (rec.status === "present") studentSubjectMap[key].present++;
      }
    }

    const lowList = [];
    for (const item of Object.values(studentSubjectMap)) {
      const pct = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
      if (pct < 75) {
        const student = await StudentDetails.findById(item.studentId).select("firstName lastName enrollmentNo");
        if (student) {
          lowList.push({
            studentId: item.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            enrollmentNo: student.enrollmentNo,
            subject: item.subject,
            percentage: pct,
            total: item.total,
            present: item.present,
          });
        }
      }
    }

    return ApiResponse.success(lowList, "Low attendance students fetched").send(res);
  } catch (err) {
    console.error("Faculty Low Attendance Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};

// ─────────────────────────────────────────────────────────────
// STUDENT: Download attendance as printable HTML (opens in new tab)
// GET /api/attendance/my-report
// ─────────────────────────────────────────────────────────────
exports.getMyAttendanceReport = async (req, res) => {
  try {
    const studentId = req.userId;
    const student = await StudentDetails.findById(studentId).select("firstName lastName enrollmentNo semester");

    const sessions = await Attendance.find({ "records.studentId": studentId })
      .select("subject date records")
      .sort({ date: 1 });

    const summary = {};
    sessions.forEach((session) => {
      const subj = session.subject;
      if (!summary[subj]) summary[subj] = { subject: subj, total: 0, present: 0, absent: 0, late: 0 };
      const record = session.records.find((r) => r.studentId.toString() === studentId.toString());
      if (record) {
        summary[subj].total++;
        summary[subj][record.status]++;
      }
    });

    const rows = Object.values(summary).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    const totalPresent = rows.reduce((a, r) => a + r.present, 0);
    const totalClasses = rows.reduce((a, r) => a + r.total, 0);
    const overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Attendance Report - ${student?.firstName} ${student?.lastName}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 30px; color: #222; }
  h1 { color: #1e40af; margin-bottom: 4px; }
  .meta { color: #555; font-size: 14px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #1e40af; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
  td { padding: 9px 14px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
  tr:hover td { background: #f0f7ff; }
  .low { color: #dc2626; font-weight: bold; }
  .ok  { color: #16a34a; font-weight: bold; }
  .warn{ color: #d97706; font-weight: bold; }
  .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  .overall { background:#f0f7ff; border:1px solid #bfdbfe; border-radius:8px; padding:16px; margin-bottom:20px; display:flex; justify-content:space-between; }
</style>
</head>
<body>
<h1>📊 Attendance Report</h1>
<div class="meta">
  <strong>Name:</strong> ${student?.firstName} ${student?.lastName} &nbsp;|&nbsp;
  <strong>Enrollment No:</strong> ${student?.enrollmentNo || "N/A"} &nbsp;|&nbsp;
  <strong>Semester:</strong> ${student?.semester || "N/A"} &nbsp;|&nbsp;
  <strong>Generated:</strong> ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
</div>
<div class="overall">
  <span>Total Classes: <strong>${totalClasses}</strong></span>
  <span>Present: <strong>${totalPresent}</strong></span>
  <span>Absent: <strong>${totalClasses - totalPresent}</strong></span>
  <span>Overall: <strong class="${overallPct >= 75 ? "ok" : "low"}">${overallPct}%</strong></span>
</div>
<table>
  <thead><tr><th>#</th><th>Subject</th><th>Total</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr></thead>
  <tbody>
    ${rows.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${r.subject}</td>
      <td>${r.total}</td>
      <td>${r.present}</td>
      <td>${r.absent}</td>
      <td>${r.late}</td>
      <td class="${r.percentage >= 75 ? "ok" : r.percentage >= 50 ? "warn" : "low"}">${r.percentage}%</td>
    </tr>`).join("")}
  </tbody>
</table>
<div class="footer">
  Minimum required attendance: 75% &nbsp;|&nbsp; This is a system-generated report.
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error("Attendance Report Error:", err);
    return ApiResponse.internalServerError().send(res);
  }
};
