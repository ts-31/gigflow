const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const socketIO = require('../socket');

/**
 * @desc    Create a new bid on a gig
 * @route   POST /api/bids
 * @access  Private
 */
const createBid = async (req, res, next) => {
    try {
        const { gigId, message } = req.body;

        // Validate message
        if (!message) {
            res.status(400);
            throw new Error('Please provide a message');
        }

        // Check if gig exists
        const gig = await Gig.findById(gigId);
        if (!gig) {
            res.status(404);
            throw new Error('Gig not found');
        }

        // Check if gig is still open
        if (gig.status !== 'open') {
            res.status(400);
            throw new Error('This gig is no longer accepting bids');
        }

        // Prevent users from bidding on their own gigs
        if (gig.ownerId.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('You cannot bid on your own gig');
        }

        // Check if user has already bid on this gig
        const existingBid = await Bid.findOne({
            gigId,
            freelancerId: req.user._id,
        });
        if (existingBid) {
            res.status(400);
            throw new Error('You have already placed a bid on this gig');
        }

        // Create bid
        const bid = await Bid.create({
            gigId,
            freelancerId: req.user._id,
            message,
            status: 'pending',
        });

        // Populate freelancer details
        await bid.populate('freelancerId', 'name email');

        res.status(201).json({
            success: true,
            bid,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all bids for a specific gig
 * @route   GET /api/bids/:gigId
 * @access  Private (only gig owner)
 */
const getBidsForGig = async (req, res, next) => {
    try {
        const { gigId } = req.params;

        // Check if gig exists
        const gig = await Gig.findById(gigId);
        if (!gig) {
            res.status(404);
            throw new Error('Gig not found');
        }

        // Only gig owner can view bids
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view bids for this gig');
        }

        // Get all bids for the gig
        const bids = await Bid.find({ gigId })
            .populate('freelancerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bids.length,
            bids,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Hire a freelancer (accept a bid)
 * @route   PATCH /api/bids/:bidId/hire
 * @access  Private (only gig owner)
 */
const hireBid = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { bidId } = req.params;

        // Find the bid within the session
        const bid = await Bid.findById(bidId).session(session);
        if (!bid) {
            res.status(404);
            throw new Error('Bid not found');
        }

        // Find the associated gig within the session
        // We use finding the gig to lock the document if possible,
        // or at least ensure we are reading the latest state.
        const gig = await Gig.findById(bid.gigId).session(session);
        if (!gig) {
            res.status(404);
            throw new Error('Gig not found');
        }

        // Only gig owner can hire
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to hire for this gig');
        }

        // CRITICAL: Prevent hiring if gig is already assigned
        // This check must be inside the transaction to prevent race conditions
        if (gig.status === 'assigned') {
            res.status(400);
            throw new Error('This gig has already been assigned to a freelancer');
        }

        // Update gig status to assigned
        gig.status = 'assigned';
        await gig.save({ session });

        // Update selected bid status to hired
        bid.status = 'hired';
        await bid.save({ session });

        // Reject all other pending bids for this gig
        await Bid.updateMany(
            {
                gigId: bid.gigId,
                _id: { $ne: bid._id },
                status: 'pending',
            },
            { status: 'rejected' },
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();

        // Populate and return the hired bid (outside transaction for efficiency or after commit)
        await bid.populate('freelancerId', 'name email');
        await bid.populate('gigId', 'title description budget status');

        // Emit real-time notification to the hired freelancer
        socketIO.emitToUser(bid.freelancerId._id.toString(), 'gig:hired', {
            title: bid.gigId.title,
        });

        res.status(200).json({
            success: true,
            message: 'Freelancer hired successfully',
            bid,
        });
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();

        // Handle MongoDB write conflicts (common in high concurrency)
        if (error.code === 112 || error.name === 'MongoError' && error.codeName === 'WriteConflict') {
            res.status(409);
            return next(new Error('A conflict occurred while processing the hire request. Please try again.'));
        }

        next(error);
    } finally {
        // End the session
        session.endSession();
    }
};

module.exports = {
    createBid,
    getBidsForGig,
    hireBid,
};
