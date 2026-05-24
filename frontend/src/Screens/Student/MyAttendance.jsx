import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiAlertTriangle,
  FiDownload,
} from "react-icons/fi";
import axiosWrapper from "../../utils/AxiosWrapper";

const STATUS_STYLES = {
  present: "bg-emerald-100 text-emerald-700 border-emerald-200",
  absent: "bg-red-100 text-red-600 border-red-200",
  late: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_ICONS = {
  present: <FiCheckCircle className="text-emerald-500" size={12} />,
  absent: <FiXCircle className="text-red-500" size={12} />,
  late: <FiClock className="text-amber-500" size={12} />,
};

const MyAttendance = () => {
  const userToken = localStorage.getItem("userToken");
  const headers = { headers: { Authorization: `Bearer ${userToken}` } };

  const [summary, setSummary] = useState([]);
  const [detail, setDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sumRes, detRes] = await Promise.all([
          axiosWrapper.get("/attendance/my-summary", headers),
          axiosWrapper.get("/attendance/my-detail", headers),
        ]);
        if (sumRes.data.success) setSummary(sumRes.data.data);
        if (detRes.data.success) setDetail(detRes.data.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Error loading attendance");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handlePrintReport = async () => {
    const toastId = toast.loading("Generating report...");
    try {
      const res = await axiosWrapper.get("/attendance/my-report", {
        ...headers,
        responseType: "text",
      });
      toast.dismiss(toastId);
      // Open HTML in a new tab and trigger print
      const blob = new Blob([res.data], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) toast.error("Pop-up blocked! Allow pop-ups and try again.");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to generate report");
    }
  };

  // Compute overall totals
  const overall = summary.reduce(
    (acc, s) => {
      acc.total += s.total;
      acc.present += s.present;
      acc.absent += s.absent;
      acc.late += s.late;
      return acc;
    },
    { total: 0, present: 0, absent: 0, late: 0 }
  );
  const overallPct = overall.total > 0 ? Math.round((overall.present / overall.total) * 100) : 0;

  const getDetailForSubject = (subjectName) =>
    detail.filter((d) => d.subject === subjectName);

  const getPctColor = (pct) => {
    if (pct >= 75) return "from-emerald-500 to-emerald-400";
    if (pct >= 50) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  const getPctTextColor = (pct) => {
    if (pct >= 75) return "text-emerald-600";
    if (pct >= 50) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
            <FiBarChart2 className="text-blue-600" />
            My Attendance
          </h1>
          <p className="text-slate-500 mt-1">Subject-wise attendance and class-by-class breakdown.</p>
        </div>
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow hover:opacity-90 transition text-sm"
        >
          <FiDownload size={15} /> Download Report
        </button>
      </div>

      {summary.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center shadow-sm">
          <FiCalendar className="mx-auto text-5xl text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No attendance records found yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            Your attendance will appear here once your faculty starts marking it.
          </p>
        </div>
      ) : (
        <>
          {/* Overall Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Classes", value: overall.total, color: "bg-blue-50 border-blue-100 text-blue-700" },
              { label: "Present", value: overall.present, color: "bg-emerald-50 border-emerald-100 text-emerald-700", icon: <FiCheckCircle /> },
              { label: "Absent", value: overall.absent, color: "bg-red-50 border-red-100 text-red-600", icon: <FiXCircle /> },
              { label: "Late", value: overall.late, color: "bg-amber-50 border-amber-100 text-amber-700", icon: <FiClock /> },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border p-5 flex flex-col items-center justify-center text-center ${stat.color} shadow-sm`}
              >
                {stat.icon && <div className="text-2xl mb-1">{stat.icon}</div>}
                <p className="text-3xl font-extrabold">{stat.value}</p>
                <p className="text-xs font-semibold mt-0.5 opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Overall Percentage Banner */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-slate-700">Overall Attendance</p>
              <p className={`text-2xl font-extrabold ${getPctTextColor(overallPct)}`}>
                {overallPct}%
              </p>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-4 rounded-full bg-gradient-to-r ${getPctColor(overallPct)} transition-all duration-700`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>0%</span>
              <span className={`font-semibold ${overallPct < 75 ? "text-red-500" : "text-slate-400"}`}>
                {overallPct < 75 && <FiAlertTriangle className="inline mr-1 text-red-400" />}
                75% Minimum Required
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Subject-wise Cards */}
          <div className="space-y-4">
            {summary.map((subj) => {
              const isExpanded = expandedSubject === subj.subject;
              const subjectDetail = getDetailForSubject(subj.subject);

              return (
                <div
                  key={subj.subject}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    className="px-6 py-5 cursor-pointer hover:bg-slate-50/70 transition flex items-center justify-between gap-4"
                    onClick={() => setExpandedSubject(isExpanded ? null : subj.subject)}
                  >
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-slate-800 text-base truncate">{subj.subject}</p>
                      <div className="flex items-center gap-3 mt-2.5">
                        {/* Progress Bar */}
                        <div className="flex-grow h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full bg-gradient-to-r ${getPctColor(subj.percentage)} transition-all duration-700`}
                            style={{ width: `${subj.percentage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-extrabold min-w-[3rem] text-right ${getPctTextColor(subj.percentage)}`}>
                          {subj.percentage}%
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiCheckCircle className="text-emerald-500" /> {subj.present} Present
                        </span>
                        <span className="flex items-center gap-1">
                          <FiXCircle className="text-red-500" /> {subj.absent} Absent
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="text-amber-500" /> {subj.late} Late
                        </span>
                        <span className="text-slate-400">/ {subj.total} Classes</span>
                      </div>
                    </div>

                    {/* Warning badge */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      {subj.percentage < 75 && (
                        <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-2 py-1 rounded-lg border border-red-100">
                          <FiAlertTriangle size={11} /> Low Attendance
                        </span>
                      )}
                      <FiChevronDown
                        className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Date-wise Detail */}
                  {isExpanded && subjectDetail.length > 0 && (
                    <div className="border-t border-slate-50 px-6 py-4 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Class-by-Class Breakdown</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {subjectDetail.map((d, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-medium ${STATUS_STYLES[d.status]}`}
                          >
                            <span className="mb-1">{STATUS_ICONS[d.status]}</span>
                            <span className="capitalize font-bold">{d.status}</span>
                            <span className="text-2xs mt-0.5 opacity-70">
                              {new Date(d.date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;
