import { useCallback, useState } from "react";
import { API_ERROR_MESSAGE } from "../lib/api";

/** Page-level API error state for an <ErrorBanner>. */
export function useApiError() {
  const [apiError, setApiError] = useState(null);
  const onError = useCallback((error) => {
    console.error(error);
    setApiError(API_ERROR_MESSAGE);
  }, []);
  const onSuccess = useCallback(() => setApiError(null), []);
  const clearError = onSuccess;
  return { apiError, onError, onSuccess, clearError };
}
