type ActivityCategory = "Sermon" | "Event" | "Announcement";
type ActivityStatus =
  | "Published"
  | "Draft"
  | "Scheduled"
  | "Unpublished"
  | "Expired"
  | "Archived";

type ActivityItem = {
  id: string;
  title: string;
  category: ActivityCategory;
  status: ActivityStatus;
  date: string;
  dateTime: string;
};

export type RecentActivityItem = ActivityItem;

const statusStyles: Record<ActivityStatus, string> = {
  Published: "admin-badge-published",
  Draft: "admin-badge-draft",
  Scheduled: "admin-badge-scheduled",
  Unpublished: "admin-badge-unpublished",
  Expired: "admin-badge-archived",
  Archived: "admin-badge-archived",
};

function StatusBadge({ status }: { status: ActivityStatus }) {
  return <span className={`admin-badge ${statusStyles[status]}`}>
    <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{status}
  </span>;
}

export function RecentActivityTableView({ items }: { items: ActivityItem[] }) {
  return <section aria-labelledby="recent-activity-title" className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
    <div className="flex flex-col gap-1 border-b border-border px-5 py-5 sm:px-6">
      <h2 className="font-display text-lg font-bold text-foreground" id="recent-activity-title">Recent activity</h2>
      <p className="text-sm text-muted font-normal">A quick look at the latest website content.</p>
    </div>

    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="bg-surface-strong/60 text-xs font-bold uppercase tracking-wider text-muted">
          <tr>
            <th className="px-6 py-3.5" scope="col">Title</th>
            <th className="px-6 py-3.5" scope="col">Category</th>
            <th className="px-6 py-3.5" scope="col">Status</th>
            <th className="px-6 py-3.5" scope="col">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => <tr className="transition-colors hover:bg-surface-strong/40" key={item.id}>
            <th className="px-6 py-4 font-semibold text-foreground" scope="row">{item.title}</th>
            <td className="px-6 py-4 text-muted">{item.category}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4 text-muted"><time dateTime={item.dateTime}>{item.date}</time></td>
          </tr>)}
        </tbody>
      </table>
    </div>

    {items.length === 0 ? <p className="px-6 py-10 text-center text-sm text-muted">No recent published content is available yet.</p> : <div className="divide-y divide-border md:hidden">
      {items.map((item) => <article className="space-y-3 px-5 py-4" key={item.id}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-muted">
          <span>{item.category}</span>
          <time dateTime={item.dateTime}>{item.date}</time>
        </div>
      </article>)}
    </div>}

    <div className="border-t border-border px-5 py-3.5 text-xs text-muted sm:px-6">Showing {items.length} of up to 5 recent items</div>
  </section>;
}
