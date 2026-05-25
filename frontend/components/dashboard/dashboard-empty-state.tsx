import { MessageSquareText, Plus } from "lucide-react";

type DashboardEmptyStateProps = {
  onCreateAssignment: () => void;
};

export function DashboardEmptyState({
  onCreateAssignment,
}: DashboardEmptyStateProps) {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7f5f2_40%,#efebe5_100%)] px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <div className="pointer-events-none absolute left-8 top-10 h-32 w-32 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-8 h-40 w-40 rounded-full bg-sky-200/35 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center pb-20 text-center sm:pb-10">
        <EmptyIllustration />

        <div className="mt-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
            <MessageSquareText className="h-3.5 w-3.5" />
            0 assignments
          </span>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              No assignments yet
            </h2>
            <p className="mx-auto max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
              Create your first assignment to start collecting and grading
              student submissions. You can set rubrics, define marking
              criteria, and let AI support the review flow.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateAssignment}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create Your First Assignment
          </button>
        </div>
      </div>
    </section>
  );
}

function EmptyIllustration() {
  return (
    <div className="relative h-[240px] w-[240px] sm:h-[300px] sm:w-[300px]">
      <div className="absolute inset-0 rounded-full bg-white/80 shadow-[0_30px_80px_rgba(148,163,184,0.28)]" />
      <div className="absolute left-7 top-14 h-24 w-16 rounded-[24px] border border-slate-200 bg-white shadow-sm sm:left-10 sm:top-16 sm:h-28 sm:w-20">
        <div className="mx-auto mt-5 h-2 w-10 rounded-full bg-slate-900/90 sm:w-12" />
        <div className="mx-auto mt-4 h-2 w-8 rounded-full bg-slate-200 sm:w-10" />
        <div className="mx-auto mt-3 h-2 w-8 rounded-full bg-slate-200 sm:w-10" />
        <div className="mx-auto mt-3 h-2 w-6 rounded-full bg-slate-200 sm:w-8" />
      </div>
      <div className="absolute right-10 top-[5.5rem] rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:right-12 sm:top-[6rem]">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="absolute left-14 top-9 h-8 w-8 rounded-full border-2 border-slate-700/80 border-r-transparent border-t-transparent" />
      <div className="absolute bottom-12 left-11 h-3 w-3 rotate-12 rounded-[4px] border border-sky-500" />
      <div className="absolute bottom-16 right-11 h-2.5 w-2.5 rounded-full bg-sky-500" />

      <div className="absolute left-[92px] top-[82px] h-[110px] w-[110px] rounded-full border-[12px] border-violet-200/90 bg-transparent sm:left-[108px] sm:top-[94px] sm:h-[128px] sm:w-[128px]" />
      <div className="absolute left-[154px] top-[176px] h-14 w-3 rotate-[-40deg] rounded-full bg-violet-200/90 sm:left-[180px] sm:top-[204px] sm:h-16" />
      <div className="absolute left-[125px] top-[112px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white shadow-sm sm:left-[146px] sm:top-[130px] sm:h-[52px] sm:w-[52px]">
        <div className="relative h-7 w-7 sm:h-8 sm:w-8">
          <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rotate-45 rounded-full bg-rose-500" />
          <span className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 -rotate-45 rounded-full bg-rose-500" />
        </div>
      </div>
    </div>
  );
}
