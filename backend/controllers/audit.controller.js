const AuditLog = require("../models/audit-log.model");

// Utility function to be used by other controllers to log actions
exports.logAction = async (userId, userRole, action, targetId, description) => {
  try {
    await AuditLog.create({
      userId,
      userRole,
      action,
      targetId,
      description,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

// Route to fetch audit logs for the SuperAdmin Dashboard
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).populate("userId", "firstName lastName email employeeId enrollmentNo");
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
