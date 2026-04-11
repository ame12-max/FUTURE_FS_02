const db = require('../config/db');
const { sendNewLeadNotification } = require('../utils/emailService'); // add this


// Get all leads with optional filters
// controllers/leadController.js
exports.getAllLeads = async (req, res) => {
  try {
    const { status, search, from, to, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    if (from) {
      whereClause += ' AND created_at >= ?';
      params.push(from);
    }
    if (to) {
      whereClause += ' AND created_at <= ?';
      params.push(to);
    }

    // Count total matching rows
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM leads ${whereClause}`, params);
    const total = countResult[0].total;

    // Fetch paginated rows
    const query = `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(query, [...params, parseInt(limit), offset]);

    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
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
    
    // Send email notification (don't await – fire and forget to avoid blocking response)
   // After inserting into database, send email notification
sendNewLeadNotification({ name, email, phone, source, message })
  .then(result => {
    if (result.success) {
      console.log(`Email notification sent for lead ID ${result.insertId}`);
    } else {
      console.error(`Email failed for lead: ${result.error}`);
    }
  })
  .catch(err => console.error('Unexpected email error:', err));

    res.status(201).json({ id: result.insertId, name, email, phone, source, message });
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