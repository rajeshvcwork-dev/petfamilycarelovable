import { cn } from "@/lib/utils";

export function ScoreRing({ value, label, size = 80, tone = "primary" }: { value: number; label?: string; size?: number; tone?: "primary" | "info" | "success" | "warning" }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  const colorClass =
    tone === "info" ? "stroke-info" :
    tone === "success" ? "stroke-success" :
    tone === "warning" ? "stroke-warning" : "stroke-primary";

  return (
    <div className="inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-muted" strokeWidth={6} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className={cn("transition-[stroke-dashoffset] duration-700", colorClass)}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="-mt-[calc(50%+8px)] mb-[calc(50%-20px)] text-center">
        <div className="text-base font-bold leading-none">{Math.round(pct)}</div>
        {label && <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>}
      </div>
    </div>
  );
}
