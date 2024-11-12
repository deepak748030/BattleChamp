const express = require('express');
const http = require('http'); // Import http to create server
const dotenv = require('dotenv');
const cors = require('cors'); // Import the CORS middleware
const connectDB = require('./config/db'); // Database connection
const morgan = require('morgan');
const { initializeSocket } = require('./sockets/socketService'); // Import the initializeSocket function

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app); // Create server with http

// Connect to the database
connectDB();

// Enable CORS for all routes
app.use(cors({
  origin: '*'
}));

// Middleware to parse incoming requests
app.use(express.json());
app.use(morgan('dev'));

// Home route
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Use the user routes
app.use('/api/user', require('./routes/usersRoutes'));
app.use('/api', require('./routes/allGamesRoutes'));
app.use('/api', require('./routes/contestDetailsRoutes'));
app.use('/api', require('./routes/contestRoutes'));
app.use('/api', require('./routes/userContestRoutes'));
app.use('/api', require('./routes/winnersRoutes'));
app.use('/api', require('./routes/leaderboardRoutes'));

// Initialize Socket.io with the HTTP server
initializeSocket(server);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
