const express = require('express');
const { searchJobs, saveJob, getSavedJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchJobs);
router.post('/save', protect, saveJob);
router.get('/saved', protect, getSavedJobs);

module.exports = router;
