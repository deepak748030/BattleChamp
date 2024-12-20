const express = require('express');
const http = require('http'); // Import http to create server
const dotenv = require('dotenv');
const cors = require('cors'); // Import the CORS middleware
const connectDB = require('./config/db'); // Database connection
const morgan = require('morgan');
const path = require('path');
const { initializeSocket } = require('./sockets/socketService'); // Import the initializeSocket function
const { simulateBotPushToRank } = require('./utils/prizeDistribution');
require('./utils/contestStatus');
require('./utils/botAddSysytem')

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app); // Create server with http

// Connect to the database
connectDB();
// Enable CORS for all routes with additional options
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Allow only specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true, // Allow credentials like cookies and authorization headers
}));

// Middleware to parse incoming requests
app.use(express.json());
app.use(morgan('dev'));

// Home route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the user routes
app.use('/api/user', require('./routes/usersRoutes'));
app.use('/api', require('./routes/referralRoutes'));
app.use('/api', require('./routes/allGamesRoutes'));
app.use('/api', require('./routes/contestDetailsRoutes'));
app.use('/api', require('./routes/contestRoutes'));
app.use('/api', require('./routes/userContestRoutes'));
app.use('/api', require('./routes/winnersRoutes'));
app.use('/api', require('./routes/leaderboardRoutes'));
app.use('/api', require('./routes/gameResults'));
app.use('/api', require('./routes/adminRoute'));
app.use("/api/settings", require('./routes/settings.routes'));
app.use("/api/transaction", require('./routes/transactionRoute'));

// Initialize Socket.io with the HTTP server
initializeSocket(server);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
