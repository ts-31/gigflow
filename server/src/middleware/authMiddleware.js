const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 * Validates JWT from HttpOnly cookies
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from HttpOnly cookie
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided',
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token payload
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found',
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token invalid',
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { protect };
