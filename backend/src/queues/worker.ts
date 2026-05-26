import { Worker, Job } from "bullmq";
import { redisConfig } from "../config/redis.js";
import { Assignment } from "../models/assignment.model.js";
import { Result } from "../models/result.model.js";
import { AIService } from "../services/ai.service.js";
import { CacheService } from "../services/cache.service.js";
import { PDFService } from "../services/pdf.service.js";
import { notifyClient } from "../config/socket.js";
import { logger } from "../utils/logger.js";
import { JobData } from "../types/index.js";

const processAssessmentJob = async (job: Job<JobData>) => {
  const { assignment_id } = job.data;
  logger.info(`Processing generation job for Assignment: ${assignment_id}`);

  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) {
    logger.error(`Assignment not found: ${assignment_id}`);
    throw new Error("Assignment not found");
  }

  try {
    assignment.status = "processing";
    await assignment.save();
    await CacheService.invalidateAssignmentCaches(assignment_id);

    notifyClient(assignment_id, "job_status_change", {
      assignment_id,
      status: "processing",
      message: "Generating assessment questions...",
    });

    const generatedPaper = await AIService.generateQuestionPaper({
      due_date: assignment.due_date,
      question_types: assignment.question_types,
      number_of_questions: assignment.number_of_questions,
      total_marks: assignment.total_marks,
      question_configs: (assignment as any).question_configs,
      additional_instructions: assignment.additional_instructions,
      reference_text: assignment.reference_text,
    });

    const resultDoc = new Result({
      assignment_id: assignment._id,
      sections: generatedPaper.sections,
    });
    await resultDoc.save();

    const pdfRelativeUrl = await PDFService.generatePaperPDF(resultDoc.toJSON() as any);

    resultDoc.pdf_url = pdfRelativeUrl;
    await resultDoc.save();

    assignment.status = "completed";
    assignment.generated_paper_id = resultDoc._id as any;
    await assignment.save();
    await CacheService.invalidateAssignmentCaches(assignment_id);

    const finalAssignment = await Assignment.findById(assignment_id).populate("generated_paper_id");

    notifyClient(assignment_id, "job_completed", {
      assignment_id,
      status: "completed",
      message: "Question paper successfully generated!",
    });

    logger.info(`Successfully completed job for Assignment: ${assignment_id}`);
    return { success: true };

  } catch (error: any) {
    const attemptsLimit = job.opts.attempts || 1;
    const isFinalAttempt = (job.attemptsMade + 1) >= attemptsLimit;

    logger.error(
      `Failed job attempt for Assignment: ${assignment_id} (Attempt ${job.attemptsMade + 1} of ${attemptsLimit})`,
      error
    );

    if (isFinalAttempt) {
      assignment.status = "failed";
      await assignment.save();
      await CacheService.invalidateAssignmentCaches(assignment_id);

      notifyClient(assignment_id, "job_failed", {
        assignment_id,
        status: "failed",
        message: error.message || "Question paper generation failed after maximum attempts.",
      });
    } else {
      notifyClient(assignment_id, "job_status_change", {
        assignment_id,
        status: "processing",
        message: `Generation attempt failed. Retrying shortly... (Attempt ${job.attemptsMade + 2} of ${attemptsLimit})`,
      });
    }

    throw error;
  }
};

export const startWorker = (): Worker => {
  logger.info("Starting background queue worker...");
  
  const worker = new Worker("assessment-generation", processAssessmentJob, {
    connection: redisConfig,
    lockDuration: 60000,
  });

  worker.on("ready", () => {
    logger.info("Queue Worker is connected and listening for jobs");
  });

  return worker;
};
