const express = require('express');
const { getGigs, createGig } = require('../controllers/gigController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getGigs);

// Protected routes
router.post('/', protect, createGig);

module.exports = router;
