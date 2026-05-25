import express, { Request, Response } from "express";
import assignmentRoutes from "./assignment.routes.js";

const router = express.Router();

router.use("/assignments", assignmentRoutes);

router.get("/status", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
