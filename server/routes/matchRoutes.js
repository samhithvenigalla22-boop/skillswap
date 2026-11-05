const express = require('express');
const router = express.Router();
const { getMatches, getMatchWithUser } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMatches);
router.get('/:userId', protect, getMatchWithUser);

module.exports = router;
