// @vitest-environment jsdom
// Routing smoke test: the eager home page renders, and lazily loaded pages
// resolve through <Suspense>.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeContext";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => [] })));
  // jsdom has no matchMedia; framer-motion and ThemeContext need one.
  window.matchMedia ??= () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// The first dynamic import of a page makes Vitest compile that page's whole
// module graph on the fly (~3 s for the tutorial, more when test files run in
// parallel). Real browsers fetch a prebuilt chunk, so this is a test-only cost.
const LAZY_LOAD = { timeout: 10_000 };
const LAZY_TEST_TIMEOUT = 15_000;

const renderAt = (url) =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[url]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>
  );

describe("App routing", () => {
  it("lazy-loads the terms page", async () => {
    renderAt("/terms");
    expect(await screen.findByRole("button", { name: /accept/i }, LAZY_LOAD)).toBeTruthy();
  }, LAZY_TEST_TIMEOUT);

  it("lazy-loads a protected page once the terms are accepted", async () => {
    localStorage.setItem("authToken", JSON.stringify({ value: "t", expiry: Date.now() + 60_000 }));
    renderAt("/tutorial");
    expect(await screen.findByRole("heading", { name: "UBP Tutorial" }, LAZY_LOAD)).toBeTruthy();
  }, LAZY_TEST_TIMEOUT);

  it("sends visitors without a token from a protected page to the home page", async () => {
    renderAt("/ubp");
    expect(await screen.findByRole("heading", { name: "UBPMadeEasy", level: 1 })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Advert" })).toBeNull();
  });
});
