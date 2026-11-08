import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NAIROBI_PAY_URL } from "../../config";
import { humanizeKey } from "../../lib/format";
import StepCard from "./StepCard";
import { STEPS } from "./tutorialConfig";

const ReviewSection = ({ title, open, onToggle, children }) => (
  <div className="mb-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <button
      className="w-full flex justify-between items-center p-4 text-left text-lg font-bold focus:outline-none bg-[#FFD700] text-emerald-900 dark:text-[var(--color-bg)] transition-all duration-300"
      onClick={onToggle}
    >
      {title}
      {open ? <ChevronUp className="text-emerald-900" /> : <ChevronDown className="text-emerald-900" />}
    </button>
    {open && <div className="bg-gray-50 dark:bg-[var(--color-bg)] p-4 text-emerald-900 dark:text-white">{children}</div>}
  </div>
);

const KeyValueList = ({ values }) =>
  Object.entries(values || {}).map(([key, value]) => (
    <div key={key} className="mb-1">
      {humanizeKey(key)}: <span className="font-medium">{value || "-"}</span>
    </div>
  ));

const CompletionModal = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white dark:bg-[var(--color-surface)] w-11/12 max-w-md rounded-lg shadow-lg p-8 border-4 border-[#EAB308] dark:border-[var(--color-primary)] relative flex flex-col items-center">
      <h2 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4 text-center">Tutorial Complete!</h2>
      <p className="text-lg text-emerald-900 dark:text-white mb-6 text-center">
        The tutorial is complete.
        <br />
        Head over to{" "}
        <a
          href={NAIROBI_PAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#EAB308] underline font-semibold dark:text-[var(--color-primary)]"
        >
          NairobiPay
        </a>{" "}
        to apply for Unified Business Permit.
        <br />
        <span className="block mt-2">Thank you!</span>
      </p>
      <button
        className="btn bg-[#EAB308] text-emerald-900 dark:bg-emerald-900 dark:text-[#EAB308] font-bold px-6 py-2 rounded-md shadow-md hover:bg-emerald-900 hover:text-[#EAB308] dark:hover:bg-[#EAB308] dark:hover:text-emerald-900 transition"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

/** Step 5: collapsible summary of every step, then "Submit". */
const ReviewStep = ({ explanation, formData, onEditStep }) => {
  const [open, setOpen] = useState({
    applicationType: true,
    businessDetails: true,
    businessActivity: true,
    advertDetails: true,
    contacts: true,
  });
  const [showModal, setShowModal] = useState(false);
  const section = (key) => ({ open: open[key], onToggle: () => setOpen((o) => ({ ...o, [key]: !o[key] })) });
  const hasAdvert = Object.keys(formData.advertDetails || {}).length > 0;

  return (
    <StepCard title="Review & Submit" explanation={explanation}>
      <ReviewSection title="Application Type" {...section("applicationType")}>
        <div className="mb-2">
          Type: <span className="font-medium">{formData.applicationType || "-"}</span>
        </div>
        <div className="mb-2">
          Business Nature: <span className="font-medium">{formData.businessNature || "-"}</span>
        </div>
      </ReviewSection>
      <ReviewSection title="Business Details" {...section("businessDetails")}>
        <KeyValueList values={formData.businessDetails} />
      </ReviewSection>
      <ReviewSection title="Business Activity" {...section("businessActivity")}>
        <KeyValueList values={formData.businessActivity} />
      </ReviewSection>
      <ReviewSection title="Advert Details" {...section("advertDetails")}>
        {hasAdvert ? (
          <KeyValueList values={formData.advertDetails} />
        ) : (
          <div className="mb-1 italic dark:text-white">No advert details provided.</div>
        )}
      </ReviewSection>
      <ReviewSection title="Contacts" {...section("contacts")}>
        <KeyValueList values={formData.contacts} />
      </ReviewSection>

      <div className="flex justify-end mt-8">
        <button
          className="btn bg-emerald-900 text-[#EAB308] px-8 py-2 rounded-md shadow-md font-bold text-lg"
          onClick={() => setShowModal(true)}
        >
          Submit
        </button>
      </div>
      {showModal && <CompletionModal onClose={() => setShowModal(false)} />}
      <div className="flex flex-wrap gap-2 mt-4">
        {STEPS.map((label, index) => (
          <button
            key={label}
            className="btn btn-xs bg-[#EAB308] text-emerald-900 rounded shadow"
            onClick={() => onEditStep(index)}
            type="button"
          >
            Edit {label}
          </button>
        ))}
      </div>
    </StepCard>
  );
};

export default ReviewStep;
