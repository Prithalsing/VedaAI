import express from "express";
import multer from "multer";
import { AssignmentController } from "../controllers/assignment.controller.js";
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
const router = express.Router();
router.post("/", upload.single("file"), AssignmentController.createAssignment);
router.get("/", AssignmentController.listAssignments);
router.get("/:id", AssignmentController.getAssignmentDetails);
router.post("/:id/regenerate", AssignmentController.regenerateAssignment);
router.delete("/:id", AssignmentController.deleteAssignment);
export default router;
