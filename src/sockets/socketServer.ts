import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const connectedUsers = new Map<string, string>();
let io: IOServer;

interface JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

export const initializeSocket = (server: HttpServer): IOServer => {
  io = new IOServer(server, {
    cors: {
      origin: '*', // or your frontend domain
      methods: ['GET', 'POST'],
    },
  });

  // Authenticate socket before connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      (socket as any).user = decoded;
      next();
    } catch (error) {
      console.error('❌ Socket auth failed:', error);
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`🔌 User connected: ${user.id}, Socket: ${socket.id}`);

    // Register user to socket ID map
    connectedUsers.set(user.id, socket.id);

    // Listen for any incoming chat events (optional for now)
    socket.on('chat:send', (data) => {
      // You’ll queue this later using BullMQ
      console.log(`📩 Incoming message from ${user.id}:`, data);
    });

    socket.on('disconnect', () => {
      // Clean up the disconnected user's mapping
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`❌ User disconnected: ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

// Export connectedUsers map to access elsewhere (e.g., queue worker)
export { connectedUsers };
