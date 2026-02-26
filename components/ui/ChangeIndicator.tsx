interface ChangeIndicatorProps {
  changePercent: number;
  changeAmount?: number;
  showAmount?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ChangeIndicator({
  changePercent,
  changeAmount,
  showAmount = false,
  size = "md",
}: ChangeIndicatorProps) {
  const isUp = changePercent >= 0;
  const color = isUp ? "text-green-400" : "text-red-400";
  const arrow = isUp ? "▲" : "▼";
  const sign = isUp ? "+" : "";

  const sizeClass =
    size === "lg" ? "text-xl" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`${color} ${sizeClass} font-semibold tabular-nums`}>
      {arrow} {sign}{changePercent.toFixed(2)}%
      {showAmount && changeAmount !== undefined && (
        <span className="ml-1 opacity-75">
          ({sign}{changeAmount.toFixed(0)})
        </span>
      )}
    </span>
  );
}
