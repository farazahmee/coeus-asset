export function RecentList({
  title,
  items,
}: {
  title: string;
  items: { primary: string; secondary: string; meta?: string }[];
}) {
  return (
    <div className="card animate-rise p-5">
      <h3 className="mb-4 text-sm font-bold text-ink">{title}</h3>
      <ul className="divide-y divide-[var(--line)]">
        {items.length === 0 && (
          <li className="py-4 text-sm text-muted">No records yet</li>
        )}
        {items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-3 py-3 first:pt-0">
            <div>
              <p className="font-semibold text-ink">{item.primary}</p>
              <p className="text-xs text-muted">{item.secondary}</p>
            </div>
            {item.meta && (
              <span className="shrink-0 font-mono text-xs tabular text-ink-2">
                {item.meta}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
