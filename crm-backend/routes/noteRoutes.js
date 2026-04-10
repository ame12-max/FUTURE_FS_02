const express = require('express');
const { addNote, getNotesForLead } = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All note routes require authentication
router.use(authMiddleware);
router.get('/lead/:leadId', getNotesForLead);
router.post('/lead/:leadId', addNote);

module.exports = router;