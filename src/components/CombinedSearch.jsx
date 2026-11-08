import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useApiError } from "../hooks/useApiError";
import { useBusinessActivity } from "../hooks/useBusinessActivity";
import { useAdvertFees } from "../hooks/useAdvertFees";
import { filterFinanceRows, unitLabelForRows } from "../lib/financeActs";
import { downloadAdvertPdf, downloadBusinessPdf } from "../lib/pdf";
import ErrorBanner from "./common/ErrorBanner";
import MessageModal from "./common/MessageModal";
import BusinessTab from "./search/BusinessTab";
import AdvertTab from "./search/AdvertTab";

const TAB_BASE =
  "w-1/2 py-3 px-6 font-bold text-lg rounded-full transition-all duration-200 focus:outline-none shadow-md border-2";
const TAB_ACTIVE =
  "bg-emerald-900 text-[#FFD700] border-[#FFD700] dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)] dark:border-[var(--color-primary)] scale-105";
const TAB_INACTIVE =
  "bg-white dark:bg-[var(--color-surface)] text-emerald-900 dark:text-[var(--color-text)] border-emerald-100 dark:border-[var(--color-primary)] hover:bg-[#FFD700]/10 dark:hover:bg-[var(--color-primary)]/10";

/** /ubp: business activity and advert fee lookup, with PDF export. */
function CombinedSearch() {
  const [activeTab, setActiveTab] = useState("business");
  const [modalMessage, setModalMessage] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const { apiError, onError, onSuccess, clearError } = useApiError();

  // Both searches live here so their state survives switching tabs.
  const business = useBusinessActivity({ onError, onSuccess });
  const advert = useAdvertFees({ onError, onSuccess });

  // Deep links from PDF QR codes: /ubp?ubp=<activity> or /ubp?advert=<type>
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const ubpParam = params.get("ubp");
  const advertParam = params.get("advert");
  const { setSearchInput } = business;
  const { setAdvertType } = advert;
  useEffect(() => {
    if (ubpParam) setSearchInput(ubpParam);
  }, [ubpParam, setSearchInput]);
  useEffect(() => {
    if (advertParam) setAdvertType(advertParam);
  }, [advertParam, setAdvertType]);

  const unitLabel = useMemo(() => unitLabelForRows(business.financeActs), [business.financeActs]);
  const rows = useMemo(
    () => filterFinanceRows(business.financeActs, filterValue),
    [business.financeActs, filterValue]
  );

  const handleBusinessDownload = () => {
    const { codes } = business;
    if (!business.searchInput || Object.values(codes).some((code) => code === "")) {
      setModalMessage("Please select a business activity");
      return;
    }
    downloadBusinessPdf({
      name: business.searchInput,
      codes,
      descriptions: business.descriptions,
      label: unitLabel,
      filterValue,
      rows,
    }).catch(onError);
  };

  const handleAdvertDownload = () => {
    if (
      !advert.ratesLoaded ||
      advert.length === "" ||
      advert.width === "" ||
      advert.renewalFee === ""
    ) {
      setModalMessage("Please select an advert type.");
      return;
    }
    downloadAdvertPdf({
      advertType: advert.advertType,
      rates: advert.rates,
      length: advert.length,
      width: advert.width,
      numberOfSides: advert.numberOfSides,
      renewalFee: advert.renewalFee,
      newApplicantFee: advert.newApplicantFee,
    }).catch(onError);
  };

  return (
    <>
      <Helmet>
        <title>UBP Made Easy | Search UBP</title>
        <meta
          name="description"
          content="Search for business activities and advertisement information for the Unified Business Permit application process."
        />
        <meta
          name="keywords"
          content="NAICS Code, business permit, unified Business Permit, Nairobi Pay, UBP, business activity, advertisement, outdoor advertising"
        />
        <meta name="author" content="Collins Ngetich" />
      </Helmet>
      <main className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 dark:from-[var(--color-bg)] dark:via-[var(--color-surface)] dark:to-[var(--color-bg)] pt-4 pb-4 pl-2">
        <div className="flex flex-col justify-center items-center md:w-full w-full max-w-screen-5xl mr-auto ml-auto overflow-x-auto">
          <div
            id="capture"
            className="bg-white dark:bg-[var(--color-surface)] border-2 border-[#FFD700] dark:border-[var(--color-primary)] shadow-xl shadow-yellow-500/20 md:mb-2 md:w-4/5 w-11/12 md:h-auto h-auto md:mt-6 md:ml-2 p-6 rounded-2xl overflow-y-auto mb-16 transition-all duration-300"
          >
            <ErrorBanner message={apiError} onDismiss={clearError} />

            <div className="flex justify-center gap-x-2 mb-8" role="tablist">
              {[
                ["business", "UBP"],
                ["advertisement", "Advert"],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  role="tab"
                  className={`${TAB_BASE} ${activeTab === tab ? TAB_ACTIVE : TAB_INACTIVE}`}
                  onClick={() => setActiveTab(tab)}
                  aria-selected={activeTab === tab}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "business" && (
              <BusinessTab
                business={business}
                unitLabel={unitLabel}
                filterValue={filterValue}
                onFilterChange={setFilterValue}
                rows={rows}
                onDownload={handleBusinessDownload}
              />
            )}
            {activeTab === "advertisement" && (
              <AdvertTab advert={advert} onDownload={handleAdvertDownload} />
            )}

            {modalMessage && (
              <MessageModal
                title="Missing Information"
                message={modalMessage}
                onClose={() => setModalMessage(null)}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default CombinedSearch;
