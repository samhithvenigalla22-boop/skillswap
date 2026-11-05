const express = require('express');
const router = express.Router();
const { getMessagesBySwapId, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:swapId', protect, getMessagesBySwapId);
router.post('/:swapId', protect, sendMessage);

module.exports = router;
