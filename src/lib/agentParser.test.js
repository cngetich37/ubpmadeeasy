import { describe, expect, it } from "vitest";
import {
  extractNumbers,
  extractRequestedSize,
  findAdvertType,
  findBusinessMatch,
  mentionsAdvert,
  parseAdvertSize,
  prepareSpeechText,
  selectFinanceRow,
  wordsToNumber,
} from "./agentParser";

describe("numbers", () => {
  it("converts number words", () => {
    expect(wordsToNumber("twenty-five")).toBe(25);
  });

  it("extracts digits and words from a prompt", () => {
    expect(extractNumbers("MPESA with 5 outlets")).toEqual([5]);
    expect(extractNumbers("three shops")).toEqual([3]);
    expect(extractNumbers("twenty-two employees")).toEqual([22]);
    expect(extractNumbers("over 5 rooms")).toEqual([6, 5]);
  });

  it("extracts a floor area", () => {
    expect(extractRequestedSize("Food storage with 1000 sq.m?")).toBe(1000);
    expect(extractRequestedSize("a 500m² shop")).toBe(500);
    expect(extractRequestedSize("a shop")).toBeNull();
  });
});

describe("findBusinessMatch", () => {
  const activities = [
    { commonBusinessActivity: "Shop" },
    { commonBusinessActivity: "Barber Shop" },
    { commonBusinessActivity: "MPESA" },
  ];

  it("picks the longest (most specific) activity named", () => {
    expect(findBusinessMatch("charges for a barber shop?", activities).commonBusinessActivity).toBe("Barber Shop");
  });

  it("ignores case and punctuation", () => {
    expect(findBusinessMatch("Business charges for M-PESA, 5 outlets", activities).commonBusinessActivity).toBe("MPESA");
    expect(findBusinessMatch("Business charges for mpesa!", activities).commonBusinessActivity).toBe("MPESA");
  });

  it("returns null when nothing matches", () => {
    expect(findBusinessMatch("hello", activities)).toBeNull();
  });
});

describe("adverts", () => {
  const types = ["Above Canopy", "Under Canopy", "Billboard", "Sky Sign"];

  it("detects advert prompts", () => {
    expect(mentionsAdvert("Under canopy 1m by 2m")).toBe(true);
    expect(mentionsAdvert("MPESA with 5 outlets")).toBe(false);
  });

  it("prefers an exact advert type, then any shared word", () => {
    expect(findAdvertType("Under canopy 1m by 2m", types)).toBe("Under Canopy");
    expect(findAdvertType("a big billboard", types)).toBe("Billboard");
    expect(findAdvertType("a canopy sign", types)).toBe("Above Canopy");
    expect(findAdvertType("nothing here", types)).toBeUndefined();
  });

  it("parses size and sides", () => {
    expect(parseAdvertSize("Under canopy 1m by 2m, 2 sides")).toEqual({ length: 1, width: 2, numberOfSides: 2 });
    expect(parseAdvertSize("billboard 4.5 metres x 3 metres")).toEqual({ length: 4.5, width: 3, numberOfSides: 1 });
    expect(parseAdvertSize("Above canopy with 2 sides?")).toEqual({ length: 1, width: 1, numberOfSides: 2 });
  });
});

describe("selectFinanceRow", () => {
  const rows = [
    { businessDescription: "Small shop" },
    { businessDescription: "1-5 outlets" },
    { businessDescription: "6-10 outlets" },
    { businessDescription: "Over 10 outlets" },
    { businessDescription: "Up to 500 sq.m" },
  ];

  it("picks the range that covers the requested number", () => {
    expect(selectFinanceRow(rows, [7]).businessDescription).toBe("6-10 outlets");
    expect(selectFinanceRow(rows, [12]).businessDescription).toBe("Over 10 outlets");
  });

  it("uses the requested size when there is no number match", () => {
    expect(selectFinanceRow(rows, [], 400).businessDescription).toBe("Up to 500 sq.m");
  });

  it("falls back to a row without numbers, then the first row", () => {
    expect(selectFinanceRow(rows, []).businessDescription).toBe("Small shop");
    expect(selectFinanceRow([{ businessDescription: "1-5 outlets" }], []).businessDescription).toBe("1-5 outlets");
    expect(selectFinanceRow([], [3])).toBeNull();
  });
});

describe("prepareSpeechText", () => {
  it("appends KES after the figure it matches", () => {
    expect(prepareSpeechText("Pest Control: 300\n")).toBe("Pest Control: 300 KES\n");
  });
});
