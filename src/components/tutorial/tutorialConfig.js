// Static content and validation for the UBP tutorial (/tutorial).
import { SIDE_ADVERT_TYPES } from "../../lib/fees";

export const STEPS = [
  "Application Type",
  "Business Details",
  "Business Activity",
  "Contacts",
  "Review & Submit",
];

// Read aloud and shown at the top of each step.
export const STEP_EXPLANATIONS = [
  "Welcome to the UBP Tutorial. In this first step, you'll select your application type and business nature. This helps us guide you through the right process for your business.",
  "Now, please enter your business details, such as name, branch, and location. Accurate information ensures your application is processed smoothly.",
  "Next, search and select your business activity. If you need to add an outdoor advertisement or other services, check the box to provide those details. This step ensures you get the correct permits and fees for your business.",
  "Enter your contact details, including business and contact person information. This allows the county to reach you with updates or questions about your application.",
  "Review all your information. If everything looks good, submit the tutorial. You're now ready to apply for your Unified Business Permit on NairobiPay. Thank you for using the UBP Tutorial!",
];

// [key, label, help text, input type]
export const BUSINESS_DETAIL_FIELDS = [
  ["businessName", "Business Name *", "Enter your official business name as registered."],
  ["branchName", "Branch Name *", "Specify the branch name if applicable."],
  ["subcounty", "Subcounty *", "Provide the subcounty where your business is located."],
  ["ward", "Ward *", "Enter the ward for your business location."],
  ["road", "Road/Street Name *", "Type the road or street name for your business."],
  ["plot", "Plot/Land Parcel Number *", "Provide the plot or land parcel number."],
  ["building", "Building/Trade Complex Name *", "Enter the building or trade complex name."],
  ["floor", "Floor Number *", "Specify the floor number."],
  ["unit", "Unit/Room/Stall Number *", "Enter the unit, room, or stall number."],
];

export const CONTACT_FIELDS = [
  ["businessEmail", "Business Email *", "Provide a valid business email address.", "email"],
  ["businessPhone", "Business Phone *", "Enter your business phone number."],
  ["postalAddress", "Postal Address *", "Type your business postal address."],
  ["postalCode", "Postal Code *", "Enter the postal code for your business."],
  ["role", "Contact Person Role *", "Specify the contact person's role in the business."],
  ["nationalId", "National ID *", "Enter the contact person's national ID number."],
  ["firstName", "First Name *", "Provide the contact person's first name."],
  ["contactPhone", "Contact Phone *", "Enter the contact person's phone number."],
  ["contactEmail", "Contact Email *", "Provide the contact person's email address.", "email"],
];

export const EMPTY_FORM = {
  applicationType: "",
  businessNature: "",
  businessDetails: {},
  businessActivity: {},
  advertDetails: {},
  contacts: {},
};

/** { field: "Required" } for every empty field in `values`. */
export function requiredErrors(values = {}, fields) {
  const errors = {};
  fields.forEach(([key]) => {
    if (!values[key]) errors[key] = "Required";
  });
  return errors;
}

export function activityErrors(searchInput, codes) {
  const errors = {};
  if (!searchInput) errors.searchInput = "Required";
  Object.entries(codes).forEach(([key, value]) => {
    if (!value) errors[key] = "Required";
  });
  return errors;
}

export function advertErrors({ advertType, length, width, numberOfSides }) {
  const errors = {};
  if (!advertType) errors.advertSearchInput = "Required";
  if (!length || length <= 0) errors.length = "Required";
  if (!width || width <= 0) errors.width = "Required";
  if (SIDE_ADVERT_TYPES.includes(advertType) && (!numberOfSides || numberOfSides <= 0)) {
    errors.numberOfSides = "Required";
  }
  return errors;
}
