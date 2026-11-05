const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getSentRequests,
  getReceivedRequests,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  getActiveSwaps,
  completeSwap,
  getSwapById,
} = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, createSwapRequest);
router.get('/sent', protect, getSentRequests);
router.get('/received', protect, getReceivedRequests);
router.get('/active', protect, getActiveSwaps);
router.get('/:id', protect, getSwapById);
router.put('/:id/accept', protect, acceptSwapRequest);
router.put('/:id/reject', protect, rejectSwapRequest);
router.put('/:id/cancel', protect, cancelSwapRequest);
router.put('/:id/complete', protect, completeSwap);

module.exports = router;
