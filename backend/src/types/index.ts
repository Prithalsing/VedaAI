export type Difficulty = "Easy" | "Moderate" | "Hard";

export interface Question {
  question_text: string;
  question_type: string; // e.g. "MCQ", "Short Answer", "Long Answer", "True/False"
  difficulty: Difficulty;
  marks: number;
}

export interface Section {
  section_name: string; // e.g. "Section A"
  instruction: string;  // e.g. "Answer all questions"
  questions: Question[];
}

export interface AssessmentPaper {
  sections: Section[];
}

export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";

export interface QuestionConfig {
  question_type: string;
  number_of_questions: number;
  marks_per_question: number;
 }

export interface IAssignmentInput {
  due_date: Date;
  question_types: string[];
  number_of_questions: number;
  total_marks: number;
  question_configs?: QuestionConfig[];
  additional_instructions?: string;
  reference_text?: string;
}

export interface IAssignment extends IAssignmentInput {
  id: string;
  status: AssignmentStatus;
  generated_paper_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IResult {
  id: string;
  assignment_id: string;
  sections: Section[];
  pdf_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JobData {
  assignment_id: string;
}

export interface PDFJobData {
  result_id: string;
}
