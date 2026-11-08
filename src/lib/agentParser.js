// Pure prompt-parsing helpers for the UBP Agent (/agent). No network access.

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000,
};

/** "twenty-five" -> 25 */
export function wordsToNumber(words) {
  let num = 0;
  let temp = 0;
  words.split(/[\s-]+/).forEach((word) => {
    if (NUMBER_WORDS[word] !== undefined) {
      temp += NUMBER_WORDS[word];
    } else if (word === "hundred") {
      temp *= 100;
    } else if (word === "thousand") {
      temp *= 1000;
      num += temp;
      temp = 0;
    }
  });
  return num + temp;
}

/** Numbers mentioned in a prompt: "5 outlets" -> [5], "over five" -> [5, 6]. */
export function extractNumbers(text) {
  const words = text.toLowerCase().split(/\s+/);
  const numbers = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (NUMBER_WORDS[word]) {
      numbers.push(NUMBER_WORDS[word]);
    } else if (/\d+/.test(word)) {
      numbers.push(parseInt(word, 10));
    } else if (word.includes("-")) {
      const num = wordsToNumber(word);
      if (num > 0) numbers.push(num);
    } else if (word === "over" && i + 1 < words.length) {
      const next = words[i + 1];
      if (NUMBER_WORDS[next] || /\d+/.test(next)) {
        numbers.push((NUMBER_WORDS[next] || parseInt(next, 10)) + 1); // "over 5" -> 6
      }
    }
  }
  return numbers;
}

/** Floor area mentioned in a prompt ("1000 sq.m", "500m²"), or null. */
export function extractRequestedSize(text) {
  const match = text.match(/(\d+)\s*(sq\.?m|square meters?|m²)/i);
  return match ? parseInt(match[1], 10) : null;
}

const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, "")
    .replace(/\s+/g, " ")
    .trim();

/** The most specific (longest) dataset activity named in the prompt, or null. */
export function findBusinessMatch(prompt, activities = []) {
  const input = normalize(prompt);
  const matches = activities
    .map((item) => ({ item, name: normalize(item.commonBusinessActivity) }))
    .filter(({ name }) => input.includes(name) || new RegExp(`\\b${name}\\b`).test(input));
  if (!matches.length) return null;
  return matches.reduce((a, b) => (b.name.length > a.name.length ? b : a)).item;
}

const ADVERT_KEYWORDS = [
  "advert", "billboard", "canopy", "sign", "banner", "painting", "branding", "flag", "window", "wall",
];

export const mentionsAdvert = (prompt) =>
  ADVERT_KEYWORDS.some((keyword) => prompt.toLowerCase().includes(keyword));

const escapeRegExp = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

/** Advert type named in the prompt: exact phrase first, then any shared word. */
export function findAdvertType(prompt, advertTypes = []) {
  const exact = advertTypes.find((type) =>
    new RegExp(`\\b${escapeRegExp(type)}\\b`, "i").test(prompt)
  );
  if (exact) return exact;
  const lower = prompt.toLowerCase();
  return advertTypes.find((type) =>
    type.toLowerCase().split(" ").some((word) => lower.includes(word))
  );
}

/** "1m by 2m, 2 sides" -> { length: 1, width: 2, numberOfSides: 2 }; defaults to 1. */
export function parseAdvertSize(prompt) {
  let length = 1;
  let width = 1;
  let numberOfSides = 1;
  const dims = prompt.match(
    /(\d+(?:\.\d+)?)\s*(metres?|meters?|m)\s*(by|x|\*)\s*(\d+(?:\.\d+)?)\s*(metres?|meters?|m)/i
  );
  if (dims) {
    length = parseFloat(dims[1]);
    width = parseFloat(dims[4]);
  }
  const sides = prompt.match(/(\d+)\s*sides?/i);
  if (sides) numberOfSides = parseInt(sides[1], 10);
  return { length, width, numberOfSides };
}

const upToLimit = (desc) => desc.match(/\b(up to|upto)\s+(\d+)/i);
const lessThanLimit = (desc) => desc.match(/\bless\s+than\s+(\d+)/i);

/**
 * Pick the Finance Act row for the numbers / size in a prompt. Falls back to a
 * row without numbers, then the first row.
 */
export function selectFinanceRow(rows = [], requestedNumbers = [], requestedSize = null) {
  let selected = null;

  if (requestedNumbers.length > 0) {
    selected = rows.find((row) => {
      const bounds = row.businessDescription.match(/\d+/g)?.map(Number) || [];
      return requestedNumbers.some((num) => {
        if (bounds.length === 2) return num >= bounds[0] && num <= bounds[1]; // "X-Y"
        if (bounds.length === 1) return num > bounds[0]; // "over X"
        return false;
      });
    });
    if (!selected) {
      selected = rows.find((row) => {
        const desc = row.businessDescription.toLowerCase();
        if (/up to|upto/.test(desc)) {
          const m = upToLimit(row.businessDescription);
          if (m) return requestedNumbers.some((num) => num <= parseInt(m[2], 10));
        }
        if (/less than/.test(desc)) {
          const m = lessThanLimit(row.businessDescription);
          if (m) return requestedNumbers.some((num) => num < parseInt(m[1], 10));
        }
        if (/over/.test(desc)) {
          const m = row.businessDescription.match(/\bover\s+(\d+)/i);
          if (m) return requestedNumbers.some((num) => num > parseInt(m[1], 10));
        }
        return false;
      });
    }
  }

  if (requestedSize && !selected) {
    selected = rows.find((row) => {
      const desc = row.businessDescription.toLowerCase();
      if (/up to|upto/.test(desc)) {
        const m = upToLimit(row.businessDescription);
        if (m) return requestedSize <= parseInt(m[2], 10);
      }
      if (/less than/.test(desc)) {
        const m = lessThanLimit(row.businessDescription);
        if (m) return requestedSize < parseInt(m[1], 10);
      }
      const range = row.businessDescription.match(/\b(\d+)\s*-\s*(\d+)/);
      if (range) {
        return requestedSize >= parseInt(range[1], 10) && requestedSize <= parseInt(range[2], 10);
      }
      if (/over/.test(desc)) {
        const m = row.businessDescription.match(/\bover\s+(\d+)/);
        if (m) return requestedSize > parseInt(m[1], 10);
      }
      return false;
    });
  }

  if (!selected && rows.length > 0) {
    selected = rows.find((row) => !/\d+/.test(row.businessDescription)) || rows[0];
  }
  return selected ?? null;
}

/**
 * Adds " KES" after the figures in the agent's fee breakdown so the speech
 * reads the currency (kept from the original agent).
 */
export function prepareSpeechText(text) {
  return text.replace(
    /(Trade License:.*?)(\d+)\n|(Fire Clearance:.*?)(\d+)\n|(Food Hygiene:.*?)(\d+)\n|(Health Certificate:.*?)(\d+)\n|(Pest Control:.*?)(\d+)\n|(Total Charges:.*?)(\d+)\n/g,
    (match, ...groups) => {
      for (let i = 0; i < 12; i += 2) {
        if (groups[i]) return `${groups[i]}${groups[i + 1]} KES\n`;
      }
      return match;
    }
  );
}
