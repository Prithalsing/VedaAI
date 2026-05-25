import { Request, Response, NextFunction } from "express";
// @ts-ignore
import * as pdfParse from "pdf-parse";
const parsePDF = (pdfParse as any).default || pdfParse;
import { Assignment } from "../models/assignment.model.js";
import { Result } from "../models/result.model.js";
import { assessmentQueue } from "../queues/queue.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export class AssignmentController {
  public static async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info("Received request to create assignment");
      
      const {
        due_date,
        question_types,
        number_of_questions,
        total_marks,
        additional_instructions,
      } = req.body;

      if (!due_date) {
        throw new AppError("Due date is required.", 400);
      }
      const dateVal = new Date(due_date);
      if (isNaN(dateVal.getTime())) {
        throw new AppError("Due date must be a valid date.", 400);
      }

      if (!question_types || !Array.isArray(question_types) || question_types.length === 0) {
        throw new AppError("Question types must be a non-empty array of strings.", 400);
      }

      const qCount = parseInt(number_of_questions, 10);
      if (isNaN(qCount) || qCount <= 0) {
        throw new AppError("Number of questions must be a positive integer.", 400);
      }

      const tMarks = parseFloat(total_marks);
      if (isNaN(tMarks) || tMarks <= 0) {
        throw new AppError("Total marks must be a positive number.", 400);
      }

      let referenceText = "";
      if (req.file) {
        logger.info(`Extracting text from uploaded file: ${req.file.originalname} (${req.file.mimetype})`);
        
        if (req.file.mimetype === "application/pdf") {
          try {
            const parsedPDF = await parsePDF(req.file.buffer);
            referenceText = parsedPDF.text;
            logger.info("Successfully extracted text from uploaded PDF");
          } catch (pdfErr) {
            logger.error("Failed to parse PDF content:", pdfErr);
            throw new AppError("Could not read text content from uploaded PDF. Make sure it is not corrupt.", 400);
          }
        } else if (req.file.mimetype === "text/plain") {
          referenceText = req.file.buffer.toString("utf-8");
          logger.info("Successfully read text from uploaded TXT file");
        } else {
          throw new AppError("Invalid file type. Only PDF and text files are supported.", 400);
        }
      }

      const newAssignment = new Assignment({
        due_date: dateVal,
        question_types,
        number_of_questions: qCount,
        total_marks: tMarks,
        additional_instructions,
        reference_text: referenceText || undefined,
        status: "pending",
      });

      await newAssignment.save();
      logger.info(`Assignment created in database with ID: ${newAssignment._id}`);

      const job = await assessmentQueue.add(`generate-${newAssignment._id}`, {
        assignment_id: newAssignment._id.toString(),
      });
      logger.info(`Generation job added to queue with Job ID: ${job.id}`);

      res.status(202).json({
        success: true,
        message: "Assignment successfully submitted. Question paper generation started.",
        assignment: newAssignment,
      });

    } catch (error) {
      next(error);
    }
  }

  public static async getAssignmentDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching details for Assignment: ${id}`);

      const assignment = await Assignment.findById(id).populate("generated_paper_id");
      if (!assignment) {
        throw new AppError(`Assignment with ID ${id} not found.`, 404);
      }

      res.status(200).json({
        success: true,
        assignment,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async listAssignments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info("Listing all assignments");
      const assignments = await Assignment.find().sort({ created_at: -1 }).populate("generated_paper_id");
      
      res.status(200).json({
        success: true,
        count: assignments.length,
        assignments,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async regenerateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Request received to regenerate Assignment: ${id}`);

      const assignment = await Assignment.findById(id);
      if (!assignment) {
        throw new AppError(`Assignment with ID ${id} not found.`, 404);
      }

      if (assignment.generated_paper_id) {
        await Result.findByIdAndDelete(assignment.generated_paper_id);
        assignment.generated_paper_id = undefined;
      }

      assignment.status = "pending";
      await assignment.save();

      const job = await assessmentQueue.add(`regenerate-${assignment._id}`, {
        assignment_id: assignment._id.toString(),
      });
      logger.info(`Regeneration job successfully queued with Job ID: ${job.id}`);

      res.status(202).json({
        success: true,
        message: "Question paper regeneration successfully requested.",
        assignment,
      });
    } catch (error) {
      next(error);
    }
  }
}
