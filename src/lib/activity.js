// Business activity lookups shared by the search page, tutorial and agent.
import { api } from "./api";
import { readCache, writeCache } from "./cache";

export const EMPTY_CODES = Object.freeze({
  industry: "",
  businessCategory: "",
  businessSubCategory: "",
  businessActivity: "",
});

/** Activity name -> classification codes (cached for a day). */
export async function lookupActivityCodes(name) {
  const cacheKey = `lookup:${name}`;
  let data = readCache(cacheKey);
  if (!data) {
    data = await api.lookupActivity(name);
    writeCache(cacheKey, data);
  }
  return {
    industry: data.industry || "",
    businessCategory: data.businessCategory || "",
    businessSubCategory: data.businessSubCategory || "",
    businessActivity: data.businessActivity || "",
  };
}

/** Codes -> human-readable descriptions for each level, plus the Finance Act fee rows. */
export async function loadActivityDetails(codes) {
  const [industry, category, subCategory, activity] = await Promise.all([
    api.industry(codes.industry),
    api.businessCategory(codes.businessCategory),
    api.businessSubCategory(codes.businessSubCategory),
    api.businessActivity(codes.businessActivity),
  ]);
  return {
    descriptions: {
      industry: industry.industry || "",
      businessCategory: category.businessCategory || "",
      businessSubCategory: subCategory.businessSubCategory || "",
      businessActivity: activity.businessActivity || "",
    },
    financeActs: activity.financeActs || [],
  };
}

/** Activity name -> { codes, descriptions, financeActs }. */
export async function loadActivity(name) {
  const codes = await lookupActivityCodes(name);
  const details = await loadActivityDetails(codes);
  return { codes, ...details };
}
