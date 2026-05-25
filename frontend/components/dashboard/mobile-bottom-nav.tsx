import { Bot, ClipboardList, Grid2x2, House, LibraryBig } from "lucide-react";
import { CreateAssignmentButton } from "./create-assignment-button";
import { LogoMark } from "./logo-mark";

const items = [
  { label: "Home", icon: House, active: false },
  { label: "Groups", icon: Grid2x2, active: false },
  { label: "Assignments", icon: ClipboardList, active: true },
  { label: "Library", icon: LibraryBig, active: false },
  { label: "AI Toolkit", icon: Bot, active: false },
];

type MobileBottomNavProps = {
  onCreateAssignment: () => void;
  title: string;
};

export function MobileBottomNav({
  onCreateAssignment,
  title,
}: MobileBottomNavProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold text-slate-900">VedaAI</p>
            <p className="text-xs text-slate-500">{title}</p>
          </div>
        </div>
        <div className="scale-[0.88] origin-right">
          <CreateAssignmentButton compact onClick={onCreateAssignment} />
        </div>
      </div>

      <nav className="mx-auto mt-3 flex max-w-xl items-center justify-between rounded-[28px] bg-slate-950 px-3 py-2 text-white">
        {items.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium text-white/65 transition"
          >
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full",
                active ? "bg-white/14 text-white" : "",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className={active ? "text-white" : ""}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
