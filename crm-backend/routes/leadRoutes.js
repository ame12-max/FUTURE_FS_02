const express = require('express');
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  deleteLead,
  getAnalytics
} = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route (no auth) – for contact form submission
router.post('/', createLead);

// All routes below require admin authentication
router.use(authMiddleware);
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.get('/analytics', getAnalytics);
router.put('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

module.exports = router;