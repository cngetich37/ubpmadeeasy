import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useApiError } from "../hooks/useApiError";
import { useBusinessActivity } from "../hooks/useBusinessActivity";
import { useAdvertFees } from "../hooks/useAdvertFees";
import { speak } from "../lib/speech";
import ErrorBanner from "./common/ErrorBanner";
import ApplicationTypeStep from "./tutorial/ApplicationTypeStep";
import FormFieldsStep from "./tutorial/FormFieldsStep";
import BusinessActivityStep from "./tutorial/BusinessActivityStep";
import ReviewStep from "./tutorial/ReviewStep";
import {
  activityErrors as getActivityErrors,
  advertErrors as getAdvertErrors,
  BUSINESS_DETAIL_FIELDS,
  CONTACT_FIELDS,
  EMPTY_FORM,
  requiredErrors,
  STEP_EXPLANATIONS,
  STEPS,
} from "./tutorial/tutorialConfig";

const BUSINESS_DETAILS_STEP = 1;
const ACTIVITY_STEP = 2;
const CONTACTS_STEP = 3;

/** /tutorial: step-by-step walkthrough of the NairobiPay UBP application. */
const UBPTutorial = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showAdvert, setShowAdvert] = useState(false);
  const [errors, setErrors] = useState({});
  const [activityErrors, setActivityErrors] = useState({});
  const [advertErrors, setAdvertErrors] = useState({});
  const { apiError, onError, onSuccess, clearError } = useApiError();

  const business = useBusinessActivity({ onError, onSuccess });
  const advert = useAdvertFees({ onError, onSuccess });
  const { searchInput, codes } = business;
  const { advertType, rates, length, width, numberOfSides, renewalFee, newApplicantFee } = advert;

  // Clear validation messages once the user changes something.
  useEffect(() => {
    setActivityErrors({});
    setAdvertErrors({});
  }, [activeStep, searchInput, codes, advertType, length, width, numberOfSides, showAdvert]);

  // Mirror the selected activity into the form for the review step.
  useEffect(() => {
    setFormData((f) => ({ ...f, businessActivity: { searchInput, ...codes } }));
  }, [searchInput, codes]);

  // Mirror the advert quote into the form when "Other Services" is ticked.
  useEffect(() => {
    setFormData((f) => ({
      ...f,
      advertDetails: showAdvert
        ? {
            advertSearchInput: advertType,
            advertisementCategory: rates.advertisementCategory,
            length,
            width,
            numberOfSides: advert.isSideType ? numberOfSides : undefined,
            applicationFee: rates.applicationFee,
            firstThreeMetres: rates.firstThreeMetres,
            firstSquareMetres: rates.firstSquareMetres,
            firstTenSquareMetres: rates.firstTenSquareMetres,
            extraSquareMetres: rates.extraSquareMetres,
            licenceFee: renewalFee,
            licenceFeeN: newApplicantFee,
          }
        : {},
    }));
  }, [
    showAdvert,
    advertType,
    advert.isSideType,
    rates.advertisementCategory,
    rates.applicationFee,
    rates.firstThreeMetres,
    rates.firstSquareMetres,
    rates.firstTenSquareMetres,
    rates.extraSquareMetres,
    length,
    width,
    numberOfSides,
    renewalFee,
    newApplicantFee,
  ]);

  // Read each step's explanation aloud when it opens.
  useEffect(() => {
    speak(STEP_EXPLANATIONS[activeStep]);
  }, [activeStep]);

  const validateCurrentStep = () => {
    if (activeStep === BUSINESS_DETAILS_STEP || activeStep === CONTACTS_STEP) {
      const stepErrors =
        activeStep === BUSINESS_DETAILS_STEP
          ? requiredErrors(formData.businessDetails, BUSINESS_DETAIL_FIELDS)
          : requiredErrors(formData.contacts, CONTACT_FIELDS);
      setErrors(stepErrors);
      return Object.keys(stepErrors).length === 0;
    }
    if (activeStep === ACTIVITY_STEP) {
      const activity = getActivityErrors(searchInput, codes);
      const advertIssues = showAdvert ? getAdvertErrors({ advertType, length, width, numberOfSides }) : {};
      setActivityErrors(activity);
      setAdvertErrors(advertIssues);
      return Object.keys(activity).length === 0 && Object.keys(advertIssues).length === 0;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
  };
  const handleBack = () => setActiveStep((step) => Math.max(step - 1, 0));
  const handleRestart = () => {
    setActiveStep(0);
    setFormData(EMPTY_FORM);
  };

  const setSectionField = (section) => (key, value) =>
    setFormData((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));

  const explanation = STEP_EXPLANATIONS[activeStep];
  const steps = [
    <ApplicationTypeStep key="type" explanation={explanation} formData={formData} setFormData={setFormData} />,
    <FormFieldsStep
      key="details"
      title="Business Details"
      explanation={explanation}
      fields={BUSINESS_DETAIL_FIELDS}
      values={formData.businessDetails}
      errors={errors}
      onChange={setSectionField("businessDetails")}
    />,
    <BusinessActivityStep
      key="activity"
      explanation={explanation}
      business={business}
      advert={advert}
      showAdvert={showAdvert}
      onShowAdvertChange={setShowAdvert}
      activityErrors={activityErrors}
      advertErrors={advertErrors}
    />,
    <FormFieldsStep
      key="contacts"
      title="Contacts"
      explanation={explanation}
      fields={CONTACT_FIELDS}
      values={formData.contacts}
      errors={errors}
      onChange={setSectionField("contacts")}
    />,
    <ReviewStep key="review" explanation={explanation} formData={formData} onEditStep={setActiveStep} />,
  ];

  return (
    <div>
      <Helmet>
        <title>UBP Tutorial</title>
        <meta
          name="description"
          content="Step-by-step tutorial for UBP application. Simplified, user-friendly, and interactive."
        />
      </Helmet>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 dark:from-[var(--color-bg)] dark:via-[var(--color-surface)] dark:to-[var(--color-bg)] pt-4 pb-4 px-2">
        <div className="w-11/12 max-w-4xl bg-white dark:bg-[var(--color-surface)] rounded-lg shadow-xl p-6 relative overflow-hidden mb-16 md:w-3/4">
          <header>
            <h1 className="text-emerald-900 dark:text-white text-center text-2xl font-bold mb-6">UBP Tutorial</h1>
          </header>
          <div className="hidden md:block w-full mb-6">
            <ul className="steps w-full">
              {STEPS.map((label, index) => (
                <li key={label} className={`step ${activeStep >= index ? "step-primary" : ""} dark:text-white`}>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="border p-5 rounded shadow w-full min-h-[60vh] overflow-y-auto dark:bg-[var(--color-bg)] dark:border-gray-700">
            <ErrorBanner message={apiError} onDismiss={clearError} />
            {steps[activeStep]}
          </div>
          <div className="flex justify-between mt-6 sticky bottom-0 bg-white dark:bg-[var(--color-surface)] py-4">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="btn bg-[#EAB308] text-emerald-900 disabled:opacity-50 px-6 py-2 rounded-md shadow-md"
              aria-label="Previous step"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <button
                onClick={handleNext}
                disabled={activeStep === STEPS.length - 1}
                className="btn bg-emerald-900 text-[#EAB308] disabled:opacity-50 px-6 py-2 rounded-md shadow-md mr-2"
                aria-label="Next step"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={handleRestart}
                className="btn bg-emerald-900 text-[#EAB308] px-6 py-2 rounded-md shadow-md"
                aria-label="Restart tutorial"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UBPTutorial;
