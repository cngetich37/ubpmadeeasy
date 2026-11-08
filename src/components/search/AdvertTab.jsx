import Select from "react-select";
import { brandSelectStyles, selectedOption } from "../../lib/selectStyles";
import { formatKES } from "../../lib/format";
import LoadingIndicator from "../common/LoadingIndicator";
import { Field, INPUT_CLASS, ReadOnlyField } from "./Field";
import DimensionInput from "./DimensionInput";

const RATE_FIELDS = [
  ["firstSquareMetres", "First m²"],
  ["extraSquareMetres", "Each Extra m²"],
  ["firstThreeMetres", "First 3m²"],
  ["firstTenSquareMetres", "First 10m²"],
];

/**
 * Advert tab: pick an advert type and size, see the licence fees.
 * `advert` is the useAdvertFees() result, owned by the parent.
 */
const AdvertTab = ({ advert, onDownload }) => {
  const { rates } = advert;
  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold text-center text-emerald-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
          Advert Small Formats
        </h1>
      </header>
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="w-full md:w-2/3">
          <Select
            options={advert.options}
            onChange={(option) => advert.setAdvertType(option.value)}
            value={selectedOption(advert.options, advert.advertType)}
            className="w-full"
            styles={brandSelectStyles}
            isSearchable
            placeholder="Search advert"
            aria-label="Search advert"
          />
        </div>
        <LoadingIndicator active={advert.loading} />
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={(e) => e.preventDefault()}>
        <ReadOnlyField label="Advertisement Category" value={rates.advertisementCategory} />
        <ReadOnlyField
          label="Application Fee (New Applicant)"
          value={formatKES(rates.applicationFee)}
          hidden={rates.applicationFee === 0}
        />
        <DimensionInput label="Length (m)" value={advert.length} onChange={advert.setLength} />
        <DimensionInput label="Width (m)" value={advert.width} onChange={advert.setWidth} />
        {advert.advertType !== "" &&
          RATE_FIELDS.map(([key, label]) => (
            <ReadOnlyField key={key} label={label} value={formatKES(rates[key])} hidden={rates[key] === 0} />
          ))}
        <ReadOnlyField
          label="Licence Fee (Renewal)"
          value={formatKES(advert.renewalFee) || "Ksh 0.00"}
        />
        <ReadOnlyField
          label="Licence Fee (New Applicant)"
          value={formatKES(advert.newApplicantFee) || "Ksh 0.00"}
        />
        {advert.isSideType && (
          <Field label="Number of Sides">
            <input
              type="number"
              min={1}
              value={advert.numberOfSides}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) advert.setNumberOfSides(value);
                else if (e.target.value === "") advert.setNumberOfSides("");
              }}
              className={`${INPUT_CLASS} w-full`}
            />
          </Field>
        )}
      </form>

      <div className="text-emerald-900 dark:text-white mt-2 sm:mt-4 lg:mt-6 max-w-1/2 mx-auto text-center text-base">
        <span className="font-bold">Important Note:</span> If the{" "}
        <span className="font-semibold">length</span> and <span className="font-semibold">width</span> do
        not change when you press the up and down buttons, it indicates that the advert type carries a{" "}
        <span className="font-semibold">fixed rate</span>.{" "}
        <span role="img" aria-label="note">
          📝
        </span>
      </div>

      <div className="flex flex-row justify-end mt-6">
        <button
          className="bg-emerald-900 text-[#FFD700] font-bold py-2 px-6 rounded-full shadow-lg hover:bg-emerald-800 hover:text-yellow-300 transition"
          onClick={onDownload}
        >
          Download PDF
        </button>
      </div>
    </>
  );
};

export default AdvertTab;
