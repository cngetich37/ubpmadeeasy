// Shared fee logic for UBP business permits and outdoor advert licences.
// Used by CombinedSearch (/ubp), UBPAgent (/agent) and UBPTutorial (/tutorial).
// Change fee rules here only.

// Advert types whose renewal fee is charged per side.
export const SIDE_ADVERT_TYPES = [
  "Above Canopy",
  "Under Canopy",
  "Directional Signs",
  "Billboard",
  "Call In Adverts",
];

// Flat renewal fees (KES) not supplied by the API.
const FLAT_RENEWAL_FEES = {
  "Directional Signs": 10500,
  "Call In Adverts": 18200,
};

const TEN_METRE_TYPES = ["Wallpainting", "Window Branding", "Wall Branding"];

const toNumber = (value) => Number(value) || 0;

/**
 * Calculate the advert licence fees.
 *
 * @param {string} advertType  e.g. "Billboard"
 * @param {object} rates       API fields from GET /api/advert/{type}:
 *                             applicationFee, firstSquareMetres, firstThreeMetres,
 *                             firstTenSquareMetres, extraSquareMetres, perEachperYear
 * @param {object} size        { length, width, numberOfSides }
 * @returns {{ renewalFee: number, newApplicantFee: number }}
 *          newApplicantFee is always renewalFee + applicationFee.
 */
export const calculateAdvertFees = (
  advertType,
  rates = {},
  { length = 1, width = 1, numberOfSides = 1 } = {}
) => {
  const applicationFee = toNumber(rates.applicationFee);
  const firstSquareMetres = toNumber(rates.firstSquareMetres);
  const firstThreeMetres = toNumber(rates.firstThreeMetres);
  const firstTenSquareMetres = toNumber(rates.firstTenSquareMetres);
  const extraSquareMetres = toNumber(rates.extraSquareMetres);
  const perEachperYear = toNumber(rates.perEachperYear);
  const area = toNumber(length) * toNumber(width);

  let renewalFee = 0;
  if (advertType in FLAT_RENEWAL_FEES) {
    renewalFee = FLAT_RENEWAL_FEES[advertType];
  } else if (advertType === "Billboard") {
    if (area < 3) renewalFee = 0;
    else if (area === 3) renewalFee = firstThreeMetres;
    else renewalFee = (area - 3) * extraSquareMetres + firstThreeMetres;
  } else if (advertType === "Corporate Flags") {
    renewalFee = perEachperYear;
  } else if (advertType === "Canvas") {
    renewalFee = firstSquareMetres;
  } else if (advertType === "Business Encroachment") {
    renewalFee = area * firstSquareMetres;
  } else if (TEN_METRE_TYPES.includes(advertType)) {
    if (area < 10) renewalFee = 0;
    else if (area === 10) renewalFee = firstTenSquareMetres;
    else renewalFee = (area - 10) * extraSquareMetres + firstTenSquareMetres;
  } else if (area === 1) {
    renewalFee = firstSquareMetres;
  } else if (area > 1) {
    renewalFee = (area - 1) * extraSquareMetres + firstSquareMetres;
  }

  if (SIDE_ADVERT_TYPES.includes(advertType)) {
    renewalFee *= toNumber(numberOfSides) || 1;
  }

  return { renewalFee, newApplicantFee: renewalFee + applicationFee };
};

/**
 * Does a Finance Act businessDescription (e.g. "1-5 outlets", "up to 50 sq.m",
 * "above 100 employees", "with 2 vehicles") cover the number the user entered?
 */
export const matchNumberRange = (description, input) => {
  const cleanedDescription = description.toLowerCase().trim();

  const rangeMatch = cleanedDescription.match(
    /\b(?:from\s+)?(\d+)\s*[-–—]{1,2}\s*(\d+)\s*(?:sq\.?\s*m|m²)?\b/
  );
  if (rangeMatch) {
    const lowerBound = parseInt(rangeMatch[1], 10);
    const upperBound = parseInt(rangeMatch[2], 10);
    return input >= lowerBound && input <= upperBound;
  }

  const upToMatch = cleanedDescription.match(/\b(up to|upto)\s+(\d+)/);
  if (upToMatch) {
    return input >= 1 && input <= parseInt(upToMatch[2], 10);
  }

  const aboveMatch = cleanedDescription.match(/\babove\s+(\d+)/);
  if (aboveMatch) {
    return input > parseInt(aboveMatch[1], 10);
  }

  const lessThanMatch = cleanedDescription.match(/\bless\s+than\s+(\d+)/i);
  if (lessThanMatch) {
    return input >= 1 && input < parseInt(lessThanMatch[1], 10);
  }

  const toMatch = cleanedDescription.match(/\bto\s+(\d+)/);
  if (toMatch) {
    return input >= 2 && input <= parseInt(toMatch[1], 10);
  }

  const vehicleMatch = cleanedDescription.match(/(?:with|without)\s+(\d+)\s+vehicle/);
  if (vehicleMatch && input === parseInt(vehicleMatch[1], 10)) {
    return true;
  }

  const overMatch = cleanedDescription.match(/\bover\s+(\d+)/);
  if (overMatch) {
    return input > parseInt(overMatch[1], 10);
  }

  return false;
};
