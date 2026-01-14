const express = require('express');
const { createBid, getBidsForGig, hireBid } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All bid routes are protected
router.post('/', protect, createBid);
router.get('/:gigId', protect, getBidsForGig);
router.patch('/:bidId/hire', protect, hireBid);

module.exports = router;
