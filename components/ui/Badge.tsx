interface BadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: BadgeProps) {
  const color =
    score >= 70
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : score >= 50
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : score >= 30
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  const sizeClass =
    size === "lg"
      ? "text-2xl px-4 py-2 min-w-[4rem]"
      : size === "sm"
      ? "text-xs px-2 py-0.5 min-w-[2.5rem]"
      : "text-sm px-3 py-1 min-w-[3rem]";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-bold ${color} ${sizeClass}`}
    >
      {score}
    </span>
  );
}
