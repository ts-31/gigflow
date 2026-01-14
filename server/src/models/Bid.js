const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
    {
        gigId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gig',
            required: true,
        },
        freelancerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: [true, 'Please add a message'],
            maxlength: [1000, 'Message cannot be more than 1000 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'hired', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate bids from same user on same gig
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
