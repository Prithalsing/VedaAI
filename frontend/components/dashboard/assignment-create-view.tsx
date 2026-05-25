"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  CirclePlus,
  CloudUpload,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { CreateAssignmentInput, QuestionConfig } from "@/lib/assignment-types";

const questionTypeOptions = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
];

type AssignmentCreateViewProps = {
  onBack: () => void;
  onSubmit: (input: CreateAssignmentInput) => Promise<void>;
  submitting: boolean;
};

type FormErrors = {
  dueDate?: string;
  questionConfigs?: string;
  file?: string;
};

export function AssignmentCreateView({
  onBack,
  onSubmit,
  submitting,
}: AssignmentCreateViewProps) {
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [questionConfigs, setQuestionConfigs] = useState<QuestionConfig[]>([
    {
      question_type: "Multiple Choice Questions",
      number_of_questions: 4,
      marks_per_question: 1,
    },
    {
      question_type: "Short Questions",
      number_of_questions: 3,
      marks_per_question: 2,
    },
  ]);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const totalQuestions = useMemo(
    () =>
      questionConfigs.reduce(
        (sum, config) => sum + config.number_of_questions,
        0,
      ),
    [questionConfigs],
  );
  const totalMarks = useMemo(
    () =>
      questionConfigs.reduce(
        (sum, config) =>
          sum + config.number_of_questions * config.marks_per_question,
        0,
      ),
    [questionConfigs],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setFile(null);
      return;
    }

    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(nextFile.type)) {
      setErrors((current) => ({
        ...current,
        file: "Only PDF or text files are supported.",
      }));
      return;
    }

    setErrors((current) => ({ ...current, file: undefined }));
    setFile(nextFile);
  };

  const handleQuestionConfigChange = (
    index: number,
    field: keyof QuestionConfig,
    value: string | number,
  ) => {
    setQuestionConfigs((current) =>
      current.map((config, currentIndex) =>
        currentIndex === index
          ? {
              ...config,
              [field]:
                field === "question_type"
                  ? value
                  : Math.max(1, Number(value) || 1),
            }
          : config,
      ),
    );
  };

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {};

    if (!dueDate) {
      nextErrors.dueDate = "Due date is required.";
    }

    if (
      questionConfigs.length === 0 ||
      questionConfigs.some(
        (config) =>
          !config.question_type ||
          config.number_of_questions <= 0 ||
          config.marks_per_question <= 0,
      )
    ) {
      nextErrors.questionConfigs =
        "Each question type needs a valid name, question count, and marks.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      dueDate,
      questionConfigs,
      additionalInstructions,
      file,
    });
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f5f2_45%,#efebe5_100%)]">
      <div className="px-4 pb-4 pt-5 sm:px-6">
        <div className="max-w-5xl">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Create Assignment
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Set up a new assignment for your students.
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-slate-200">
            <div className="h-full w-[48%] rounded-full bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-4xl rounded-[30px] border border-white/70 bg-white/70 p-4 shadow-[0_24px_80px_rgba(148,163,184,0.16)] backdrop-blur sm:p-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Assignment Details
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Basic information about your assignment.
            </p>
          </div>

          <label className="mt-5 block rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
              <CloudUpload className="h-4.5 w-4.5" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700">
              Choose a file or drag & drop it here
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PDF or text file, up to 10MB
            </p>
            <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              Browse Files
            </div>
            <input
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          <p className="mt-3 text-center text-xs text-slate-400">
            {file ? `${file.name} selected` : "Upload reference text or a syllabus PDF"}
          </p>
          {errors.file ? (
            <p className="mt-2 text-sm text-rose-600">{errors.file}</p>
          ) : null}

          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Due Date
            </label>
            <div className="relative mt-2">
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
              <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.dueDate ? (
              <p className="mt-2 text-sm text-rose-600">{errors.dueDate}</p>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] gap-3 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:grid-cols-[minmax(0,1fr)_110px_100px]">
              <span>Question Type</span>
              <span className="text-center">Questions</span>
              <span className="text-center">Marks</span>
            </div>

            <div className="mt-3 space-y-3">
              {questionConfigs.map((config, index) => (
                <QuestionTypeRow
                  key={`${config.question_type}-${index}`}
                  config={config}
                  onChange={handleQuestionConfigChange}
                  onRemove={() =>
                    setQuestionConfigs((current) =>
                      current.length === 1
                        ? current
                        : current.filter((_, currentIndex) => currentIndex !== index),
                    )
                  }
                  index={index}
                />
              ))}
            </div>

            {errors.questionConfigs ? (
              <p className="mt-2 text-sm text-rose-600">
                {errors.questionConfigs}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() =>
                setQuestionConfigs((current) => [
                  ...current,
                  {
                    question_type: questionTypeOptions[0],
                    number_of_questions: 1,
                    marks_per_question: 1,
                  },
                ])
              }
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
              <CirclePlus className="h-4.5 w-4.5 fill-slate-900 text-white" />
              Add Question Type
            </button>

            <div className="mt-4 space-y-1 text-right text-xs text-slate-500">
              <p>
                Total Questions:{" "}
                <span className="font-semibold text-slate-800">
                  {totalQuestions}
                </span>
              </p>
              <p>
                Total Marks:{" "}
                <span className="font-semibold text-slate-800">{totalMarks}</span>
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-xs font-semibold text-slate-700">
              Additional Information (For better output)
            </label>
            <div className="mt-2 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <textarea
                rows={4}
                value={additionalInstructions}
                onChange={(event) => setAdditionalInstructions(event.target.value)}
                placeholder="e.g. Generate a question paper for a 3 hour exam duration..."
                className="w-full resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-4xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Generate Assignment"}
          </button>
        </div>
      </div>
    </section>
  );
}

type QuestionTypeRowProps = {
  config: QuestionConfig;
  index: number;
  onChange: (
    index: number,
    field: keyof QuestionConfig,
    value: string | number,
  ) => void;
  onRemove: () => void;
};

function QuestionTypeRow({
  config,
  index,
  onChange,
  onRemove,
}: QuestionTypeRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_110px_100px]">
      <div className="flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 shadow-sm">
        <select
          value={config.question_type}
          onChange={(event) =>
            onChange(index, "question_type", event.target.value)
          }
          className="w-full appearance-none bg-transparent text-sm text-slate-700 outline-none"
        >
          {questionTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="ml-3 flex items-center gap-3">
          <button type="button" onClick={onRemove} className="text-slate-300">
            <X className="h-3.5 w-3.5" />
          </button>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      <CounterPill
        value={config.number_of_questions}
        onChange={(nextValue) =>
          onChange(index, "number_of_questions", nextValue)
        }
      />
      <CounterPill
        value={config.marks_per_question}
        onChange={(nextValue) =>
          onChange(index, "marks_per_question", nextValue)
        }
      />
    </div>
  );
}

function CounterPill({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex h-11 items-center justify-between rounded-full border border-slate-200 bg-white px-3 shadow-sm">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="text-slate-400"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="text-slate-400"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
