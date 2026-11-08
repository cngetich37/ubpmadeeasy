import { AlertCircle, X } from "lucide-react";

// Inline, dismissible error message shown when an API call fails.
const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 mb-6 p-3 rounded-lg border border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-100 dark:border-red-700"
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
