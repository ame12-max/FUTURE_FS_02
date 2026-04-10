const db = require('../config/db');

const Lead = {
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM leads ORDER BY created_at DESC');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (leadData) => {
    const { name, email, phone, source, message } = leadData;
    const [result] = await db.query(
      'INSERT INTO leads (name, email, phone, source, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, source || 'website', message]
    );
    return result.insertId;
  },
  updateStatus: async (id, status) => {
    await db.query('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
  },
  delete: async (id) => {
    await db.query('DELETE FROM leads WHERE id = ?', [id]);
  }
};

module.exports = Lead;