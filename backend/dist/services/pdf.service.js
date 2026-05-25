import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class PDFService {
    static async generatePaperPDF(result) {
        return new Promise((resolve, reject) => {
            try {
                const uploadsDir = path.join(__dirname, "../..", "uploads");
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const fileName = `assessment-${result.assignment_id}-${Date.now()}.pdf`;
                const filePath = path.join(uploadsDir, fileName);
                const relativePath = `/uploads/${fileName}`;
                const doc = new PDFDocument({ size: "A4", margin: 50 });
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);
                doc.fontSize(16).font("Helvetica-Bold").text("VEDA AI ACADEMY", { align: "center" });
                doc.fontSize(12).font("Helvetica-Bold").text("EXAM ASSIGNMENT PAPER", { align: "center" });
                doc.moveDown();
                doc.fontSize(10).font("Helvetica");
                doc.text("Candidate Name: ___________________________    Roll Number: _________________");
                doc.moveDown(0.5);
                doc.text("Class Section: ____________________________    Date: ________________________");
                doc.moveDown();
                doc.text("--------------------------------------------------------------------------------------------------------");
                doc.moveDown();
                doc.fontSize(10).font("Helvetica-Bold").text("General Instructions:");
                doc.fontSize(9).font("Helvetica-Oblique").text("1. Read all questions carefully before answering.");
                doc.text("2. Answer in the designated spaces or sheets clearly.");
                doc.moveDown();
                doc.text("--------------------------------------------------------------------------------------------------------");
                doc.moveDown();
                let questionCounter = 1;
                result.sections.forEach((section) => {
                    doc.moveDown(0.5);
                    doc.fontSize(11).font("Helvetica-Bold").text(section.section_name, { underline: true });
                    doc.fontSize(9).font("Helvetica-Oblique").text(`(Instruction: ${section.instruction})`);
                    doc.moveDown(0.5);
                    section.questions.forEach((q) => {
                        doc.fontSize(10).font("Helvetica");
                        const questionLine = `Q${questionCounter}. ${q.question_text}`;
                        const metaInfo = ` [Marks: ${q.marks}] (${q.difficulty})`;
                        doc.text(questionLine + metaInfo);
                        doc.moveDown(0.5);
                        questionCounter++;
                    });
                });
                doc.end();
                writeStream.on("finish", () => {
                    logger.info(`Successfully generated simple PDF: ${filePath}`);
                    resolve(relativePath);
                });
                writeStream.on("error", (err) => {
                    logger.error("WriteStream error in PDF service:", err);
                    reject(err);
                });
            }
            catch (error) {
                logger.error("Exception in PDF generation:", error);
                reject(error);
            }
        });
    }
    static async deleteGeneratedPDF(pdfUrl) {
        if (!pdfUrl) {
            return;
        }
        const normalizedPath = pdfUrl.replace(/^\/+/, "");
        const filePath = path.join(__dirname, "../..", normalizedPath);
        if (!fs.existsSync(filePath)) {
            return;
        }
        await fs.promises.unlink(filePath);
        logger.info(`Deleted generated PDF: ${filePath}`);
    }
}
