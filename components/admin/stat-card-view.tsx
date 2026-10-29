import type { LucideIcon } from "lucide-react";

export type StatCardData = {
  title: string;
  value: number | null;
  loading: boolean;
  description?: string;
  icon: LucideIcon;
};

export function StatCardView({ stat }: { stat: StatCardData }) {
  const Icon = stat.icon;
  const formattedValue = stat.value === null ? "—" : new Intl.NumberFormat("en").format(stat.value);

  return (
    <article aria-busy={stat.loading} className="admin-card admin-stat-card">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-semibold leading-5 text-muted">{stat.title}</p>
        <span className="admin-stat-icon" aria-hidden="true">
          <Icon className="size-[1.125rem]" />
        </span>
      </div>
      <div className="mt-4">
        <p className="admin-stat-number truncate font-display text-[2rem] font-bold leading-none tracking-tight text-foreground">
          {stat.loading ? (
            <span aria-label="Loading" className="admin-stat-skeleton" role="status">
              <span className="sr-only">Loading</span>
            </span>
          ) : (
            <span aria-label={stat.value === null ? "Unavailable" : undefined}>{formattedValue}</span>
          )}
        </p>
        {stat.description && (
          <p className="mt-2 text-xs leading-5 text-muted">{stat.description}</p>
        )}
      </div>
    </article>
  );
}
