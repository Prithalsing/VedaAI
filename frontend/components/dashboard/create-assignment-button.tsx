import { Plus } from "lucide-react";

type CreateAssignmentButtonProps = {
  compact?: boolean;
  onClick: () => void;
};

export function CreateAssignmentButton({
  compact = false,
  onClick,
}: CreateAssignmentButtonProps) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950 px-4 py-2 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.24)] ring-1 ring-orange-300/70 transition hover:-translate-y-0.5 hover:bg-slate-900"
      >
        <Plus className="h-3.5 w-3.5" />
        Create Assignment
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-300/90 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_0_2px_rgba(251,146,60,0.2),0_18px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-900"
    >
      <Plus className="h-4 w-4" />
      Create Assignment
    </button>
  );
}
