// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { importWithReload } from "./lazyPage";

const pending = (promise) =>
  Promise.race([promise.then(() => "settled", () => "settled"), new Promise((r) => setTimeout(() => r("pending"), 20))]);

beforeEach(() => sessionStorage.clear());

describe("importWithReload", () => {
  it("returns the module when the import succeeds", async () => {
    const reload = vi.fn();
    const module = { default: () => null };
    await expect(importWithReload(() => Promise.resolve(module), reload)).resolves.toBe(module);
    expect(reload).not.toHaveBeenCalled();
  });

  it("reloads once when a chunk fails to load (e.g. after a deploy)", async () => {
    const reload = vi.fn();
    const result = importWithReload(() => Promise.reject(new Error("chunk 404")), reload);
    expect(await pending(result)).toBe("pending");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("surfaces the error instead of reloading again", async () => {
    const reload = vi.fn();
    sessionStorage.setItem("ubp:chunk-reload", "1"); // already reloaded once
    await expect(importWithReload(() => Promise.reject(new Error("chunk 404")), reload)).rejects.toThrow(
      "chunk 404"
    );
    expect(reload).not.toHaveBeenCalled();
  });

  it("clears the flag after a successful load so future deploys can reload again", async () => {
    sessionStorage.setItem("ubp:chunk-reload", "1");
    await importWithReload(() => Promise.resolve({}), vi.fn());
    expect(sessionStorage.getItem("ubp:chunk-reload")).toBeNull();
  });
});
