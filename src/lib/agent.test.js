import { describe, expect, it } from "vitest";
import { composeReply } from "./agent";
import { advertRows } from "./pdf";
import { selectedOption } from "./selectStyles";

const advert = {
  advertType: "Billboard",
  rates: {
    advertisementCategory: "Signboard",
    applicationFee: 10000,
    firstSquareMetres: 0,
    firstThreeMetres: 36400,
    firstTenSquareMetres: 0,
    extraSquareMetres: 3000,
  },
  length: 4,
  width: 1,
  numberOfSides: 1,
  renewalFee: 39400,
  newApplicantFee: 49400,
};

describe("composeReply", () => {
  it("describes the business and the selected fee row", () => {
    const text = composeReply({
      business: {
        name: "Printing",
        codes: { industry: "32", businessCategory: "323", businessSubCategory: "3231", businessActivity: "32311" },
        selectedRow: {
          businessDescription: "1-5 employees",
          tradeLicence: 1000,
          fireClearance: 500,
          foodHygiene: 0,
          healthCertificate: 0,
          pestControl: 300,
        },
      },
    });
    expect(text).toContain("Business: Printing\nIndustry: 32\n");
    expect(text).toContain("For a 1-5 employees, the charges are:");
    expect(text).toContain("Pest Control: 300\n");
    expect(text).toMatch(/You can download a PDF/);
  });

  it("lists non-zero advert rates and fees, with sides for side-based types", () => {
    const text = composeReply({ advert });
    expect(text).toContain("Advert: Billboard\nCategory: Signboard\nDimensions: 4m x 1m\nNumber of Sides: 1\n");
    expect(text).toMatch(/Licence Fee \(Renewal\): KES\s?39,400\.00/);
    expect(text).not.toContain("First m²:");
    expect(text).not.toMatch(/Ksh/);
  });
});

describe("advertRows", () => {
  it("drops empty / zero values and keeps the order used in the PDF", () => {
    const labels = advertRows(advert).map(([label]) => label);
    expect(labels).toEqual([
      "Advertisement Category",
      "Advert",
      "Application Fee (New Applicant)",
      "Dimensions (Length × Width)",
      "Number of Sides",
      "First 3m²",
      "Each Extra m²",
      "Licence Fee (Renewal)",
      "Licence Fee (New Applicant)",
    ]);
  });

  it("can hide the dimensions row", () => {
    const labels = advertRows(advert, { showDimensions: false }).map(([label]) => label);
    expect(labels).not.toContain("Dimensions (Length × Width)");
  });
});

describe("selectedOption", () => {
  const options = [{ value: "Barber Shop", label: "Barber Shop" }];
  it("finds the option, synthesises a missing one, and is null when empty", () => {
    expect(selectedOption(options, "Barber Shop")).toBe(options[0]);
    expect(selectedOption(options, "Kiosk")).toEqual({ value: "Kiosk", label: "Kiosk" });
    expect(selectedOption(options, "")).toBeNull();
  });
});
