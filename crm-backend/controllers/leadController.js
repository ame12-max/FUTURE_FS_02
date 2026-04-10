const db = require('../config/db');

// Get all leads with optional filters
exports.getAllLeads = async (req, res) => {
  try {
    const { status, search, from, to } = req.query;
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (from) {
      query += ' AND created_at >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND created_at <= ?';
      params.push(to);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error in getAllLeads:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get single lead with notes
exports.getLeadById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Lead not found' });
    const lead = rows[0];
    const [notes] = await db.query('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC', [lead.id]);
    res.json({ ...lead, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Create new lead (public)
exports.createLead = async (req, res) => {
  const { name, email, phone, source, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO leads (name, email, phone, source, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, source || 'website', message || null]
    );
    res.status(201).json({ message: 'Lead created', leadId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update lead status
exports.updateLeadStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'contacted', 'converted'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    await db.query('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    await db.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Analytics endpoint (optional)
exports.getAnalytics = async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) as total FROM leads');
    const [converted] = await db.query('SELECT COUNT(*) as converted FROM leads WHERE status = "converted"');
    const conversionRate = total[0].total > 0 ? (converted[0].converted / total[0].total) * 100 : 0;
    res.json({
      totalLeads: total[0].total,
      convertedLeads: converted[0].converted,
      conversionRate: conversionRate.toFixed(1)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};