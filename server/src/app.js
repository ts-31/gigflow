const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bidRoutes = require('./routes/bidRoutes');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'GigFlow API is running',
        timestamp: new Date().toISOString(),
    });
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
