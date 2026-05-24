const express = require("express");
const router = express.Router();
const auditCtrl = require("../controllers/audit.controller");
// Assuming there is some basic auth middleware, but we will leave it to the index router to mount

router.get("/logs", auditCtrl.getAuditLogs);

module.exports = router;
