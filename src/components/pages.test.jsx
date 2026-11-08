// @vitest-environment jsdom
// Render tests for the three main pages against a mocked backend.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CombinedSearch from "./CombinedSearch";
import UBPAgent from "./UBPAgent";
import UBPTutorial from "./UBPTutorial";
import { downloadAgentPdf } from "../lib/pdf";

vi.mock("../lib/pdf", async (importOriginal) => ({
  ...(await importOriginal()),
  downloadAgentPdf: vi.fn(async () => {}),
  downloadBusinessPdf: vi.fn(async () => {}),
  downloadAdvertPdf: vi.fn(async () => {}),
}));

const CODES = { industry: "32", businessCategory: "323", businessSubCategory: "3231", businessActivity: "32311" };
const FINANCE_ACTS = [
  { subCategory: "A", businessDescription: "1-5 employees", tradeLicence: 1000, fireClearance: 500, foodHygiene: 0, healthCertificate: 0, pestControl: 0 },
  { subCategory: "B", businessDescription: "6-10 employees", tradeLicence: 2000, fireClearance: 500, foodHygiene: 0, healthCertificate: 0, pestControl: 0 },
];
const BILLBOARD = {
  advertType: "Billboard",
  advertisementCategory: "Signboard",
  applicationFee: 10000,
  firstThreeMetres: 36400,
  firstSquareMetres: 0,
  firstTenSquareMetres: 0,
  extraSquareMetres: 3000,
  perEachperYear: 0,
};

const ROUTES = {
  "/api/naics/ubpdictionary": [{ commonBusinessActivity: "Printing" }],
  "/api/naics/Printing": CODES,
  "/api/naics/industry/32": { industry: "Manufacturing" },
  "/api/naics/businesscategories/323": { businessCategory: "Printing and Related Support" },
  "/api/naics/businesssubcategories/3231": { businessSubCategory: "Printing" },
  "/api/naics/businessactivities/32311": { businessActivity: "Printing services", financeActs: FINANCE_ACTS },
  "/api/naics/": [{ commonBusinessActivity: "Printing", ...CODES }],
  "/api/advert": [{ advertType: "Billboard" }],
  "/api/advert/Billboard": BILLBOARD,
};

let failRequests = false;

beforeEach(() => {
  localStorage.clear();
  failRequests = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const path = decodeURIComponent(new URL(url).pathname);
      if (failRequests || !(path in ROUTES)) return { ok: false, status: 500, json: async () => ({}) };
      return { ok: true, status: 200, json: async () => ROUTES[path] };
    })
  );
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const renderAt = (ui, url) => render(<MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>);
const WAIT = { timeout: 3000 };

describe("CombinedSearch (/ubp)", () => {
  it("loads a deep-linked activity, its descriptions and fee rows, and filters them", async () => {
    renderAt(<CombinedSearch />, "/ubp?ubp=Printing");

    expect(await screen.findByDisplayValue("32311", {}, WAIT)).toBeTruthy();
    expect(screen.getByText("Manufacturing")).toBeTruthy();
    expect(screen.getByText("1-5 employees")).toBeTruthy();
    expect(screen.getByText("6-10 employees")).toBeTruthy();
    expect(screen.getByText("No of employees")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("No of employees"), { target: { value: "7" } });
    expect(screen.queryByText("1-5 employees")).toBeNull();
    expect(screen.getByText("6-10 employees")).toBeTruthy();
  });

  it("quotes a deep-linked advert, recalculates on resize, and keeps state across tabs", async () => {
    renderAt(<CombinedSearch />, "/ubp?ubp=Printing&advert=Billboard");
    fireEvent.click(screen.getByRole("tab", { name: "Advert" }));

    // Billboard starts at the 3 m² minimum: renewal = first 3 m² rate.
    // "36,400" shows twice: the First 3m² rate and the renewal fee.
    expect(await screen.findAllByDisplayValue(/36,400\.00/, {}, WAIT)).toHaveLength(2);
    expect(screen.getByDisplayValue(/46,400\.00/)).toBeTruthy(); // + application fee

    const lengthField = screen.getByDisplayValue("3");
    fireEvent.change(lengthField, { target: { value: "4" } });
    expect(screen.getByDisplayValue(/39,400\.00/)).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "UBP" }));
    expect(await screen.findByDisplayValue("32311", {}, WAIT)).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Advert" }));
    expect(screen.getByDisplayValue(/39,400\.00/)).toBeTruthy();
  });

  it("asks for a selection before downloading", () => {
    renderAt(<CombinedSearch />, "/ubp");
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    expect(screen.getByText("Please select a business activity")).toBeTruthy();
  });

  it("shows an error banner when the API is unreachable", async () => {
    failRequests = true;
    renderAt(<CombinedSearch />, "/ubp");
    expect(await screen.findByRole("alert", {}, WAIT)).toBeTruthy();
  });
});

