const express = require('express');
const router = express.Router();
const resetPasswordCtrl = require('../controllers/resetPassword.controller');

// Public route – no auth middleware
// URL format: /{role}/forget-password  (role = admin, faculty, student)
router.post('/:role/forget-password', resetPasswordCtrl.forgotPassword);

module.exports = router;
