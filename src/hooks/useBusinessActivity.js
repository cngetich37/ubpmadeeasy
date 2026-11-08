import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { readCache, writeCache } from "../lib/cache";
import { EMPTY_CODES, loadActivity } from "../lib/activity";

const SEARCH_DEBOUNCE_MS = 500;

/**
 * Business activity search: dropdown options, the selected activity's
 * classification codes and descriptions, and its Finance Act fee rows.
 *
 * @param {object} callbacks { onError(error), onSuccess() }
 */
export function useBusinessActivity({ onError, onSuccess } = {}) {
  const callbacks = useRef({ onError, onSuccess });
  callbacks.current = { onError, onSuccess };

  const [options, setOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [codes, setCodes] = useState(EMPTY_CODES);
  const [descriptions, setDescriptions] = useState(EMPTY_CODES);
  const [financeActs, setFinanceActs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dropdown options (cached for a day).
  useEffect(() => {
    const cached = readCache("businessOptions");
    if (cached) {
      setOptions(cached);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .ubpDictionary()
      .then((items) => {
        const fetched = items
          .map((item) => ({ value: item.commonBusinessActivity, label: item.commonBusinessActivity }))
          .sort((a, b) => a.label.localeCompare(b.label));
        writeCache("businessOptions", fetched);
        if (!cancelled) setOptions(fetched);
      })
      .catch((error) => !cancelled && callbacks.current.onError?.(error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Selected activity -> codes, descriptions and fee rows (debounced).
  useEffect(() => {
    const reset = () => {
      setCodes(EMPTY_CODES);
      setDescriptions(EMPTY_CODES);
      setFinanceActs([]);
    };
    if (searchInput === "") {
      reset();
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await loadActivity(searchInput);
        if (cancelled) return;
        setCodes(result.codes);
        setDescriptions(result.descriptions);
        setFinanceActs(result.financeActs);
        callbacks.current.onSuccess?.();
      } catch (error) {
        if (cancelled) return;
        reset();
        callbacks.current.onError?.(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchInput]);

  return { options, searchInput, setSearchInput, codes, descriptions, financeActs, loading };
}
