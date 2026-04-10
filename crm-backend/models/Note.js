const db = require('../config/db');

const Note = {
  findByLeadId: async (leadId) => {
    const [rows] = await db.query('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC', [leadId]);
    return rows;
  },
  create: async (leadId, noteText, createdBy) => {
    const [result] = await db.query('INSERT INTO notes (lead_id, note, created_by) VALUES (?, ?, ?)', [leadId, noteText, createdBy]);
    return result.insertId;
  }
};

module.exports = Note;