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
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Draft: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Scheduled: "bg-blue-50 text-blue-700 ring-blue-600/15",
  Unpublished: "bg-orange-50 text-orange-800 ring-orange-600/20",
  Expired: "bg-slate-100 text-slate-700 ring-slate-600/15",
  Archived: "bg-slate-100 text-slate-700 ring-slate-600/15",
};

function StatusBadge({ status }: { status: ActivityStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}>
    <span aria-hidden="true" className="mr-1.5 size-1.5 rounded-full bg-current" />{status}
  </span>;
}

export function RecentActivityTableView({ items }: { items: ActivityItem[] }) {
  return <section aria-labelledby="recent-activity-title" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <div className="flex flex-col gap-1 border-b border-slate-200/80 px-5 py-5 sm:px-6">
      <h2 className="font-display text-lg font-bold text-slate-900" id="recent-activity-title">Recent activity</h2>
      <p className="text-sm text-slate-500 font-normal">A quick look at the latest website content.</p>
    </div>

    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-6 py-3.5" scope="col">Title</th>
            <th className="px-6 py-3.5" scope="col">Category</th>
            <th className="px-6 py-3.5" scope="col">Status</th>
            <th className="px-6 py-3.5" scope="col">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => <tr className="transition-colors hover:bg-slate-50/70" key={item.id}>
            <th className="px-6 py-4 font-medium text-slate-900" scope="row">{item.title}</th>
            <td className="px-6 py-4 text-slate-600">{item.category}</td>
            <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
            <td className="px-6 py-4 text-slate-500"><time dateTime={item.dateTime}>{item.date}</time></td>
          </tr>)}
        </tbody>
      </table>
    </div>

    {items.length === 0 ? <p className="px-6 py-10 text-center text-sm text-slate-500">No recent published content is available yet.</p> : <div className="divide-y divide-slate-100 md:hidden">
      {items.map((item) => <article className="space-y-3 px-5 py-4" key={item.id}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <span>{item.category}</span>
          <time dateTime={item.dateTime}>{item.date}</time>
        </div>
      </article>)}
    </div>}

    <div className="border-t border-slate-200/80 px-5 py-3.5 text-xs text-slate-500 sm:px-6">Showing {items.length} of up to 5 recent items</div>
  </section>;
}
