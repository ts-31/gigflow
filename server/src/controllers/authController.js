const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Set token in HttpOnly cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
const sendTokenResponse = (res, token, user, statusCode = 200) => {
  const cookieExpire = parseInt(process.env.COOKIE_EXPIRE) || 7;

  const options = {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token and send response
    const token = generateToken(user._id);
    sendTokenResponse(res, token, user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide an email and password");
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // Generate token and send response
    const token = generateToken(user._id);
    sendTokenResponse(res, token, user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
