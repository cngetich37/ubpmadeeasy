import { describe, expect, it } from "vitest";
import { calculateAdvertFees, matchNumberRange, SIDE_ADVERT_TYPES } from "./fees";

const rates = {
  applicationFee: 1500,
  firstSquareMetres: 2000,
  firstThreeMetres: 9000,
  firstTenSquareMetres: 12000,
  extraSquareMetres: 700,
  perEachperYear: 3000,
};

const fees = (type, size, r = rates) => calculateAdvertFees(type, r, size);

describe("calculateAdvertFees", () => {
  it("charges flat renewal fees for Directional Signs and Call In Adverts, per side", () => {
    expect(fees("Directional Signs", { numberOfSides: 1 }).renewalFee).toBe(10500);
    expect(fees("Directional Signs", { numberOfSides: 2 }).renewalFee).toBe(21000);
    expect(fees("Call In Adverts", { numberOfSides: 1 }).renewalFee).toBe(18200);
  });

  it("prices billboards from a 3 m² base", () => {
    expect(fees("Billboard", { length: 2, width: 1 }).renewalFee).toBe(0);
    expect(fees("Billboard", { length: 3, width: 1 }).renewalFee).toBe(9000);
    expect(fees("Billboard", { length: 5, width: 1 }).renewalFee).toBe(9000 + 2 * 700);
    expect(fees("Billboard", { length: 5, width: 1, numberOfSides: 2 }).renewalFee).toBe(
      2 * (9000 + 2 * 700)
    );
  });

  it("prices wall painting / branding from a 10 m² base", () => {
    for (const type of ["Wallpainting", "Window Branding", "Wall Branding"]) {
      expect(fees(type, { length: 9, width: 1 }).renewalFee).toBe(0);
      expect(fees(type, { length: 10, width: 1 }).renewalFee).toBe(12000);
      expect(fees(type, { length: 6, width: 2 }).renewalFee).toBe(12000 + 2 * 700);
    }
  });

  it("uses per-item and per-m² rates for the remaining special types", () => {
    expect(fees("Corporate Flags", {}).renewalFee).toBe(3000);
    expect(fees("Canvas", { length: 4, width: 4 }).renewalFee).toBe(2000);
    expect(fees("Business Encroachment", { length: 3, width: 2 }).renewalFee).toBe(6 * 2000);
  });

  it("prices other types as first m² plus extra m²", () => {
    expect(fees("Sky Sign", { length: 1, width: 1 }).renewalFee).toBe(2000);
    expect(fees("Sky Sign", { length: 2, width: 2 }).renewalFee).toBe(2000 + 3 * 700);
    expect(fees("Sky Sign", { length: 0.5, width: 1 }).renewalFee).toBe(0);
  });

  it("only multiplies side-based types by the number of sides", () => {
    expect(fees("Above Canopy", { length: 1, width: 1, numberOfSides: 3 }).renewalFee).toBe(6000);
    expect(fees("Sky Sign", { length: 1, width: 1, numberOfSides: 3 }).renewalFee).toBe(2000);
    expect(SIDE_ADVERT_TYPES).toContain("Under Canopy");
  });

  it("always adds the application fee for new applicants, even when renewal is 0", () => {
    expect(fees("Billboard", { length: 5, width: 1 }).newApplicantFee).toBe(9000 + 1400 + 1500);
    expect(fees("Billboard", { length: 1, width: 1 }).newApplicantFee).toBe(1500);
  });

  it("accepts rates as strings or empty values from the API", () => {
    const stringRates = Object.fromEntries(Object.entries(rates).map(([k, v]) => [k, String(v)]));
    expect(fees("Billboard", { length: 4, width: 1 }, stringRates)).toEqual({
      renewalFee: 9700,
      newApplicantFee: 11200,
    });
    expect(fees("Canvas", {}, { firstSquareMetres: "", applicationFee: undefined })).toEqual({
      renewalFee: 0,
      newApplicantFee: 0,
    });
  });
});

describe("matchNumberRange", () => {
  it.each([
    ["1-5 outlets", 3, true],
    ["1-5 outlets", 6, false],
    ["From 51 – 100 sq.m", 75, true],
    ["Up to 50 sq.m", 50, true],
    ["Up to 50 sq.m", 51, false],
    ["Above 100 employees", 101, true],
    ["Above 100 employees", 100, false],
    ["Less than 10 rooms", 9, true],
    ["Less than 10 rooms", 10, false],
    ["2 to 10 machines", 10, true],
    ["Transport with 2 vehicles", 2, true],
    ["Over 1000 sq.m", 1001, true],
    ["Small kiosk", 1, false],
  ])("%s with %i -> %s", (description, input, expected) => {
    expect(matchNumberRange(description, input)).toBe(expected);
  });
});
