import { Server } from "socket.io";
import { logger } from "../utils/logger.js";
let io = null;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        logger.info(`Socket connected: ${socket.id}`);
        socket.on("join_assignment", (assignmentId) => {
            if (assignmentId) {
                socket.join(assignmentId);
                logger.info(`Socket ${socket.id} joined room: ${assignmentId}`);
                socket.emit("joined", { room: assignmentId });
            }
        });
        socket.on("disconnect", () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};
export const notifyClient = (assignmentId, event, data) => {
    try {
        const ioInstance = getIO();
        ioInstance.to(assignmentId).emit(event, data);
        logger.info(`WebSocket emitted '${event}' to room '${assignmentId}'`, data);
    }
    catch (error) {
        logger.warn(`Could not emit socket event: ${error}`);
    }
};
