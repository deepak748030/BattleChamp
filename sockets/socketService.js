// sockets/socketService.js

const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // Allow CORS from any origin; update as needed
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Example custom event: handle incoming messages
        socket.on('message', (data) => {
            console.log(`Message received: ${data}`);
            io.emit('message', data); // Broadcast message to all clients
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initializeSocket, getIo };
