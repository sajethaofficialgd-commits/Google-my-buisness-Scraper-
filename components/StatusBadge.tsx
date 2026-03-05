type Status = "idle" | "loading" | "success" | "error";

export function StatusBadge({ status }: { status: Status }) {
  if (status === "idle") return null;

  const styles: Record<Exclude<Status, "idle">, string> = {
    loading: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    success: "bg-green-500/20 text-green-300 border border-green-500/30",
    error: "bg-red-500/20 text-red-300 border border-red-500/30",
  };

  const labels: Record<Exclude<Status, "idle">, string> = {
    loading: "Building workflow…",
    success: "Deployed",
    error: "Failed",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as Exclude<Status, "idle">]}`}
    >
      {status === "loading" && (
        <span className="inline-block h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />
      )}
      {labels[status as Exclude<Status, "idle">]}
    </span>
  );
}
