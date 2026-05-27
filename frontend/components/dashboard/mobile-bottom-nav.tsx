import { Bot, ClipboardList, Grid2x2, House, LibraryBig } from "lucide-react";

const items = [
  { label: "Home", icon: House, active: false },
  { label: "Groups", icon: Grid2x2, active: false },
  { label: "Assignments", icon: ClipboardList, active: true },
  { label: "Library", icon: LibraryBig, active: false },
  { label: "AI Toolkit", icon: Bot, active: false },
];

export function MobileBottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-2 lg:hidden pointer-events-none">
      <nav className="mx-auto flex max-w-xl items-center justify-between rounded-[28px] bg-slate-950 px-3 py-2 text-white shadow-[0_15px_40px_rgba(15,23,42,0.35)] pointer-events-auto">
        {items.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1 text-[10px] font-medium text-white/65 transition sm:text-[11px]"
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
