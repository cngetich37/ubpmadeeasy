// Single client for the UBP backend. All network calls go through here.
import { API_URL } from "../config";

// The backend runs on Render's free tier and can take ~30-50s to wake up,
// so allow a generous timeout before giving up.
const DEFAULT_TIMEOUT_MS = 60_000;

export const API_ERROR_MESSAGE =
  "We couldn't reach the UBP service. It may be waking up - please try again in a few seconds.";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function getJson(path, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_URL}${path}`, { signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(`GET ${path} failed with ${response.status}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.name === "AbortError" ? `GET ${path} timed out` : `GET ${path} failed: ${error.message}`
    );
  } finally {
    clearTimeout(timer);
  }
}

const enc = encodeURIComponent;

export const api = {
  /** Common business activity names for the search dropdown. */
  ubpDictionary: () => getJson("/api/naics/ubpdictionary"),
  /** Full NAICS dataset (used by the agent for free-text matching). */
  allActivities: () => getJson("/api/naics/"),
  /** Activity name -> { industry, businessCategory, businessSubCategory, businessActivity } codes. */
  lookupActivity: (name) => getJson(`/api/naics/${enc(name)}`),
  industry: (code) => getJson(`/api/naics/industry/${enc(code)}`),
  businessCategory: (code) => getJson(`/api/naics/businesscategories/${enc(code)}`),
  businessSubCategory: (code) => getJson(`/api/naics/businesssubcategories/${enc(code)}`),
  /** Activity code -> { businessActivity, financeActs[] }. */
  businessActivity: (code) => getJson(`/api/naics/businessactivities/${enc(code)}`),
  /** List of advert types: [{ advertType }]. */
  adverts: () => getJson("/api/advert"),
  /** Rates for one advert type. */
  advert: (type) => getJson(`/api/advert/${enc(type)}`),
};
