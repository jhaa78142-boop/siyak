import { Chip } from "./Controls";
import { EmptyState as PremiumEmpty } from "./Feedback";

export function Badge({ children, tone = "neutral" }) {
  return <Chip tone={tone}>{children}</Chip>;
}

export function EmptyState({ icon, title, detail, ...rest }) {
  return <PremiumEmpty icon={icon} title={title} detail={detail} {...rest} />;
}

export function ProgressRing({ value, size = 96, stroke = 9, color = "var(--mm-accent)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}
