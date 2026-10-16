import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StatCardData = {
  title: string;
  value: string;
  change: string;
  direction: "up" | "down" | "steady";
  comparisonLabel: string;
  icon: LucideIcon;
  tone: "indigo" | "primary";
};

const tones = {
  indigo: { icon: "bg-primary/10 text-primary", positive: "text-emerald-700" },
  primary: { icon: "bg-primary/10 text-primary", positive: "text-emerald-700" },
} as const;

export function StatCardView({ stat }: { stat: StatCardData }) {
  const Icon = stat.icon;
  const TrendIcon = stat.direction === "up" ? ArrowUpRight : stat.direction === "down" ? ArrowDownRight : ArrowRight;
  const trendColor = stat.direction === "up" ? tones[stat.tone].positive : stat.direction === "down" ? "text-amber-700" : "text-slate-500";

  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 transition-all hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.title}</p>
        <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</p>
      </div>
      <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tones[stat.tone].icon}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
    </div>
    <div className="mt-4 flex items-center gap-1.5 text-xs">
      <TrendIcon aria-hidden="true" className={`size-4 ${trendColor}`} />
      <span className={`font-semibold ${trendColor}`}>{stat.change}</span>
      <span className="text-slate-500">{stat.comparisonLabel}</span>
    </div>
  </article>;
}
