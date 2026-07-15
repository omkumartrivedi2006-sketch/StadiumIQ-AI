import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join room based on user role (for role-specific broadcasts)
    socket.on("join-role-room", (role: string) => {
      if (role && ["fan", "volunteer", "organizer", "admin"].includes(role)) {
        socket.join(role);
        console.log(`[Socket.IO] Client ${socket.id} joined room: ${role}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitEvent(event: string, data: any, room?: string) {
  if (!io) {
    console.warn("[Socket.IO] io is not initialized yet. Event skipped:", event);
    return;
  }
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
}
