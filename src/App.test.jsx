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
    expect(await screen.findByRole("button", { name: /accept/i }, { timeout: 3000 })).toBeTruthy();
  });

  it("lazy-loads a protected page once the terms are accepted", async () => {
    localStorage.setItem("authToken", JSON.stringify({ value: "t", expiry: Date.now() + 60_000 }));
    renderAt("/tutorial");
    expect(await screen.findByRole("heading", { name: "UBP Tutorial" }, { timeout: 3000 })).toBeTruthy();
  });

  it("sends visitors without a token from a protected page to the home page", async () => {
    renderAt("/ubp");
    expect(await screen.findByRole("heading", { name: "UBPMadeEasy", level: 1 })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Advert" })).toBeNull();
  });
});
