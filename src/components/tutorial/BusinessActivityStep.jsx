import Select from "react-select";
import { formatKES } from "../../lib/format";
import { selectedOption, themedSelectStyles } from "../../lib/selectStyles";
import StepCard, { FieldError } from "./StepCard";

const READONLY_CLASS =
  "input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)] text-sm";
const RATE_CLASS =
  "input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md";
const NUMBER_CLASS =
  "input input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md w-full";

const LEVELS = [
  ["industry", "Industry"],
  ["businessCategory", "Business Category"],
  ["businessSubCategory", "Business Subcategory"],
  ["businessActivity", "Business Activity"],
];

const RATE_FIELDS = [
  ["firstSquareMetres", "First m²"],
  ["extraSquareMetres", "Each Extra m²"],
  ["firstThreeMetres", "First 3m²"],
  ["firstTenSquareMetres", "First 10m²"],
];

// Zero and missing rates don't apply to the selected advert type.
const hasRate = (value) => value !== "" && value !== null && Number(value) !== 0;

const Label = ({ children }) => (
  <label className="text-md text-emerald-900 dark:text-white font-medium">{children}</label>
);

const RateField = ({ label, value }) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <input type="text" value={formatKES(value)} readOnly className={RATE_CLASS} />
  </div>
);

/**
 * Step 3: pick the business activity, and optionally an advert ("Other Services").
 * `business` / `advert` are the useBusinessActivity / useAdvertFees results.
 */
const BusinessActivityStep = ({
  explanation,
  business,
  advert,
  showAdvert,
  onShowAdvertChange,
  activityErrors,
  advertErrors,
}) => (
  <StepCard title="Business Activity & Advert" explanation={explanation}>
    <div className="mb-4">
      <label className="block text-emerald-900 dark:text-white font-medium mb-2">Search Business Activity</label>
      <Select
        options={business.options}
        onChange={(option) => business.setSearchInput(option.value)}
        value={selectedOption(business.options, business.searchInput)}
        className="md:w-1/2 w-full mb-4"
        isSearchable
        placeholder="Search a business activity"
        aria-label="Select a business activity"
        isLoading={business.loading}
        styles={themedSelectStyles}
      />
      <FieldError message={activityErrors.searchInput} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {LEVELS.map(([key, label]) => (
        <div key={key} className="flex flex-col">
          <Label>{label}</Label>
          <input type="text" value={business.codes[key]} readOnly className={READONLY_CLASS} />
          <FieldError message={activityErrors[key]} />
          {business.codes[key] && business.descriptions[key] && (
            <p className="text-sm text-emerald-900 dark:text-white">{business.descriptions[key]}</p>
          )}
        </div>
      ))}
    </div>

    <div className="mt-6 flex items-center">
      <input
        id="showAdvertCheckbox"
        type="checkbox"
        checked={showAdvert}
        onChange={(e) => onShowAdvertChange(e.target.checked)}
        className="mr-2 accent-[#EAB308] dark:accent-[var(--color-primary)]"
      />
      <label htmlFor="showAdvertCheckbox" className="text-emerald-900 dark:text-white font-medium cursor-pointer">
        Other Services
      </label>
    </div>

    {showAdvert && (
      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold text-emerald-900 dark:text-white mb-4">Advert Details</h2>
        <div className="mb-4">
          <label className="block text-emerald-900 dark:text-white font-medium mb-2">Search Advert Type</label>
          <Select
            options={advert.options}
            onChange={(option) => advert.setAdvertType(option.value)}
            value={selectedOption(advert.options, advert.advertType)}
            className="md:w-1/2 w-full mb-4"
            isSearchable
            placeholder="Search advert type"
            aria-label="Search advert type"
            isLoading={advert.loading}
            styles={themedSelectStyles}
          />
          <FieldError message={advertErrors.advertSearchInput} />
        </div>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:mb-0 lg:mb-0 mb-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col">
            <Label>Advertisement Category</Label>
            <input type="text" value={advert.rates.advertisementCategory} readOnly className={RATE_CLASS} />
          </div>
          {hasRate(advert.rates.applicationFee) && (
            <RateField label="Application Fee (New Applicant)" value={advert.rates.applicationFee} />
          )}
          <div className="flex flex-col">
            <Label>Length (m) *</Label>
            <input
              type="number"
              min={0}
              value={advert.length}
              onChange={(e) => advert.setLength(Number(e.target.value))}
              className={NUMBER_CLASS}
            />
            <FieldError message={advertErrors.length} />
          </div>
          <div className="flex flex-col">
            <Label>Width (m) *</Label>
            <input
              type="number"
              min={0}
              value={advert.width}
              onChange={(e) => advert.setWidth(Number(e.target.value))}
              className={NUMBER_CLASS}
            />
            <FieldError message={advertErrors.width} />
          </div>
          {RATE_FIELDS.filter(([key]) => hasRate(advert.rates[key])).map(([key, label]) => (
            <RateField key={key} label={label} value={advert.rates[key]} />
          ))}
          <div className="flex flex-col">
            <Label>Licence Fee (Renewal)</Label>
            <input
              type="text"
              value={formatKES(advert.renewalFee) || "Ksh 0.00"}
              readOnly
              className={RATE_CLASS}
            />
          </div>
          <div className="flex flex-col">
            <Label>Licence Fee (New Applicant)</Label>
            <input
              type="text"
              value={formatKES(advert.newApplicantFee) || "Ksh 0.00"}
              readOnly
              className={RATE_CLASS}
            />
          </div>
          {advert.isSideType && (
            <div className="flex flex-col">
              <Label>Number of Sides *</Label>
              <input
                type="number"
                min={1}
                value={advert.numberOfSides}
                onChange={(e) => advert.setNumberOfSides(Number(e.target.value))}
                className={NUMBER_CLASS}
              />
              <FieldError message={advertErrors.numberOfSides} />
            </div>
          )}
        </form>
        <div className="text-emerald-900 dark:text-white mt-2 sm:mt-4 lg:mt-6 max-w-1/2 mx-auto">
          <span className="font-bold">Important Note:</span> If the <span className="font-semibold">length</span>{" "}
          and <span className="font-semibold">width</span> do not change when you press the up and down buttons,
          it indicates that the advert type carries a <span className="font-semibold">fixed rate</span>.{" "}
          <span role="img" aria-label="note">
            📝
          </span>
        </div>
      </div>
    )}
  </StepCard>
);

export default BusinessActivityStep;
