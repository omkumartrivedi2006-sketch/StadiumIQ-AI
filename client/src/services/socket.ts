import { io, Socket } from "socket.io-client";

// In local dev, Vite proxies /api, but Socket.IO connects directly to backend port 5000 (or uses origin)
const SOCKET_URL = import.meta.env.PROD 
  ? window.location.origin 
  : "http://localhost:5000";

let socket: Socket | null = null;
const fallbackListeners: Record<string, Set<Function>> = {};

export const socketService = {
  connect(userId: string, role: string): Socket | null {
    if (socket?.connected) return socket;

    try {
      socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: true,
      });

      socket.on("connect", () => {
        console.log("[Socket.IO] Connected successfully. Registering user:", userId);
        socket?.emit("register-user", { userId, role });
      });

      socket.on("connect_error", (err) => {
        console.warn("[Socket.IO] Connection error. Running in local fallback mode:", err.message);
      });

      // Bind all registered fallback listeners to active socket
      Object.keys(fallbackListeners).forEach((event) => {
        fallbackListeners[event].forEach((cb) => {
          socket?.on(event, cb as any);
        });
      });

    } catch (e) {
      console.warn("[Socket.IO] Failed to initialize. Operating in fallback simulator mode.");
    }

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log("[Socket.IO] Disconnected");
    }
  },

  emit(event: string, data: any) {
    if (socket) {
      socket.emit(event, data);
    } else {
      console.warn("[Socket.IO] Cannot emit event. Socket is offline:", event);
    }
  },

  on(event: string, callback: Function) {
    if (!fallbackListeners[event]) {
      fallbackListeners[event] = new Set();
    }
    fallbackListeners[event].add(callback);

    if (socket) {
      socket.on(event, callback as any);
    }
  },

  off(event: string, callback: Function) {
    if (fallbackListeners[event]) {
      fallbackListeners[event].delete(callback);
    }
    if (socket) {
      socket.off(event, callback as any);
    }
  },

  // LOCAL SIMULATOR (Fires alerts periodically in dev mode if connection is slow or missing)
  triggerLocalSimulation(event: string, data: any) {
    console.log(`[Socket Fallback] Firing simulated event "${event}"`, data);
    if (fallbackListeners[event]) {
      fallbackListeners[event].forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in fallback listener for event ${event}:`, err);
        }
      });
    }
  }
};
