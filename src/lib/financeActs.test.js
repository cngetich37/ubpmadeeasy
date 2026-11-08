import { describe, expect, it } from "vitest";
import { filterFinanceRows, rowTotal, unitLabel, unitLabelForRows } from "./financeActs";
import { formatKES, humanizeKey } from "./format";

const rows = [
  { businessDescription: "1-5 outlets", tradeLicence: 1000, fireClearance: "500", foodHygiene: 0, healthCertificate: "", pestControl: 200 },
  { businessDescription: "6-10 outlets", tradeLicence: 2000 },
  { businessDescription: "1-5 outlets", tradeLicence: 999 }, // duplicate description
  { businessDescription: "Over 10 outlets", tradeLicence: 3000 },
];

describe("filterFinanceRows", () => {
  it("keeps every row (deduplicated) when there is no filter", () => {
    expect(filterFinanceRows(rows, "").map((r) => r.businessDescription)).toEqual([
      "1-5 outlets",
      "6-10 outlets",
      "Over 10 outlets",
    ]);
  });

  it("keeps rows whose range covers the number", () => {
    expect(filterFinanceRows(rows, "7").map((r) => r.businessDescription)).toEqual(["6-10 outlets"]);
    expect(filterFinanceRows(rows, 11).map((r) => r.businessDescription)).toEqual(["Over 10 outlets"]);
  });

  it("matches nothing for a non-numeric filter", () => {
    expect(filterFinanceRows(rows, "abc")).toEqual([]);
  });

  it("tolerates missing rows", () => {
    expect(filterFinanceRows(undefined, "3")).toEqual([]);
  });
});

describe("rowTotal", () => {
  it("adds every fee column, treating blanks as 0", () => {
    expect(rowTotal(rows[0])).toBe(1700);
  });
});

describe("unitLabel", () => {
  it.each([
    ["1-5 outlets", "No of outlets"],
    ["Over 100 employees", "No of employees"],
    ["Up to 50 sq.m", "No of sq"],
    ["Small kiosk", ""],
    [undefined, ""],
  ])("%s -> %s", (description, label) => {
    expect(unitLabel(description)).toBe(label);
  });

  it("uses the first row that has a description", () => {
    expect(unitLabelForRows([{ businessDescription: "" }, { businessDescription: "2-4 rooms" }])).toBe("No of rooms");
    expect(unitLabelForRows([])).toBe("");
  });
});

describe("format", () => {
  it("formats KES and blanks non-numbers", () => {
    expect(formatKES(1500)).toMatch(/1,500\.00/);
    expect(formatKES("2000")).toMatch(/2,000\.00/);
    expect(formatKES("")).toBe("");
    expect(formatKES(undefined)).toBe("");
    expect(formatKES(0)).not.toBe("");
    expect(formatKES(0, { blankZero: true })).toBe("");
  });

  it("humanizes camelCase keys", () => {
    expect(humanizeKey("businessName")).toBe("Business Name");
    expect(humanizeKey("advertSearchInput")).toBe("Advert Search Input");
  });
});
