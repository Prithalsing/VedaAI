import express from "express";
import assignmentRoutes from "./assignment.routes.js";
const router = express.Router();
router.use("/assignments", assignmentRoutes);
router.get("/status", (_req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});
export default router;
