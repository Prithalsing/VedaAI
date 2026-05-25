import { ai } from "../config/ai.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";
export const QuestionZodSchema = z.object({
    question_text: z.string(),
    question_type: z.string(),
    difficulty: z.enum(["Easy", "Moderate", "Hard"]),
    marks: z.number().positive(),
});
export const SectionZodSchema = z.object({
    section_name: z.string(),
    instruction: z.string(),
    questions: z.array(QuestionZodSchema),
});
export const AssessmentPaperZodSchema = z.object({
    sections: z.array(SectionZodSchema),
});
export class AIService {
    static async generateQuestionPaper(input) {
        logger.info("Starting AI generation with Gemini model...");
        const { number_of_questions, total_marks, question_types, additional_instructions, reference_text, } = input;
        const prompt = `
You are an expert academic assessment creator. Your task is to generate a comprehensive, highly professional, and syllabus-aligned question paper based on the requested criteria.

### Criteria:
- **Total Questions to Generate**: ${number_of_questions}
- **Total Marks for the entire paper**: ${total_marks}
- **Permitted Question Types**: ${question_types.join(", ")}
${additional_instructions ? `- **Teacher's Additional Instructions**: ${additional_instructions}` : ""}
${reference_text ? `- **Reference Material/Syllabus Context**:\n${reference_text}` : "- **Reference Material**: No reference file uploaded."}

### Critical Mathematical Requirement:
1. The sum of the "marks" of every single question across all sections MUST sum up EXACTLY to ${total_marks}. Check your arithmetic twice!
2. The total count of questions across all sections MUST equal EXACTLY ${number_of_questions}.
3. Distribute questions into logical sections (e.g. Section A, Section B). Group questions in a section by type (e.g. Section A for MCQs, Section B for Short Answer).
4. Provide a clear, standard exam instruction for each section.
5. Assign a realistic difficulty level ("Easy", "Moderate", "Hard") to each question.

Generate the question paper strictly in the structured format required.
    `;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey === "") {
            logger.info("GEMINI_API_KEY is not configured. Generating high-fidelity mock questions.");
            const sections = [];
            const questionsPerSection = Math.ceil(number_of_questions / question_types.length);
            let questionIndex = 1;
            let marksAssigned = 0;
            for (let sIdx = 0; sIdx < question_types.length; sIdx++) {
                const qType = question_types[sIdx];
                const sectionQuestions = [];
                const qCountForThisSection = Math.min(questionsPerSection, number_of_questions - questionIndex + 1);
                if (qCountForThisSection <= 0)
                    break;
                for (let i = 0; i < qCountForThisSection; i++) {
                    const isLastQuestion = (questionIndex === number_of_questions);
                    const qMarks = isLastQuestion
                        ? (total_marks - marksAssigned)
                        : Math.max(1, Math.round(total_marks / number_of_questions));
                    marksAssigned += qMarks;
                    sectionQuestions.push({
                        question_text: `Mock Question ${questionIndex}: Standard practice problem for type '${qType}'.`,
                        question_type: qType,
                        difficulty: (i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Moderate" : "Hard"),
                        marks: qMarks,
                    });
                    questionIndex++;
                }
                sections.push({
                    section_name: `Section ${String.fromCharCode(65 + sIdx)}: ${qType} Questions`,
                    instruction: `Attempt all questions in this section. Each question carries marks as indicated.`,
                    questions: sectionQuestions,
                });
            }
            return { sections };
        }
        try {
            const responseSchema = {
                type: "OBJECT",
                properties: {
                    sections: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                section_name: { type: "STRING" },
                                instruction: { type: "STRING" },
                                questions: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            question_text: { type: "STRING" },
                                            question_type: { type: "STRING" },
                                            difficulty: { type: "STRING", enum: ["Easy", "Moderate", "Hard"] },
                                            marks: { type: "NUMBER" },
                                        },
                                        required: ["question_text", "question_type", "difficulty", "marks"],
                                    },
                                },
                            },
                            required: ["section_name", "instruction", "questions"],
                        },
                    },
                },
                required: ["sections"],
            };
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 0.2,
                },
            });
            if (!response.text) {
                throw new Error("Received empty response text from Gemini API.");
            }
            const parsedJSON = JSON.parse(response.text);
            const validatedPaper = AssessmentPaperZodSchema.parse(parsedJSON);
            let calculatedTotalQuestions = 0;
            let calculatedTotalMarks = 0;
            for (const section of validatedPaper.sections) {
                calculatedTotalQuestions += section.questions.length;
                for (const question of section.questions) {
                    calculatedTotalMarks += question.marks;
                }
            }
            logger.info(`Gemini response validated. Question Count: ${calculatedTotalQuestions}, Total Marks: ${calculatedTotalMarks}`);
            if (calculatedTotalMarks !== total_marks) {
                logger.warn(`AI arithmetic discrepancy: Requested ${total_marks} marks, got ${calculatedTotalMarks} marks instead.`);
            }
            return validatedPaper;
        }
        catch (error) {
            logger.error("Error during AI Question Paper generation:", error);
            throw error;
        }
    }
}
// 
