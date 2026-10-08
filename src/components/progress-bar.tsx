export function ProgressBar({ percent, label, size = "md" }: { percent: number; label: string; size?: "sm" | "md" }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`bg-surface-2 w-full overflow-hidden rounded-full ${size === "sm" ? "h-1.5" : "h-2.5"}`}
    >
      <div
        className="from-accent to-accent-2 h-full rounded-full bg-gradient-to-r transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
