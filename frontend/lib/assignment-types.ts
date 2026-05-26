export type Difficulty = "Easy" | "Moderate" | "Hard";

export type QuestionConfig = {
  question_type: string;
  number_of_questions: number;
  marks_per_question: number;
};

export type Question = {
  question_text: string;
  question_type: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  correct_answer?: string;
};

export type Section = {
  section_name: string;
  instruction: string;
  questions: Question[];
};

export type GeneratedPaper = {
  id: string;
  assignment_id: string;
  sections: Section[];
  pdf_url?: string;
  created_at: string;
  updated_at: string;
};

export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";

export type Assignment = {
  id: string;
  due_date: string;
  question_types: string[];
  number_of_questions: number;
  total_marks: number;
  question_configs?: QuestionConfig[];
  additional_instructions?: string;
  reference_text?: string;
  assignment_title?: string;
  status: AssignmentStatus;
  generated_paper_id?: GeneratedPaper | string;
  created_at: string;
  updated_at: string;
};

export type CreateAssignmentInput = {
  dueDate: string;
  questionConfigs: QuestionConfig[];
  additionalInstructions?: string;
  assignmentTitle?: string;
  file?: File | null;
};

export type SocketJobEvent = {
  assignment_id: string;
  status: AssignmentStatus;
  message: string;
  assignment?: Assignment;
  result?: GeneratedPaper;
};
