const express = require('express');
const router = express.Router();
const { getAISuggestions, getChartSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/suggestions', protect, getAISuggestions);
router.post('/summary', protect, getChartSummary);

module.exports = router;
