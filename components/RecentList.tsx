export function RecentList({
  title,
  items,
}: {
  title: string;
  items: { primary: string; secondary: string; meta?: string }[];
}) {
  return (
    <div className="animate-rise rounded-[14px] border border-[#E6E9ED] bg-white p-5 shadow-[0_1px_3px_rgba(22,24,29,0.06)]">
      <h3 className="mb-4 text-sm font-bold text-[#16181D]">{title}</h3>
      <ul className="divide-y divide-[#E6E9ED]">
        {items.length === 0 && (
          <li className="py-4 text-sm text-[#737B86]">No records yet</li>
        )}
        {items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-3 py-3 first:pt-0">
            <div>
              <p className="font-semibold text-[#16181D]">{item.primary}</p>
              <p className="text-xs text-[#737B86]">{item.secondary}</p>
            </div>
            {item.meta && (
              <span className="shrink-0 font-mono text-xs tabular-nums text-[#3A4049]">
                {item.meta}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
