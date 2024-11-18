const socketIo = require('socket.io');
let io; // Define io globally so it can be accessed by other files
let Socket; // Define Socket globally so it can be used later

// Initialize socket.io server
const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Handle socket connections
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        Socket = socket;
        // Handle socket disconnections
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};

// Function to send a message to a specific session (room)
const sendMessageToSession = (sessionId, score) => {
    if (io && Socket) {
        Socket.join(sessionId); // Use the Socket variable here
        io.to(sessionId).emit('room', score); // Send message to the room
    } else {
        console.error('Socket.io is not initialized or no client is connected');
    }
};

// Function to get the Socket.io instance
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized');
    }
    return io;
};

module.exports = { initializeSocket, sendMessageToSession, getIo };