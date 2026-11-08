// Turns a UBP Agent prompt into business / advert results and a text reply.
import { api } from "./api";
import { loadActivityDetails } from "./activity";
import { calculateAdvertFees, SIDE_ADVERT_TYPES } from "./fees";
import { filterFinanceRows, unitLabel } from "./financeActs";
import { formatKES } from "./format";
import {
  extractNumbers,
  extractRequestedSize,
  findAdvertType,
  findBusinessMatch,
  mentionsAdvert,
  parseAdvertSize,
  selectFinanceRow,
} from "./agentParser";

export const NOT_UNDERSTOOD = "I didn't understand your message.Please try again.";

async function answerBusiness(prompt, activities) {
  const match = findBusinessMatch(prompt, activities);
  if (!match) return null;

  const codes = {
    industry: match.industry,
    businessCategory: match.businessCategory,
    businessSubCategory: match.businessSubCategory,
    businessActivity: match.businessActivity,
  };
  const { descriptions, financeActs } = await loadActivityDetails(codes);
  const requestedNumbers = extractNumbers(prompt);
  const requestedSize = extractRequestedSize(prompt);
  const selectedRow = selectFinanceRow(financeActs, requestedNumbers, requestedSize);

  const label = selectedRow?.businessDescription ? unitLabel(selectedRow.businessDescription) : "";
  const filterValue = selectedRow?.businessDescription ? requestedNumbers[0] || requestedSize || "" : "";

  return {
    name: match.commonBusinessActivity,
    codes,
    descriptions,
    selectedRow,
    label,
    filterValue,
    rows: filterFinanceRows(financeActs, filterValue),
  };
}

async function answerAdvert(prompt, advertTypes) {
  const advertType = findAdvertType(prompt, advertTypes);
  if (!advertType) return null;
  const size = parseAdvertSize(prompt);
  const rates = await api.advert(advertType);
  return { advertType, rates, ...size, ...calculateAdvertFees(advertType, rates, size) };
}

/**
 * Answer a prompt. Network failures for one part are reported as
 * `errorMessage` rather than thrown.
 * @returns {Promise<{ business, advert, errorMessage }>}
 */
export async function answerPrompt(prompt, { activities, advertTypes }) {
  let business = null;
  let advert = null;
  let errorMessage = null;

  try {
    business = await answerBusiness(prompt, activities);
    if (!business) errorMessage = NOT_UNDERSTOOD;
  } catch (error) {
    console.error(error);
    errorMessage = NOT_UNDERSTOOD;
  }

  if (mentionsAdvert(prompt)) {
    try {
      advert = await answerAdvert(prompt, advertTypes);
      if (!advert) errorMessage = NOT_UNDERSTOOD;
    } catch (error) {
      console.error(error);
      errorMessage = NOT_UNDERSTOOD;
    }
  }

  return { business, advert, errorMessage };
}

/** Chat reply text for an answer. */
export function composeReply({ business, advert }) {
  let text = "";
  if (business) {
    const { name, codes, selectedRow } = business;
    text += `Business: ${name}\n`;
    text += `Industry: ${codes.industry}\n`;
    text += `Business Category: ${codes.businessCategory}\n`;
    text += `Business Subcategory: ${codes.businessSubCategory}\n`;
    text += `Business Activity: ${codes.businessActivity}\n`;
    if (selectedRow) {
      text += `For a ${selectedRow.businessDescription}, the charges are:\n`;
      text += `Trade License: ${selectedRow.tradeLicence}, Fire Clearance: ${selectedRow.fireClearance}, Food Hygiene: ${selectedRow.foodHygiene}, Health Certificate: ${selectedRow.healthCertificate}, Pest Control: ${selectedRow.pestControl}\n`;
    }
    text += "\n";
  }
  if (advert) {
    const money = (value) => formatKES(value, { blankZero: true });
    const { rates } = advert;
    const rows = [
      ["Advert", advert.advertType],
      ["Category", rates.advertisementCategory || "N/A"],
      ...(advert.length !== 1 || advert.width !== 1
        ? [["Dimensions", `${advert.length}m x ${advert.width}m`]]
        : []),
      ...(SIDE_ADVERT_TYPES.includes(advert.advertType) ? [["Number of Sides", advert.numberOfSides]] : []),
      ["Application Fee", money(rates.applicationFee)],
      ["First m²", money(rates.firstSquareMetres)],
      ["First 3m²", money(rates.firstThreeMetres)],
      ["First 10m²", money(rates.firstTenSquareMetres)],
      ["Each Extra m²", money(rates.extraSquareMetres)],
      ["Licence Fee (Renewal)", money(advert.renewalFee)],
      ["Licence Fee (New Applicant)", money(advert.newApplicantFee)],
    ];
    rows
      .filter(([, value]) => value !== "N/A" && value !== "" && value !== undefined)
      .forEach(([label, value]) => {
        text += `${label}: ${value}\n`;
      });
    text += "\n";
  }
  text += "You can download a PDF with these details below.";
  return text.replace(/KSH|KES/gi, "KES");
}
