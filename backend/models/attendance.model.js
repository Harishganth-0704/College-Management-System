const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    // The subject / lecture label (free text – e.g. "Mathematics II")
    subject: { type: String, required: true },

    // Branch + Semester context
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    semester: { type: Number, required: true },

    // Date of the class (stored as date-only midnight UTC)
    date: { type: Date, required: true },

    // Faculty who took the class
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyDetail",
      required: true,
    },

    // Array of per-student attendance status
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StudentDetail",
          required: true,
        },
        status: {
          type: String,
          enum: ["present", "absent", "late"],
          default: "absent",
        },
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate records for same subject/branch/semester/date/faculty
AttendanceSchema.index(
  { subject: 1, branchId: 1, semester: 1, date: 1, facultyId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
