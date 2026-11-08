// Helpers for the Finance Act fee rows returned with a business activity.
import { matchNumberRange } from "./fees";

/** Fee columns, in display order: [field, label]. */
export const FEE_COLUMNS = [
  ["tradeLicence", "Trade Licence"],
  ["fireClearance", "Fire Clearance"],
  ["foodHygiene", "Food Hygiene"],
  ["healthCertificate", "Health Certificate"],
  ["pestControl", "Pest Control"],
];

/** Sum of all fee columns for one row. */
export const rowTotal = (row) =>
  FEE_COLUMNS.reduce((sum, [field]) => sum + (parseFloat(row[field]) || 0), 0);

/**
 * Rows matching the user's number (outlets, employees, m², ...), without
 * duplicate descriptions. An empty filter keeps every row; a non-numeric one
 * matches nothing.
 */
export function filterFinanceRows(rows = [], filterValue = "") {
  const matching = !filterValue
    ? rows
    : rows.filter((row) => {
        const n = parseInt(filterValue, 10);
        return !isNaN(n) && matchNumberRange(row.businessDescription, n);
      });
  const seen = new Set();
  return matching.filter((row) => {
    if (seen.has(row.businessDescription)) return false;
    seen.add(row.businessDescription);
    return true;
  });
}

/** "1-5 outlets" -> "No of outlets"; "" when the description has no count. */
export function unitLabel(description) {
  if (!description) return "";
  const match = description.match(/(?:over\s*)?(\d+)(?:\s*[-–—]\s*\d+)?\s+([\w]+)/i);
  return match ? `No of ${match[2]}` : "";
}

/** Unit label for an activity, taken from its first described row. */
export function unitLabelForRows(rows = []) {
  const first = rows.find((row) => row.businessDescription);
  return first ? unitLabel(first.businessDescription) : "";
}
