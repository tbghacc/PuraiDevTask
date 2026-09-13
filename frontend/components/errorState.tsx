type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-red-900 bg-red-400 p-6 text-center ${className}`}
    >
      <p className="text-sm font-medium">Failed to load</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}