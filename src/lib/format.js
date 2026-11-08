// Display formatting helpers.

const KES_FORMAT = { style: "currency", currency: "KES", minimumFractionDigits: 2 };

/**
 * Format a number (or numeric string) as Kenyan shillings.
 * Returns "" for anything non-numeric, and for 0 when `blankZero` is set.
 */
export function formatKES(value, { blankZero = false } = {}) {
  const amount = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(amount)) return "";
  if (blankZero && amount === 0) return "";
  return amount.toLocaleString("en-KE", KES_FORMAT);
}

/** "businessName" -> "Business Name" */
export const humanizeKey = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
