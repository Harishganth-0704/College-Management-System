const express = require('express');
const router = express.Router();
const noteCtrl = require('../controllers/note.controller');

// Public endpoint – no auth middleware
router.get('/note/:id', noteCtrl.getPublicNote);

module.exports = router;
