export function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#2b2b2b,#111827_40%,#f97316_120%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]">
      <span className="absolute inset-[1px] rounded-[14px] bg-[radial-gradient(circle_at_top_left,#fbbf24,#ea580c_65%,#7c2d12)]" />
      <span className="relative text-lg font-black tracking-tight text-white">
        V
      </span>
    </div>
  );
}
