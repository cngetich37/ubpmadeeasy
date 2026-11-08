// Small localStorage cache with expiry and a version prefix.
// Bump CACHE_VERSION whenever the shape of cached API data changes; old entries
// are then ignored and cleaned up by pruneLegacyStorage().

const CACHE_VERSION = 1;
const PREFIX = `ubp:v${CACHE_VERSION}:`;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function readCache(key, maxAgeMs = ONE_DAY_MS) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { savedAt, data } = JSON.parse(raw);
    if (Date.now() - savedAt > maxAgeMs) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage full or blocked (private mode); caching is best-effort.
  }
}

// Keys that are not API caches and must survive pruning.
const KEEP_KEYS = new Set(["authToken", "theme", "ubpai_sessions", "ubpai_currentSession"]);

/**
 * Remove cache entries written by older versions of the app: the never-expiring
 * "businessOptions" / "ubpai_businessData" entries, raw search-query keys, and
 * entries from previous CACHE_VERSIONs.
 */
export function pruneLegacyStorage() {
  try {
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!KEEP_KEYS.has(key) && !key.startsWith(PREFIX)) stale.push(key);
    }
    stale.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}
