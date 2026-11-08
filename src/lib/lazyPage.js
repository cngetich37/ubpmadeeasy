import { lazy } from "react";

const RELOAD_FLAG = "ubp:chunk-reload";

const storage = {
  get: () => {
    try {
      return sessionStorage.getItem(RELOAD_FLAG);
    } catch {
      return null;
    }
  },
  set: () => {
    try {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      return true;
    } catch {
      return false;
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // ignore
    }
  },
};

/**
 * React.lazy() for route pages, so each page is its own chunk.
 *
 * After a new deploy the old chunk files no longer exist, so a tab opened
 * before the deploy fails to load the next page. In that case reload once to
 * pick up the new index.html; if it still fails, let the error surface.
 */
export function lazyPage(importPage) {
  return lazy(() => importWithReload(importPage));
}

/** The loader behind lazyPage(); `reload` is injectable for tests. */
export function importWithReload(importPage, reload = () => window.location.reload()) {
  return importPage()
    .then((module) => {
      storage.clear();
      return module;
    })
    .catch((error) => {
      if (!storage.get() && storage.set()) {
        reload();
        return new Promise(() => {}); // keep the fallback up while reloading
      }
      throw error;
    });
}
