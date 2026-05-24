const Notebook = require('../models/notebook.model');
const Note = require('../models/note.model');

// Create a new notebook
exports.createNotebook = async (req, res) => {
  try {
    const notebook = await Notebook.create({
      name: req.body.name,
      owner: req.userId,
    });
    res.status(201).json({ success: true, data: notebook });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all notebooks for logged‑in user
exports.getMyNotebooks = async (req, res) => {
  try {
    const notebooks = await Notebook.find({ owner: req.userId }).populate('notes');
    res.json({ success: true, data: notebooks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add a note to a notebook
exports.addNoteToNotebook = async (req, res) => {
  try {
    const { notebookId, noteId } = req.body;
    const notebook = await Notebook.findOne({ _id: notebookId, owner: req.userId });
    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });
    // Ensure note belongs to the same user
    const note = await Note.findOne({ _id: noteId, createdBy: req.userId });
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    notebook.notes.push(noteId);
    await notebook.save();
    res.json({ success: true, data: notebook });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a notebook
exports.deleteNotebook = async (req, res) => {
  try {
    const notebook = await Notebook.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
