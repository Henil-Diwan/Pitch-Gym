export default function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh]">
      <div className="relative w-12 h-12">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        {/* Spinning arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
        {/* Inner dot */}
        <div className="absolute inset-[14px] rounded-full bg-indigo-500/20 animate-pulse" />
      </div>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
          {label}
        </p>
      )}
    </div>
  );
}
