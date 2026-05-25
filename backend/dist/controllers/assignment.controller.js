// @ts-ignore
import * as pdfParse from "pdf-parse";
const parsePDF = pdfParse.default || pdfParse;
import { Assignment } from "../models/assignment.model.js";
import { Result } from "../models/result.model.js";
import { assessmentQueue } from "../queues/queue.js";
import { PDFService } from "../services/pdf.service.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
export class AssignmentController {
    static async createAssignment(req, res, next) {
        try {
            logger.info("Received request to create assignment");
            const { due_date, question_types, question_configs, number_of_questions, total_marks, additional_instructions, } = req.body;
            if (!due_date) {
                throw new AppError("Due date is required.", 400);
            }
            const dateVal = new Date(due_date);
            if (isNaN(dateVal.getTime())) {
                throw new AppError("Due date must be a valid date.", 400);
            }
            const parsedConfigs = typeof question_configs === "string"
                ? JSON.parse(question_configs)
                : question_configs;
            const hasStructuredConfigs = Array.isArray(parsedConfigs) && parsedConfigs.length > 0;
            let normalizedQuestionTypes = [];
            let qCount = 0;
            let tMarks = 0;
            let normalizedConfigs;
            if (hasStructuredConfigs) {
                normalizedConfigs = parsedConfigs.map((config) => {
                    const questionType = String(config?.question_type || "").trim();
                    const questionCount = Number(config?.number_of_questions);
                    const marksPerQuestion = Number(config?.marks_per_question);
                    if (!questionType) {
                        throw new AppError("Each question config must include a question type.", 400);
                    }
                    if (!Number.isInteger(questionCount) || questionCount <= 0) {
                        throw new AppError("Each question config must include a positive number of questions.", 400);
                    }
                    if (Number.isNaN(marksPerQuestion) || marksPerQuestion <= 0) {
                        throw new AppError("Each question config must include positive marks per question.", 400);
                    }
                    return {
                        question_type: questionType,
                        number_of_questions: questionCount,
                        marks_per_question: marksPerQuestion,
                    };
                });
                normalizedQuestionTypes = normalizedConfigs.map((config) => config.question_type);
                qCount = normalizedConfigs.reduce((sum, config) => sum + config.number_of_questions, 0);
                tMarks = normalizedConfigs.reduce((sum, config) => sum + config.number_of_questions * config.marks_per_question, 0);
            }
            else {
                if (!question_types || !Array.isArray(question_types) || question_types.length === 0) {
                    throw new AppError("Question types must be a non-empty array of strings.", 400);
                }
                normalizedQuestionTypes = question_types.map((questionType) => String(questionType).trim()).filter(Boolean);
                if (normalizedQuestionTypes.length === 0) {
                    throw new AppError("Question types must contain valid values.", 400);
                }
                qCount = parseInt(number_of_questions, 10);
                if (isNaN(qCount) || qCount <= 0) {
                    throw new AppError("Number of questions must be a positive integer.", 400);
                }
                tMarks = parseFloat(total_marks);
                if (isNaN(tMarks) || tMarks <= 0) {
                    throw new AppError("Total marks must be a positive number.", 400);
                }
            }
            let referenceText = "";
            if (req.file) {
                logger.info(`Extracting text from uploaded file: ${req.file.originalname} (${req.file.mimetype})`);
                if (req.file.mimetype === "application/pdf") {
                    try {
                        const parsedPDF = await parsePDF(req.file.buffer);
                        referenceText = parsedPDF.text;
                        logger.info("Successfully extracted text from uploaded PDF");
                    }
                    catch (pdfErr) {
                        logger.error("Failed to parse PDF content:", pdfErr);
                        throw new AppError("Could not read text content from uploaded PDF. Make sure it is not corrupt.", 400);
                    }
                }
                else if (req.file.mimetype === "text/plain") {
                    referenceText = req.file.buffer.toString("utf-8");
                    logger.info("Successfully read text from uploaded TXT file");
                }
                else {
                    throw new AppError("Invalid file type. Only PDF and text files are supported.", 400);
                }
            }
            const newAssignment = new Assignment({
                due_date: dateVal,
                question_types: normalizedQuestionTypes,
                number_of_questions: qCount,
                total_marks: tMarks,
                question_configs: normalizedConfigs,
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getAssignmentDetails(req, res, next) {
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
        }
        catch (error) {
            next(error);
        }
    }
    static async listAssignments(_req, res, next) {
        try {
            logger.info("Listing all assignments");
            const assignments = await Assignment.find().sort({ created_at: -1 }).populate("generated_paper_id");
            res.status(200).json({
                success: true,
                count: assignments.length,
                assignments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async regenerateAssignment(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`Request received to regenerate Assignment: ${id}`);
            const assignment = await Assignment.findById(id);
            if (!assignment) {
                throw new AppError(`Assignment with ID ${id} not found.`, 404);
            }
            if (assignment.generated_paper_id) {
                const existingResult = await Result.findById(assignment.generated_paper_id);
                if (existingResult?.pdf_url) {
                    await PDFService.deleteGeneratedPDF(existingResult.pdf_url);
                }
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
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAssignment(req, res, next) {
        try {
            const { id } = req.params;
            logger.info(`Request received to delete Assignment: ${id}`);
            const assignment = await Assignment.findById(id);
            if (!assignment) {
                throw new AppError(`Assignment with ID ${id} not found.`, 404);
            }
            if (assignment.generated_paper_id) {
                const result = await Result.findById(assignment.generated_paper_id);
                if (result?.pdf_url) {
                    await PDFService.deleteGeneratedPDF(result.pdf_url);
                }
                await Result.findByIdAndDelete(assignment.generated_paper_id);
            }
            await Assignment.findByIdAndDelete(id);
            res.status(200).json({
                success: true,
                message: "Assignment deleted successfully.",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
