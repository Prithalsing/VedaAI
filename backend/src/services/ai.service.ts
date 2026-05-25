import { ai, geminiConfig, isGeminiConfigured } from "../config/ai.js";
import { IAssignmentInput, AssessmentPaper, QuestionConfig } from "../types/index.js";
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
  public static async generateQuestionPaper(input: IAssignmentInput): Promise<AssessmentPaper> {
    logger.info("Starting AI generation...");

    const {
      number_of_questions,
      total_marks,
      question_types,
      question_configs,
      additional_instructions,
      reference_text,
    } = input;

    const normalizedConfigs =
      question_configs && question_configs.length > 0
        ? question_configs
        : buildFallbackConfigs(question_types, number_of_questions, total_marks);

    const questionConfigPrompt = normalizedConfigs
      .map(
        (config) =>
          `- ${config.question_type}: ${config.number_of_questions} questions, ${config.marks_per_question} marks each`,
      )
      .join("\n");

    const prompt = `
You are an expert academic assessment creator. Your task is to generate a comprehensive, highly professional, and syllabus-aligned question paper based on the requested criteria.

### Criteria:
- **Total Questions to Generate**: ${number_of_questions}
- **Total Marks for the entire paper**: ${total_marks}
- **Permitted Question Types**: ${question_types.join(", ")}
- **Question Type Breakdown**:
${questionConfigPrompt}
${additional_instructions ? `- **Teacher's Additional Instructions**: ${additional_instructions}` : ""}
${reference_text ? `- **Reference Material/Syllabus Context**:\n${reference_text}` : "- **Reference Material**: No reference file uploaded."}

### Critical Mathematical Requirement:
1. The sum of the "marks" of every single question across all sections MUST sum up EXACTLY to ${total_marks}. Check your arithmetic twice!
2. The total count of questions across all sections MUST equal EXACTLY ${number_of_questions}.
3. Distribute questions into logical sections (e.g. Section A, Section B). Group questions in a section by type (e.g. Section A for MCQs, Section B for Short Answer).
4. The number of questions for each question type MUST match the requested breakdown exactly.
5. The marks assigned to each question of a given type should match the requested marks-per-question unless a strong pedagogical reason requires minor variation.
6. Every question should be clear, exam-ready, and based on the provided reference material when available.
7. Provide a clear, standard exam instruction for each section.
8. Assign a realistic difficulty level ("Easy", "Moderate", "Hard") to each question.

Generate the question paper strictly in the structured format required.
    `;

    if (!isGeminiConfigured) {
      logger.info("Gemini is not configured. Generating high-fidelity mock questions.");
      
      const sections = [];
      let questionIndex = 1;

      for (let sIdx = 0; sIdx < normalizedConfigs.length; sIdx++) {
        const config = normalizedConfigs[sIdx];
        const sectionQuestions = [];

        for (let i = 0; i < config.number_of_questions; i++) {

          sectionQuestions.push({
            question_text: `Mock Question ${questionIndex}: Standard practice problem for type '${config.question_type}'.`,
            question_type: config.question_type,
            difficulty: (i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Moderate" : "Hard") as "Easy" | "Moderate" | "Hard",
            marks: config.marks_per_question,
          });

          questionIndex++;
        }

        sections.push({
          section_name: `Section ${String.fromCharCode(65 + sIdx)}: ${config.question_type}`,
          instruction: `Attempt all questions in this section. Each question carries ${config.marks_per_question} marks.`,
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
        model: geminiConfig.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any,
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

      logger.info(
        `Gemini response validated. Question Count: ${calculatedTotalQuestions}, Total Marks: ${calculatedTotalMarks}`,
      );

      if (calculatedTotalMarks !== total_marks) {
        logger.warn(`AI arithmetic discrepancy: Requested ${total_marks} marks, got ${calculatedTotalMarks} marks instead.`);
      }

      return validatedPaper;
    } catch (error) {
      logger.error("Error during AI Question Paper generation:", error);
      throw error;
    }
  }
}

function buildFallbackConfigs(
  questionTypes: string[],
  numberOfQuestions: number,
  totalMarks: number,
): QuestionConfig[] {
  const questionsPerType = Math.max(1, Math.floor(numberOfQuestions / Math.max(questionTypes.length, 1)));
  const marksPerQuestion = Math.max(1, Math.round(totalMarks / Math.max(numberOfQuestions, 1)));

  return questionTypes.map((questionType, index) => {
    const isLastType = index === questionTypes.length - 1;
    const usedQuestions = questionsPerType * index;
    const remainingQuestions = Math.max(numberOfQuestions - usedQuestions, 0);

    return {
      question_type: questionType,
      number_of_questions: isLastType ? remainingQuestions : questionsPerType,
      marks_per_question: marksPerQuestion,
    };
  });
}
