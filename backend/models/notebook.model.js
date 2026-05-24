const mongoose = require('mongoose');

const NotebookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // can be faculty or admin as well
  notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
}, { timestamps: true });

module.exports = mongoose.model('Notebook', NotebookSchema);
