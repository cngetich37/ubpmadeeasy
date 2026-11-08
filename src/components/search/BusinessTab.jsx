import Select from "react-select";
import { brandSelectStyles, selectedOption } from "../../lib/selectStyles";
import LoadingIndicator from "../common/LoadingIndicator";
import { ReadOnlyField } from "./Field";
import FinanceActTable from "./FinanceActTable";

const LEVELS = [
  ["industry", "Industry"],
  ["businessCategory", "Business Category"],
  ["businessSubCategory", "Business Sub category"],
  ["businessActivity", "Business Activity"],
];

/**
 * UBP tab: pick an activity, see its classification and Finance Act charges.
 * State lives in the parent so it survives switching tabs.
 */
const BusinessTab = ({ business, unitLabel, filterValue, onFilterChange, rows, onDownload }) => (
  <>
    <header>
      <h1 className="text-3xl font-extrabold text-center text-emerald-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
        Business Activity Information
      </h1>
    </header>

    <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
      <div className="w-full md:w-2/3">
        <Select
          options={business.options}
          onChange={(option) => business.setSearchInput(option.value)}
          value={selectedOption(business.options, business.searchInput)}
          className="w-full"
          styles={brandSelectStyles}
          isSearchable
          placeholder="Search a business activity"
          aria-label="Select a business activity"
        />
      </div>
      <LoadingIndicator active={business.loading} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {LEVELS.map(([key, label]) => (
        <ReadOnlyField
          key={key}
          label={label}
          value={business.codes[key]}
          hint={business.descriptions[key]}
        />
      ))}
    </div>

    <div className="w-full overflow-x-auto mt-8">
      <div className="mb-4">
        <label
          htmlFor="businessDescriptionFilter"
          className="block text-base font-semibold text-emerald-900 dark:text-white mb-2"
        >
          {unitLabel.replace(/Hospitals/g, "beds").replace(/\bsq\b/g, "sq.m")}
        </label>
        <input
          type="text"
          id="businessDescriptionFilter"
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-white border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition w-full md:w-1/3"
        />
      </div>
      <FinanceActTable rows={rows} />
    </div>

    <div className="flex justify-end mt-6">
      <button
        onClick={onDownload}
        className="bg-emerald-900 text-[#FFD700] font-bold py-2 px-6 rounded-full shadow-lg hover:bg-emerald-800 hover:text-yellow-300 transition mb-8"
      >
        Download PDF
      </button>
    </div>
  </>
);

export default BusinessTab;
