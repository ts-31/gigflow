const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
    // Await the database connection before handling the request
    await connectDB();

    // Forward the request to the Express app
    app(req, res);
};
