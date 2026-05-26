"use client";

import { useMemo, useState } from "react";
import { Eye, MoreVertical, Search, Trash2 } from "lucide-react";
import { Assignment } from "@/lib/assignment-types";
import { CreateAssignmentButton } from "./create-assignment-button";

type AssignmentListViewProps = {
  assignments: Assignment[];
  selectedAssignmentId: string | null;
  onCreateAssignment: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
  onViewAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignment: Assignment) => void;
};

export function AssignmentListView({
  assignments,
  selectedAssignmentId,
  onCreateAssignment,
  onSelectAssignment,
  onViewAssignment,
  onDeleteAssignment,
}: AssignmentListViewProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return assignments;
    return assignments.filter((a) => {
      const title = buildAssignmentTitle(a).toLowerCase();
      const subtitle = buildAssignmentSubtitle(a).toLowerCase();
      const status = a.status.toLowerCase();
      return title.includes(query) || subtitle.includes(query) || status.includes(query);
    });
  }, [assignments, searchQuery]);

  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f5f2_45%,#efebe5_100%)]">
      <div className="border-b border-slate-200/80 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                Assignments
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Manage and create assignments for your classes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-medium text-slate-400">Filter By</div>

            <label className="relative block w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-24 pt-3 sm:px-4 sm:pb-28">
        <div className="grid gap-3 xl:grid-cols-2">
          {filteredAssignments.map((assignment) => {
            const active = assignment.id === selectedAssignmentId;
            const menuOpen = assignment.id === openMenuId;

            return (
              <article
                key={assignment.id}
                onClick={() => {
                  setOpenMenuId(null);
                  onSelectAssignment(assignment);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpenMenuId(null);
                    onSelectAssignment(assignment);
                  }
                }}
                role="button"
                tabIndex={0}
                className={[
                  "relative rounded-[22px] border bg-white/90 p-4 text-left shadow-[0_8px_24px_rgba(148,163,184,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(148,163,184,0.16)] focus:outline-none focus:ring-2 focus:ring-slate-900/10",
                  active
                    ? "border-slate-900/20 ring-2 ring-slate-900/10"
                    : "border-slate-200/80",
                  menuOpen ? "z-30" : "z-10",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate pr-2 text-sm font-semibold text-slate-900 sm:text-[15px]">
                      {buildAssignmentTitle(assignment)}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {buildAssignmentSubtitle(assignment)}
                    </p>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <StatusBadge status={assignment.status} />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId(menuOpen ? null : assignment.id);
                      }}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Assignment actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuOpen ? (
                      <div
                        className="absolute right-0 top-[calc(100%+0.4rem)] z-20 w-[176px] rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.16)]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onViewAssignment(assignment);
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4 shrink-0" />
                          <span className="leading-5">View Assignment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDeleteAssignment(assignment);
                          }}
                          className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          <span className="leading-5">Delete</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-2 text-[11px] font-medium text-slate-500 sm:grid-cols-2 sm:text-xs">
                  <p className="truncate">
                    <span className="font-semibold text-slate-700">Assigned on:</span>{" "}
                    {formatShortDate(assignment.created_at)}
                  </p>
                  <p className="truncate text-left sm:text-right">
                    <span className="font-semibold text-slate-700">Due:</span>{" "}
                    {formatShortDate(assignment.due_date)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center lg:flex">
        <div className="pointer-events-auto">
          <CreateAssignmentButton compact onClick={onCreateAssignment} />
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: Assignment["status"] }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-sky-100 text-sky-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-rose-100 text-rose-700",
  } as const;

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function buildAssignmentTitle(assignment: Assignment): string {
  if (assignment.assignment_title) {
    return assignment.assignment_title;
  }

  if (assignment.question_configs?.[0]?.question_type) {
    return `${assignment.question_configs[0].question_type} Assessment`;
  }

  if (assignment.question_types[0]) {
    return `${assignment.question_types[0]} Assessment`;
  }

  return "Generated Assignment";
}

function buildAssignmentSubtitle(assignment: Assignment): string {
  const questionCount = assignment.number_of_questions;
  const markCount = assignment.total_marks;
  return `${questionCount} questions | ${markCount} total marks`;
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}
