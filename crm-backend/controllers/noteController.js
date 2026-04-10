const Note = require('../models/Note');

exports.addNote = async (req, res) => {
  const { note } = req.body;
  if (!note) return res.status(400).json({ message: 'Note text required' });
  try {
    const noteId = await Note.create(req.params.leadId, note, req.user.username);
    res.status(201).json({ message: 'Note added', noteId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotesForLead = async (req, res) => {
  try {
    const notes = await Note.findByLeadId(req.params.leadId);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};