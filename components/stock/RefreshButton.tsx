"use client";

interface RefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: string | null;
}

export function RefreshButton({ onRefresh, loading, lastUpdated }: RefreshButtonProps) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex items-center gap-3">
      {lastUpdated && (
        <span className="text-slate-500 text-xs">
          最終更新: {formatTime(lastUpdated)}
        </span>
      )}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        <span
          className={`inline-block ${loading ? "animate-spin" : ""}`}
          style={{ display: "inline-block" }}
        >
          {loading ? "⟳" : "↻"}
        </span>
        {loading ? "データ取得中..." : "データ更新"}
      </button>
    </div>
  );
}
