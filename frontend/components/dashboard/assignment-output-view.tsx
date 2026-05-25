import { Download, FileText, RefreshCcw } from "lucide-react";
import { getGeneratedPaper, getServerBaseUrl } from "@/lib/assignment-api";
import { Assignment, Difficulty } from "@/lib/assignment-types";

type AssignmentOutputViewProps = {
  assignment: Assignment;
  onBack: () => void;
  onRegenerate: () => void;
};

export function AssignmentOutputView({
  assignment,
  onRegenerate,
}: AssignmentOutputViewProps) {
  const generatedPaper = getGeneratedPaper(assignment);

  if (!generatedPaper) {
    return (
      <section className="flex flex-1 items-center justify-center rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f5f2_45%,#efebe5_100%)] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Question paper not ready
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This assignment is still being generated. Once the worker finishes,
            the paper will appear here automatically.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f5f2_45%,#efebe5_100%)]">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(148,163,184,0.16)]">
          <div className="bg-slate-950 px-5 py-4 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {buildAssignmentTitle(assignment)}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  {assignment.additional_instructions?.trim() ||
                    "Generated paper based on the submitted assignment criteria."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {generatedPaper.pdf_url ? (
                  <a
                    href={`${getServerBaseUrl()}${generatedPaper.pdf_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download as PDF
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          <div className="border-x-4 border-amber-300 bg-white px-5 py-8 sm:px-8 lg:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                Delhi Public School, Sector-4, Bokaro
              </h2>
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p>Subject: Generated Assessment</p>
                <p>Due Date: {formatShortDate(assignment.due_date)}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p>Time Allowed: 45 minutes</p>
              <p className="sm:text-right">
                Maximum Marks: {assignment.total_marks}
              </p>
            </div>

            <p className="mt-4 text-sm text-slate-700">
              All questions are compulsory unless stated otherwise.
            </p>

            <div className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <span className="font-medium">Name:</span> __________________
              </p>
              <p>
                <span className="font-medium">Roll Number:</span> __________________
              </p>
              <p>
                <span className="font-medium">Class:</span> __________________
              </p>
              <p>
                <span className="font-medium">Section:</span> __________________
              </p>
            </div>

            <div className="mt-8 space-y-10">
              {generatedPaper.sections.map((section) => (
                <div key={section.section_name}>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {section.section_name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {section.instruction}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileText className="h-4 w-4" />
                      Questions
                    </div>
                    <ol className="mt-4 space-y-5 pl-5 text-sm leading-7 text-slate-700">
                      {section.questions.map((question, index) => (
                        <li key={`${section.section_name}-${index}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <p className="pr-3">{question.question_text}</p>
                            <div className="flex shrink-0 items-center gap-2">
                              <DifficultyBadge
                                difficulty={question.difficulty}
                              />
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                {question.marks} marks
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const styles = {
    Easy: "bg-emerald-100 text-emerald-700",
    Moderate: "bg-amber-100 text-amber-700",
    Hard: "bg-rose-100 text-rose-700",
  } as const;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

function buildAssignmentTitle(assignment: Assignment): string {
  if (assignment.question_configs?.[0]?.question_type) {
    return `${assignment.question_configs[0].question_type} Assessment`;
  }

  if (assignment.question_types[0]) {
    return `${assignment.question_types[0]} Assessment`;
  }

  return "Generated Assessment";
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}
