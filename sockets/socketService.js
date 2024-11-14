const socketIo = require('socket.io');
let io; // Define io globally so it can be accessed by other files

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

        // Listen for users joining a session
        socket.on('joinSession', (sessionId) => {
            socket.join(sessionId); // Join the room corresponding to sessionId
            console.log(`Socket ${socket.id} joined room ${sessionId}`);
        });

        // Handle socket disconnections
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};

// Function to send a message to a specific session (room)
const sendMessageToSession = (sessionId, message) => {
    if (io) {
        io.to(sessionId).emit('message', message); // Send message to the room
    } else {
        console.error('Socket.io is not initialized');
    }
};

module.exports = { initializeSocket, sendMessageToSession };
