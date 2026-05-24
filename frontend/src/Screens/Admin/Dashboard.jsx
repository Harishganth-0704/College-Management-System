import React, { useEffect, useState } from "react";
import axiosWrapper from "../../utils/AxiosWrapper";
import {
  FiUsers, FiBook, FiGitBranch, FiCheckCircle,
  FiAlertTriangle, FiTrendingUp, FiActivity, FiAward
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-3xl font-extrabold text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const userToken = localStorage.getItem("userToken");
  const headers = { headers: { Authorization: `Bearer ${userToken}` } };

  const [stats, setStats] = useState({
    students: 0, faculty: 0, branches: 0, subjects: 0,
    totalClasses: 0, avgAttendance: 0, lowAttendanceStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [studRes, facRes, branchRes, subRes, attRes] = await Promise.allSettled([
          axiosWrapper.get("/student", headers),
          axiosWrapper.get("/faculty", headers),
          axiosWrapper.get("/branch", headers),
          axiosWrapper.get("/subject", headers),
          axiosWrapper.get("/attendance/admin-summary", headers),
        ]);

        const students = studRes.status === "fulfilled" && studRes.value.data.success
          ? studRes.value.data.data.length : 0;
        const faculty = facRes.status === "fulfilled" && facRes.value.data.success
          ? facRes.value.data.data.length : 0;
        const branches = branchRes.status === "fulfilled" && branchRes.value.data.success
          ? branchRes.value.data.data.length : 0;
        const subjects = subRes.status === "fulfilled" && subRes.value.data.success
          ? subRes.value.data.data.length : 0;

        let totalClasses = 0, avgAttendance = 0, lowAttendanceStudents = 0;
        if (attRes.status === "fulfilled" && attRes.value.data.success) {
          const attData = attRes.value.data.data;
          totalClasses = attData.totalSessions || 0;
          avgAttendance = attData.avgAttendance || 0;
          lowAttendanceStudents = attData.lowAttendanceCount || 0;
        }

        setStats({ students, faculty, branches, subjects, totalClasses, avgAttendance, lowAttendanceStudents });
      } catch (err) {
        toast.error("Error loading dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Students", value: stats.students, icon: <FiUsers />, color: "bg-blue-50 text-blue-600", sub: "Enrolled students" },
    { label: "Total Faculty", value: stats.faculty, icon: <FiAward />, color: "bg-purple-50 text-purple-600", sub: "Active faculty members" },
    { label: "Branches", value: stats.branches, icon: <FiGitBranch />, color: "bg-emerald-50 text-emerald-600", sub: "Departments" },
    { label: "Subjects", value: stats.subjects, icon: <FiBook />, color: "bg-amber-50 text-amber-600", sub: "Total subjects" },
    { label: "Classes Held", value: stats.totalClasses, icon: <FiActivity />, color: "bg-indigo-50 text-indigo-600", sub: "Attendance sessions" },
    { label: "Avg Attendance", value: `${stats.avgAttendance}%`, icon: <FiTrendingUp />, color: "bg-teal-50 text-teal-600", sub: "Across all subjects" },
    { label: "Low Attendance", value: stats.lowAttendanceStudents, icon: <FiAlertTriangle />, color: "bg-red-50 text-red-500", sub: "Students below 75%" },
    { label: "Active Students", value: stats.students, icon: <FiCheckCircle />, color: "bg-green-50 text-green-600", sub: "Currently active" },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          📊 Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">System-wide overview and statistics</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>

          {/* Attendance Health Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" /> Attendance Health
            </h2>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm text-slate-500 w-24">Overall</span>
              <div className="flex-grow h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-700 ${
                    stats.avgAttendance >= 75 ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : stats.avgAttendance >= 50 ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-gradient-to-r from-red-400 to-red-500"
                  }`}
                  style={{ width: `${Math.min(stats.avgAttendance, 100)}%` }}
                />
              </div>
              <span className={`text-sm font-bold w-12 text-right ${
                stats.avgAttendance >= 75 ? "text-emerald-600" : stats.avgAttendance >= 50 ? "text-amber-600" : "text-red-600"
              }`}>{stats.avgAttendance}%</span>
            </div>
            <p className="text-xs text-slate-400">
              Minimum required: 75% &nbsp;|&nbsp; 
              <span className="text-red-500 font-semibold">{stats.lowAttendanceStudents} students</span> below threshold
            </p>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
              <FiUsers size={32} className="mb-3 opacity-80" />
              <p className="text-4xl font-extrabold">{stats.students}</p>
              <p className="text-blue-100 mt-1 text-sm">Students enrolled across {stats.branches} branch{stats.branches !== 1 ? "es" : ""}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-lg">
              <FiAward size={32} className="mb-3 opacity-80" />
              <p className="text-4xl font-extrabold">{stats.faculty}</p>
              <p className="text-purple-100 mt-1 text-sm">Faculty members teaching {stats.subjects} subject{stats.subjects !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
              <FiActivity size={32} className="mb-3 opacity-80" />
              <p className="text-4xl font-extrabold">{stats.totalClasses}</p>
              <p className="text-emerald-100 mt-1 text-sm">Attendance sessions recorded</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
