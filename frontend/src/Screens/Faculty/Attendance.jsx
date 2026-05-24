import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSend,
  FiChevronDown,
  FiList,
  FiEdit,
} from "react-icons/fi";
import axiosWrapper from "../../utils/AxiosWrapper";

const STATUS_COLORS = {
  present: "bg-emerald-100 text-emerald-700 border-emerald-200",
  absent: "bg-red-100 text-red-600 border-red-200",
  late: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_ICONS = {
  present: <FiCheckCircle className="text-emerald-500" />,
  absent: <FiXCircle className="text-red-500" />,
  late: <FiClock className="text-amber-500" />,
};

const Attendance = () => {
  const userToken = localStorage.getItem("userToken");
  const headers = { headers: { Authorization: `Bearer ${userToken}` } };

  // ── View toggle: "mark" | "history"
  const [view, setView] = useState("mark");

  // ── Branch + Semester selectors
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // ── Student list + statuses
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── History (past sessions)
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);

  // Fetch branches
  useEffect(() => {
    axiosWrapper
      .get("/branch/", headers)
      .then((r) => {
        if (r.data.success) setBranches(r.data.data || []);
      })
      .catch(() => toast.error("Failed to load branches"));
  }, []);

  // Fetch students when branch + semester selected
  const fetchStudents = useCallback(async () => {
    if (!selectedBranch || !selectedSemester) return;
    setLoadingStudents(true);
    try {
      const r = await axiosWrapper.get(
        `/attendance/students?branchId=${selectedBranch}&semester=${selectedSemester}`,
        headers
      );
      if (r.data.success) {
        setStudents(r.data.data);
        // Default everyone to "present"
        const init = {};
        r.data.data.forEach((s) => (init[s._id] = "present"));
        setStatuses(init);
      } else {
        toast.error("Failed to load students");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error loading students");
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedBranch, selectedSemester]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch sessions history
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const params = [];
      if (selectedBranch) params.push(`branchId=${selectedBranch}`);
      if (selectedSemester) params.push(`semester=${selectedSemester}`);
      const r = await axiosWrapper.get(
        `/attendance/my-sessions${params.length ? "?" + params.join("&") : ""}`,
        headers
      );
      if (r.data.success) setSessions(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error loading sessions");
    } finally {
      setLoadingSessions(false);
    }
  }, [selectedBranch, selectedSemester]);

  useEffect(() => {
    if (view === "history") fetchSessions();
  }, [view, fetchSessions]);

  const handleStatusChange = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => (next[s._id] = status));
    setStatuses(next);
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject / lecture name");
      return;
    }
    if (!selectedBranch || !selectedSemester) {
      toast.error("Please select branch and semester");
      return;
    }
    if (students.length === 0) {
      toast.error("No students found for the selected class");
      return;
    }

    setSubmitting(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: statuses[s._id] || "absent",
      }));

      const r = await axiosWrapper.post(
        "/attendance",
        {
          subject: subject.trim(),
          branchId: selectedBranch,
          semester: Number(selectedSemester),
          date,
          records,
        },
        headers
      );

      if (r.data.success) {
        toast.success("Attendance submitted successfully! 🎉");
      } else {
        toast.error("Failed to submit attendance");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting attendance");
    } finally {
      setSubmitting(false);
    }
  };

  // Summary counts
  const presentCount = Object.values(statuses).filter((s) => s === "present").length;
  const absentCount = Object.values(statuses).filter((s) => s === "absent").length;
  const lateCount = Object.values(statuses).filter((s) => s === "late").length;

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
          <FiUsers className="text-blue-600" />
          Attendance Manager
        </h1>
        <p className="text-slate-500 mt-1">Mark and track class attendance in real-time.</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        {["mark", "history"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition duration-200 flex items-center gap-2 ${
              view === v
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {v === "mark" ? <FiEdit size={14} /> : <FiList size={14} />}
            {v === "mark" ? "Mark Attendance" : "Session History"}
          </button>
        ))}
      </div>

      {/* ── MARK ATTENDANCE VIEW ────────────────── */}
      {view === "mark" && (
        <div className="space-y-6">
          {/* Class Setup Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
              <FiCalendar className="text-blue-500" /> Class Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Branch</label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => { setSelectedBranch(e.target.value); setStudents([]); }}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Semester</label>
                <div className="relative">
                  <select
                    value={selectedSemester}
                    onChange={(e) => { setSelectedSemester(e.target.value); setStudents([]); }}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Subject / Lecture</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics II"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Student Attendance Sheet */}
          {loadingStudents ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : students.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Sheet Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-white">
                  <p className="font-bold text-lg">{students.length} Students</p>
                  <p className="text-white/70 text-sm">
                    ✅ {presentCount} Present &nbsp;|&nbsp; ❌ {absentCount} Absent &nbsp;|&nbsp; ⏰ {lateCount} Late
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {["present", "absent", "late"].map((s) => (
                    <button
                      key={s}
                      onClick={() => markAll(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition capitalize ${STATUS_COLORS[s]}`}
                    >
                      All {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-slate-50">
                {students.map((student, idx) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-6 text-right">{idx + 1}.</span>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {student.firstName} {student.middleName} {student.lastName}
                        </p>
                        <p className="text-xs text-slate-400">Enrollment #{student.enrollmentNo}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {["present", "absent", "late"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(student._id, s)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition capitalize ${
                            statuses[student._id] === s
                              ? STATUS_COLORS[s] + " shadow-sm"
                              : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          {STATUS_ICONS[s]} {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition duration-200 ${
                    submitting
                      ? "bg-blue-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  }`}
                >
                  <FiSend />
                  {submitting ? "Submitting..." : "Submit Attendance"}
                </button>
              </div>
            </div>
          ) : (
            selectedBranch && selectedSemester ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center shadow-sm">
                <FiUsers className="mx-auto text-5xl text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No active students found for this class.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center shadow-sm">
                <FiCalendar className="mx-auto text-5xl text-slate-200 mb-3" />
                <p className="text-slate-400 font-medium">Select a branch and semester to load students.</p>
              </div>
            )
          )}
        </div>
      )}

      {/* ── SESSION HISTORY VIEW ─────────────────── */}
      {view === "history" && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-4">
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {loadingSessions ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <FiList className="mx-auto text-5xl text-slate-200 mb-3" />
              <p className="text-slate-400 font-medium">No sessions found.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const p = session.records.filter((r) => r.status === "present").length;
              const total = session.records.length;
              const pct = total > 0 ? Math.round((p / total) * 100) : 0;
              const isExpanded = expandedSession === session._id;

              return (
                <div key={session._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition"
                    onClick={() => setExpandedSession(isExpanded ? null : session._id)}
                  >
                    <div>
                      <p className="font-bold text-slate-800">{session.subject}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(session.date).toLocaleDateString(undefined, {
                          weekday: "short", month: "short", day: "numeric", year: "numeric",
                        })} &nbsp;·&nbsp; {session.branchId?.name || "–"} &nbsp;·&nbsp; Sem {session.semester}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Mini progress bar */}
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-600">{p}/{total} Present</p>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className={`text-xs font-bold mt-0.5 ${pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                          {pct}%
                        </p>
                      </div>
                      <FiChevronDown className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-50 px-6 py-3 bg-slate-50/50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {session.records.map((r) => (
                          <div
                            key={r._id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium ${STATUS_COLORS[r.status]}`}
                          >
                            {STATUS_ICONS[r.status]}
                            <span className="truncate capitalize">{r.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
