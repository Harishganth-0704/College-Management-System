const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Only admins have permissions arrays
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // SuperAdmin can do anything
    if (req.user.isSuperAdmin) {
      return next();
    }
    // Check if user has specific permission
    if (req.user.permissions && req.user.permissions.includes(requiredPermission)) {
      return next();
    }
    return res.status(403).json({ success: false, message: "Forbidden: You do not have the required permissions." });
  };
};

module.exports = checkPermission;