describe("UBPAgent (/agent)", () => {
  it("answers an advert prompt", async () => {
    renderAt(<UBPAgent />, "/agent");
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/advert"), expect.anything()));

    fireEvent.change(screen.getByPlaceholderText("Enter your prompt..."), {
      target: { value: "Billboard 4m by 1m" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("Billboard 4m by 1m")).toBeTruthy();
    expect(await screen.findByText(/Advert: Billboard/, {}, WAIT)).toBeTruthy();
  });

  it("says when it doesn't understand", async () => {
    renderAt(<UBPAgent />, "/agent");
    fireEvent.change(screen.getByPlaceholderText("Enter your prompt..."), { target: { value: "hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText(/didn't understand/, {}, WAIT)).toBeTruthy();
  });

  it("saves the PDF data with the reply instead of a blob: link", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderAt(<UBPAgent />, "/agent");
      await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/advert"), expect.anything()));
      fireEvent.change(screen.getByPlaceholderText("Enter your prompt..."), { target: { value: "Billboard 4m by 1m" } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await screen.findByText(/Advert: Billboard/, {}, WAIT);
      await vi.advanceTimersByTimeAsync(60_000); // finish the typing animation

      const saved = JSON.parse(localStorage.getItem("ubpai_sessions"))["Chat 1"];
      const reply = saved[saved.length - 1];
      expect(reply.role).toBe("assistant");
      expect(reply).not.toHaveProperty("pdf");
      expect(reply.pdfData.advert).toMatchObject({ advertType: "Billboard", length: 4, width: 1, renewalFee: 39400 });
    } finally {
      vi.useRealTimers();
    }
  });

  it("can still download a saved reply's PDF after a reload", () => {
    const pdfData = { business: null, advert: { advertType: "Billboard", rates: BILLBOARD, length: 4, width: 1 } };
    localStorage.setItem(
      "ubpai_sessions",
      JSON.stringify({ "Chat 1": [{ role: "assistant", text: "Advert: Billboard", pdfData }] })
    );
    renderAt(<UBPAgent />, "/agent");

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    expect(downloadAgentPdf).toHaveBeenCalledWith(pdfData);
  });

  it("drops dead blob: links saved by older versions", () => {
    localStorage.setItem(
      "ubpai_sessions",
      JSON.stringify({ "Chat 1": [{ role: "assistant", text: "Old reply", pdf: "blob:https://x/dead" }] })
    );
    renderAt(<UBPAgent />, "/agent");

    expect(screen.getByText("Old reply")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Download PDF" })).toBeNull();
    expect(localStorage.getItem("ubpai_sessions")).not.toContain("blob:");
  });
});

describe("UBPTutorial (/tutorial)", () => {
  it("walks forward and validates required fields", async () => {
    renderAt(<UBPTutorial />, "/tutorial");
    const next = screen.getByRole("button", { name: "Next step" });

    expect(screen.getAllByText("Application Type").length).toBeGreaterThan(0);
    fireEvent.click(next);
    expect(screen.getByRole("heading", { name: "Business Details" })).toBeTruthy();

    fireEvent.click(next); // nothing filled in
    expect(screen.getAllByText("Required")).toHaveLength(9);
    expect(screen.getByRole("heading", { name: "Business Details" })).toBeTruthy();

    // Fill every field, then move on to the activity step.
    const form = screen.getByRole("heading", { name: "Business Details" }).parentElement;
    within(form)
      .getAllByRole("textbox")
      .forEach((input) => fireEvent.change(input, { target: { value: "x" } }));
    fireEvent.click(next);
    expect(screen.getByRole("heading", { name: "Business Activity & Advert" })).toBeTruthy();

    fireEvent.click(next); // no activity selected
    expect(screen.getAllByText("Required").length).toBeGreaterThan(0);
  });
});
