const crypto = require('crypto');
const ResetPassword = require('../models/reset-password.model');
const AdminDetails = require('../models/details/admin-details.model');
const FacultyDetails = require('../models/details/faculty-details.model');
const StudentDetails = require('../models/details/student-details.model');
const sendResetMail = require('../utils/SendMail');

// Map role string to model and enum name
const modelMap = {
  admin: { model: AdminDetails, enum: 'AdminDetails' },
  faculty: { model: FacultyDetails, enum: 'FacultyDetails' },
  student: { model: StudentDetails, enum: 'StudentDetails' },
};

exports.forgotPassword = async (req, res) => {
  try {
    const role = req.params.role?.toLowerCase();
    const { email } = req.body;
    if (!role || !modelMap[role]) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const { model, enum: typeEnum } = modelMap[role];
    const user = await model.findOne({ email });
    // Always respond with the same message to avoid enumeration
    const genericMsg = 'If the email exists, a reset link has been sent';
    if (!user) {
      return res.json({ success: true, message: genericMsg });
    }
    // Generate token (plain token for demo, can hash for production)
    const token = crypto.randomBytes(32).toString('hex');
    await ResetPassword.create({
      userId: user._id,
      type: typeEnum,
      resetToken: token,
    });
    // In a real app you would email the link. Here we just log it.
    console.log(`Reset link for ${role} (${email}): http://localhost:3000/reset-password?token=${token}`);
    // Actually send the email
    await sendResetMail(email, token, role);
    return res.json({ success: true, message: genericMsg });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
