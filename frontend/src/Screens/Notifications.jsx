import React, { useEffect, useState } from "react";
import axiosWrapper from "../utils/AxiosWrapper";
import {
  FiBell, FiAlertTriangle, FiCheckCircle, FiXCircle,
  FiClock, FiRefreshCw, FiInfo
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const Notifications = ({ role = "student" }) => {
  const userToken = localStorage.getItem("userToken");
  const headers = { headers: { Authorization: `Bearer ${userToken}` } };

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateStudentNotifications = async () => {
    const notifs = [];
    try {
      // Attendance alerts
      const attRes = await axiosWrapper.get("/attendance/my-summary", headers);
      if (attRes.data.success) {
        attRes.data.data.forEach((subj) => {
          if (subj.percentage < 75) {
            notifs.push({
              id: `att-${subj.subject}`,
              type: "danger",
              icon: <FiAlertTriangle />,
              title: "⚠️ Low Attendance Alert",
              message: `Your attendance in "${subj.subject}" is ${subj.percentage}%. Minimum required is 75%.`,
              time: "Now",
            });
          } else if (subj.percentage < 85) {
            notifs.push({
              id: `att-warn-${subj.subject}`,
              type: "warning",
              icon: <FiClock />,
              title: "📉 Attendance Warning",
              message: `Attendance in "${subj.subject}" is ${subj.percentage}%. Keep it above 85% for safety.`,
              time: "Now",
            });
          }
        });
      }
    } catch {}

    if (notifs.length === 0) {
      notifs.push({
        id: "all-good",
        type: "success",
        icon: <FiCheckCircle />,
        title: "✅ All Good!",
        message: "Your attendance is on track. Keep it up!",
        time: "Now",
      });
    }

    notifs.push({
      id: "welcome",
      type: "info",
      icon: <FiInfo />,
      title: "👋 Welcome to the Portal",
      message: "Check your notes, attendance, and marks from the menu above.",
      time: "Always",
    });

    return notifs;
  };

  const generateFacultyNotifications = async () => {
    const notifs = [];
    try {
      const studRes = await axiosWrapper.get("/attendance/faculty-low-attendance", headers);
      if (studRes.data.success && studRes.data.data.length > 0) {
        studRes.data.data.forEach((item) => {
          notifs.push({
            id: `low-${item.studentId}-${item.subject}`,
            type: "danger",
            icon: <FiAlertTriangle />,
            title: "⚠️ Student Low Attendance",
            message: `${item.studentName} has ${item.percentage}% in "${item.subject}". Consider counselling.`,
            time: "Recent",
          });
        });
      }
    } catch {}

    if (notifs.length === 0) {
      notifs.push({
        id: "no-low",
        type: "success",
        icon: <FiCheckCircle />,
        title: "✅ No Low Attendance Issues",
        message: "All your students are maintaining good attendance.",
        time: "Now",
      });
    }

    notifs.push({
      id: "faculty-tip",
      type: "info",
      icon: <FiInfo />,
      title: "💡 Tip",
      message: "Mark attendance regularly to help students track their performance.",
      time: "Always",
    });

    return notifs;
  };

  const generateAdminNotifications = async () => {
    const notifs = [];
    try {
      const studRes = await axiosWrapper.get("/student", headers);
      const facRes = await axiosWrapper.get("/faculty", headers);
      if (studRes.data.success) {
        notifs.push({
          id: "total-students",
          type: "info",
          icon: <FiInfo />,
          title: "📊 System Overview",
          message: `${studRes.data.data.length} students and ${facRes.data.data?.length || 0} faculty members are currently registered.`,
          time: "Now",
        });
      }
    } catch {}

    notifs.push({
      id: "admin-welcome",
      type: "success",
      icon: <FiCheckCircle />,
      title: "🛡️ Admin Access Active",
      message: "You have full access to manage students, faculty, branches, and subjects.",
      time: "Always",
    });

    return notifs;
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let notifs = [];
      if (role === "student") notifs = await generateStudentNotifications();
      else if (role === "faculty") notifs = await generateFacultyNotifications();
      else if (role === "admin") notifs = await generateAdminNotifications();
      setNotifications(notifs);
    } catch (err) {
      toast.error("Error loading notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [role]);

  const TYPE_STYLES = {
    danger:  { bg: "bg-red-50 border-red-200",    icon: "text-red-500",    badge: "bg-red-100 text-red-600" },
    warning: { bg: "bg-amber-50 border-amber-200", icon: "text-amber-500",  badge: "bg-amber-100 text-amber-700" },
    success: { bg: "bg-emerald-50 border-emerald-200", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
    info:    { bg: "bg-blue-50 border-blue-200",   icon: "text-blue-500",   badge: "bg-blue-100 text-blue-700" },
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
            <FiBell className="text-blue-600" /> Notifications
          </h1>
          <p className="text-slate-500 mt-1">Your alerts and important updates</p>
        </div>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm"
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center shadow-sm">
          <FiBell className="mx-auto text-5xl text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => {
            const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl border ${style.bg} border shadow-sm p-5 flex items-start gap-4`}
              >
                <div className={`text-2xl mt-0.5 ${style.icon}`}>{notif.icon}</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-bold text-slate-800">{notif.title}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${style.badge}`}>
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mt-1">{notif.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
