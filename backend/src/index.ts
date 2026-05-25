import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import { startWorker } from "./queues/worker.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  logger.info("Initializing backend assessment server...");
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  startWorker();

  server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

bootstrap();
