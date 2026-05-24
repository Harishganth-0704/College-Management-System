const express = require('express');
const router = express.Router();
const noteCtrl = require('../controllers/note.controller');
const auth = require('../middlewares/auth.middleware'); // existing auth middleware

router.use(auth);

router.post('/', noteCtrl.createNote);
router.get('/', noteCtrl.getMyNotes);
router.put('/:id', noteCtrl.updateNote);
router.delete('/:id', noteCtrl.deleteNote);

module.exports = router;
