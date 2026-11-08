import { beforeEach, describe, expect, it, vi } from "vitest";
import { ONE_DAY_MS, pruneLegacyStorage, readCache, writeCache } from "./cache";

// Minimal in-memory localStorage for the node test environment.
const createStorage = () => {
  const map = new Map();
  return {
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
};

beforeEach(() => {
  vi.stubGlobal("localStorage", createStorage());
  vi.useRealTimers();
});

describe("cache", () => {
  it("round-trips data", () => {
    writeCache("businessOptions", [{ value: "a" }]);
    expect(readCache("businessOptions")).toEqual([{ value: "a" }]);
  });

  it("expires entries older than maxAge", () => {
    vi.useFakeTimers();
    writeCache("k", 1);
    vi.advanceTimersByTime(ONE_DAY_MS + 1);
    expect(readCache("k")).toBeNull();
  });

  it("returns null for corrupt entries instead of throwing", () => {
    localStorage.setItem("ubp:v1:bad", "{not json");
    expect(readCache("bad")).toBeNull();
  });

  it("prunes legacy keys but keeps auth, theme, chat history and current cache", () => {
    for (const k of ["authToken", "theme", "ubpai_sessions", "ubpai_currentSession"]) {
      localStorage.setItem(k, "x");
    }
    localStorage.setItem("businessOptions", "[]");
    localStorage.setItem("ubpai_businessData", "[]");
    localStorage.setItem("Barber Shop", "{}");
    localStorage.setItem("ubp:v0:old", "{}");
    writeCache("fresh", 1);

    pruneLegacyStorage();

    expect(localStorage.getItem("authToken")).toBe("x");
    expect(localStorage.getItem("theme")).toBe("x");
    expect(localStorage.getItem("ubpai_sessions")).toBe("x");
    expect(localStorage.getItem("ubpai_currentSession")).toBe("x");
    expect(readCache("fresh")).toBe(1);
    for (const k of ["businessOptions", "ubpai_businessData", "Barber Shop", "ubp:v0:old"]) {
      expect(localStorage.getItem(k)).toBeNull();
    }
  });
});
