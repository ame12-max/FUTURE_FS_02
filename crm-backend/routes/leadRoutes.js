const express = require('express');
const {
  getAnalytics,
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  deleteLead,
  
} = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route (no auth) – for contact form submission
router.post('/', createLead);

// All routes below require admin authentication
router.use(authMiddleware);
router.get('/analytics', getAnalytics);
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.put('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

module.exports = router;