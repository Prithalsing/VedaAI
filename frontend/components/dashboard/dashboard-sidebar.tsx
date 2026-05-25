import {
  BookOpenText,
  ClipboardList,
  FolderClosed,
  Grid2x2,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { CreateAssignmentButton } from "./create-assignment-button";
import { LogoMark } from "./logo-mark";

const navigation = [
  { label: "Home", icon: Grid2x2, active: false },
  { label: "My Groups", icon: Users, active: false },
  { label: "Assignments", icon: ClipboardList, active: true },
  { label: "AI Teacher's Toolkit", icon: Sparkles, active: false },
  { label: "My Library", icon: FolderClosed, active: false },
];

type DashboardSidebarProps = {
  onCreateAssignment: () => void;
};

export function DashboardSidebar({ onCreateAssignment }: DashboardSidebarProps) {
  return (
    <aside className="hidden w-[290px] shrink-0 rounded-[28px] bg-white/80 p-5 shadow-[0_20px_50px_rgba(148,163,184,0.18)] backdrop-blur lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <LogoMark />
        <div>
          <p className="text-xl font-semibold tracking-tight text-slate-900">
            VedaAI
          </p>
          <p className="text-xs text-slate-500">Teacher workspace</p>
        </div>
      </div>

      <div className="mt-8">
        <CreateAssignmentButton onClick={onCreateAssignment} />
      </div>

      <nav className="mt-8 space-y-1">
        {navigation.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={[
              "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
              active
                ? "bg-slate-100 font-semibold text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>

        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#fff6e8,#ffffff)] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fb923c,#f43f5e)] text-sm font-semibold text-white">
              DS
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                Delhi Public School
              </p>
              <p className="truncate text-xs text-slate-500">Bokaro Steel City</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-950/95 p-3 text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-orange-200">
              <BookOpenText className="h-3.5 w-3.5" />
              Ready to publish
            </div>
            <p className="mt-2 text-sm text-slate-200">
              Create the first assignment and share it with your groups.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
