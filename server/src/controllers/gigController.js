const Gig = require('../models/Gig');

/**
 * @desc    Get all open gigs with optional search
 * @route   GET /api/gigs
 * @access  Public
 */
const getGigs = async (req, res, next) => {
    try {
        const { search } = req.query;

        // Build query
        let query = {};

        // Status filter (default to 'open' if not specified, 'all' returns everything)
        const { status } = req.query;
        if (status === 'all') {
            // No status filter needed
        } else if (status) {
            query.status = status;
        } else {
            query.status = 'open';
        }

        // Add search filter if provided
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const gigs = await Gig.find(query)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: gigs.length,
            gigs,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new gig
 * @route   POST /api/gigs
 * @access  Private
 */
const createGig = async (req, res, next) => {
    try {
        const { title, description, budget } = req.body;

        // Create gig with logged-in user as owner
        const gig = await Gig.create({
            title,
            description,
            budget,
            ownerId: req.user._id,
            status: 'open',
        });

        // Populate owner details
        await gig.populate('ownerId', 'name email');

        res.status(201).json({
            success: true,
            gig,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGigs,
    createGig,
};
