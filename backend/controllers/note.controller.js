const Note = require('../models/note.model');

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
      createdBy: req.userId,
    });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get notes for the logged‑in user – supports tag filter and full‑text search
exports.getMyNotes = async (req, res) => {
  try {
    const filter = { createdBy: req.userId };
    if (req.query.tag) {
      filter.tags = req.query.tag; // exact match; can be extended to $in
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a note – only owner can edit
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a note – only owner can delete
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Public read‑only endpoint – no auth required
exports.getPublicNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, isPublic: true });
    if (!note) return res.status(404).json({ success: false, error: 'Public note not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
