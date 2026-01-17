import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const initializeSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Real-time inventory updates
    socket.on('inventory:update', (data) => {
      io.emit('inventory:updated', data);
    });

    // Real-time sales updates
    socket.on('sale:created', (data) => {
      io.emit('sale:new', data);
    });

    // Real-time purchase updates
    socket.on('purchase:created', (data) => {
      io.emit('purchase:new', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
