"use client";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string;
  direction: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  direction,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey;

  return (
    <th
      className={`px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`transition-colors ${isActive ? "text-blue-400" : "text-slate-600"}`}>
          {isActive ? (direction === "desc" ? "↓" : "↑") : "↕"}
        </span>
      </span>
    </th>
  );
}
