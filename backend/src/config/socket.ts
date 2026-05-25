import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger.js";

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("join_assignment", (assignmentId: string) => {
      if (assignmentId) {
        socket.join(assignmentId);
        logger.info(`Socket ${socket.id} joined room: ${assignmentId}`);
        socket.emit("joined", { room: assignmentId });
      }

      // TEST EVENT
      notifyClient(
        assignmentId,
        "job_completed",
        {
          success: true,
          message: "Assignment finished"
        }
      );
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

export const notifyClient = (assignmentId: string, event: string, data: any): void => {
  try {
    const ioInstance = getIO();
    ioInstance.to(assignmentId).emit(event, data);
    logger.info(`WebSocket emitted '${event}' to room '${assignmentId}'`, data);
  } catch (error) {
    logger.warn(`Could not emit socket event: ${error}`);
  }
};
