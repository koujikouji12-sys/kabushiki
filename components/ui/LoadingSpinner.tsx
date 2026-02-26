interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClass =
    size === "lg" ? "w-10 h-10" : size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClass} border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin`}
      />
      {message && (
        <p className="text-slate-400 text-sm">{message}</p>
      )}
    </div>
  );
}
