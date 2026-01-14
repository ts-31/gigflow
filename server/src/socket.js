const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // userId -> Set of socketIds

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId && userId !== 'undefined') {
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);
            console.log(`User ${userId} connected with socket ${socket.id}`);
        }

        socket.on('disconnect', () => {
            if (userId && userSockets.has(userId)) {
                userSockets.get(userId).delete(socket.id);
                if (userSockets.get(userId).size === 0) {
                    userSockets.delete(userId);
                }
                console.log(`User ${userId} disconnected socket ${socket.id}`);
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const emitToUser = (userId, event, payload) => {
    if (userSockets.has(userId)) {
        userSockets.get(userId).forEach((socketId) => {
            io.to(socketId).emit(event, payload);
        });
        return true;
    }
    return false;
};

module.exports = {
    init,
    getIO,
    emitToUser,
};
