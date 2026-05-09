import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { ACCESS_SECRET } from "../utils/jwt";

let io: SocketIOServer;

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:3000",
        process.env.RESTAURANT_URL || "http://localhost:3001",
        process.env.RIDER_URL || "http://localhost:3002",
        process.env.ADMIN_URL || "http://localhost:3003",
      ],
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
    if (!token) {
      next(new Error("Authentication required"));
      return;
    }
    try {
      const payload = jwt.verify(token, ACCESS_SECRET) as any;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: ${user.id} (${user.role})`);

    // Join user's personal room
    socket.join(`user:${user.id}`);

    // Restaurant joins their restaurant room
    socket.on("join_restaurant", (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
    });

    // Rider joins their room
    socket.on("join_rider", () => {
      socket.join(`rider:${user.id}`);
    });

    // Join order room
    socket.on("join_order", (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    // Leave order room
    socket.on("leave_order", (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    // Chat message
    socket.on("send_message", async (data: { orderId: string; message: string }) => {
      const { orderId, message } = data;
      if (!message?.trim()) return;

      const chatMsg = {
        id: Date.now().toString(),
        orderId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      };

      io.to(`order:${orderId}`).emit("new_chat_message", chatMsg);

      // Persist to DB (fire and forget)
      try {
        const { prisma } = await import("../lib/prisma");
        await prisma.chatMessage.create({ data: chatMsg as any });
      } catch {}
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${user.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
