import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { ChevronLeft, ChevronRight, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import Select from "react-select";
import axios from "axios";

const steps = [
  "Application Type",
  "Business Details",
  "Business Activity",
  "Contacts",
  "Review & Submit",
];

const UBPTutorial = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    applicationType: "",
    businessNature: "",
    businessDetails: {},
    businessActivity: {},
    advertDetails: {},
    contacts: {},
  });

  // Business Activity Search State (from CombinedSearch)
  const [businessOptions, setBusinessOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessSubCategory, setBusinessSubCategory] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [industryMessage, setIndustryMessage] = useState("");
  const [businessCategoryMessage, setBusinessCategoryMessage] = useState("");
  const [businessSubCategoryMessage, setBusinessSubCategoryMessage] = useState("");
  const [businessActivityMessage, setBusinessActivityMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Add after business activity state
  // Advert Details Search State (from CombinedSearch)
  const [advertOptions, setAdvertOptions] = useState([]);
  const [advertSearchInput, setAdvertSearchInput] = useState("");
  const [advertisementCategory, setAdvertisementCategory] = useState("");
  const [length, setLength] = useState(1);
  const [width, setWidth] = useState(1);
  const [numberOfSides, setNumberOfSides] = useState(1);
  const [applicationFee, setApplicationFee] = useState("");
  const [firstThreeMetres, setFirstThreeMetres] = useState("");
  const [firstSquareMetres, setFirstSquareMetres] = useState("");
  const [firstTenSquareMetres, setFirstTenSquareMetres] = useState("");
  const [extraSquareMetres, setExtraSquareMetres] = useState("");
  const [licenceFee, setLicenceFee] = useState("");
  const [licenceFeeN, setLicenceFeeN] = useState("");
  const [sideAdvertTypes] = useState([
    "Above Canopy",
    "Under Canopy",
    "Directional Signs",
    "Billboard",
    "Call In Adverts"
  ]);

  // Add perEachperYear state for advert details
  const [perEachperYear, setPerEachperYear] = useState("");

  // Show Advert checkbox state
  const [showAdvert, setShowAdvert] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  // Add error state for business activity and advert details
  const [activityErrors, setActivityErrors] = useState({});
  const [advertErrors, setAdvertErrors] = useState({});

  // Add modal state
  const [showModal, setShowModal] = useState(false);

  // Add TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Add focus state for each field
  const [focusedField, setFocusedField] = useState("");

  // Helper label messages for each field
  const fieldHelp = {
    businessName: "Enter your official business name as registered.",
    branchName: "Specify the branch name if applicable.",
    subcounty: "Provide the subcounty where your business is located.",
    ward: "Enter the ward for your business location.",
    road: "Type the road or street name for your business.",
    plot: "Provide the plot or land parcel number.",
    building: "Enter the building or trade complex name.",
    floor: "Specify the floor number.",
    unit: "Enter the unit, room, or stall number.",
    businessEmail: "Provide a valid business email address.",
    businessPhone: "Enter your business phone number.",
    postalAddress: "Type your business postal address.",
    postalCode: "Enter the postal code for your business.",
    role: "Specify the contact person's role in the business.",
    nationalId: "Enter the contact person's national ID number.",
    firstName: "Provide the contact person's first name.",
    contactPhone: "Enter the contact person's phone number.",
    contactEmail: "Provide the contact person's email address.",
    // Add more as needed
  };

  // Helper: Validate current step
  const validateStep = () => {
    let stepErrors = {};
    if (activeStep === 1) {
      // Business Details
      const d = formData.businessDetails;
      if (!d?.businessName) stepErrors.businessName = 'Required';
      if (!d?.branchName) stepErrors.branchName = 'Required';
      if (!d?.subcounty) stepErrors.subcounty = 'Required';
      if (!d?.ward) stepErrors.ward = 'Required';
      if (!d?.road) stepErrors.road = 'Required';
      if (!d?.plot) stepErrors.plot = 'Required';
      if (!d?.building) stepErrors.building = 'Required';
      if (!d?.floor) stepErrors.floor = 'Required';
      if (!d?.unit) stepErrors.unit = 'Required';
    } else if (activeStep === 3) {
      // Contacts
      const c = formData.contacts;
      if (!c?.businessEmail) stepErrors.businessEmail = 'Required';
      if (!c?.businessPhone) stepErrors.businessPhone = 'Required';
      if (!c?.postalAddress) stepErrors.postalAddress = 'Required';
      if (!c?.postalCode) stepErrors.postalCode = 'Required';
      if (!c?.role) stepErrors.role = 'Required';
      if (!c?.nationalId) stepErrors.nationalId = 'Required';
      if (!c?.firstName) stepErrors.firstName = 'Required';
      if (!c?.contactPhone) stepErrors.contactPhone = 'Required';
      if (!c?.contactEmail) stepErrors.contactEmail = 'Required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Helper: Validate business activity fields
  const validateBusinessActivity = () => {
    let errors = {};
    if (!searchInput) errors.searchInput = 'Required';
    if (!industry) errors.industry = 'Required';
    if (!businessCategory) errors.businessCategory = 'Required';
    if (!businessSubCategory) errors.businessSubCategory = 'Required';
    if (!businessActivity) errors.businessActivity = 'Required';
    setActivityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper: Validate advert fields (only if showAdvert is true)
  const validateAdvert = () => {
    let errors = {};
    if (!advertSearchInput) errors.advertSearchInput = 'Required';
    if (!length || length <= 0) errors.length = 'Required';
    if (!width || width <= 0) errors.width = 'Required';
    if (sideAdvertTypes.includes(advertSearchInput) && (!numberOfSides || numberOfSides <= 0)) errors.numberOfSides = 'Required';
    setAdvertErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Replace businessOptions fetch logic
  // Business Activity Options Fetch (from CombinedSearch)
  React.useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const cachedOptions = localStorage.getItem("businessOptions");
        if (cachedOptions) {
          setBusinessOptions(JSON.parse(cachedOptions));
          setLoading(false);
          return;
        }
        const response = await fetch(
          "https://effortlessubp-backend.onrender.com/api/naics/ubpdictionary"
        );
        const optionsData = await response.json();
        const fetchedOptions = optionsData.map((item) => ({
          value: item.commonBusinessActivity,
          label: item.commonBusinessActivity,
        }));
        fetchedOptions.sort((a, b) => a.label.localeCompare(b.label));
        localStorage.setItem("businessOptions", JSON.stringify(fetchedOptions));
        setBusinessOptions(fetchedOptions);
      } catch (error) {
        setBusinessOptions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Debounced, cached fetch for business activity details
  const getCachedBusinessActivity = (query) => {
    const cachedData = localStorage.getItem(query);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  };
  const cacheBusinessActivity = (query, data) => {
    localStorage.setItem(query, JSON.stringify(data));
  };
  // Debounce helper
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  // Debounced fetch function
  const debouncedFetchBusinessActivity = React.useRef(
    debounce(async (query) => {
      try {
        setLoading(true);
        const cachedData = getCachedBusinessActivity(query);
        let industryMsg = "";
        let businessCategoryMsg = "";
        let businessSubCategoryMsg = "";
        let businessActivityMsg = "";
        let data;
        if (cachedData) {
          data = cachedData;
        } else {
          const response = await fetch(
            `https://effortlessubp-backend.onrender.com/api/naics/${encodeURIComponent(query)}`
          );
          if (!response.ok) throw new Error('Failed to fetch business activity details');
          data = await response.json();
          cacheBusinessActivity(query, data);
        }
        // Fetch descriptions/messages for each field
        const [industryRes, businessCategoryRes, businessSubCategoryRes, businessActivityRes] = await Promise.all([
          fetch(`https://effortlessubp-backend.onrender.com/api/naics/industry/${encodeURIComponent(data.industry || "")}`),
          fetch(`https://effortlessubp-backend.onrender.com/api/naics/businesscategories/${encodeURIComponent(data.businessCategory || "")}`),
          fetch(`https://effortlessubp-backend.onrender.com/api/naics/businesssubcategories/${encodeURIComponent(data.businessSubCategory || "")}`),
          fetch(`https://effortlessubp-backend.onrender.com/api/naics/businessactivities/${encodeURIComponent(data.businessActivity || "")}`),
        ]);
        const [industryJson, businessCategoryJson, businessSubCategoryJson, businessActivityJson] = await Promise.all([
          industryRes.json(),
          businessCategoryRes.json(),
          businessSubCategoryRes.json(),
          businessActivityRes.json(),
        ]);
        industryMsg = industryJson.industry || "";
        businessCategoryMsg = businessCategoryJson.businessCategory || "";
        businessSubCategoryMsg = businessSubCategoryJson.businessSubCategory || "";
        businessActivityMsg = businessActivityJson.businessActivity || "";
        setIndustry(data.industry || "");
        setBusinessCategory(data.businessCategory || "");
        setBusinessSubCategory(data.businessSubCategory || "");
        setBusinessActivity(data.businessActivity || "");
        setIndustryMessage(industryMsg);
        setBusinessCategoryMessage(businessCategoryMsg);
        setBusinessSubCategoryMessage(businessSubCategoryMsg);
        setBusinessActivityMessage(businessActivityMsg);
        setFormData((f) => ({
          ...f,
          businessActivity: {
            searchInput: query,
            industry: data.industry,
            businessCategory: data.businessCategory,
            businessSubCategory: data.businessSubCategory,
            businessActivity: data.businessActivity,
          },
        }));
        setLoading(false);
        return;
      } catch (e) {
        setIndustry("");
        setBusinessCategory("");
        setBusinessSubCategory("");
        setBusinessActivity("");
        setIndustryMessage("");
        setBusinessCategoryMessage("");
        setBusinessSubCategoryMessage("");
        setBusinessActivityMessage("");
        setFormData((f) => ({ ...f, businessActivity: {} }));
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  // Watch searchInput and fetch details
  React.useEffect(() => {
    if (searchInput !== "") {
      debouncedFetchBusinessActivity(searchInput);
    } else {
      setIndustry("");
      setBusinessCategory("");
      setBusinessSubCategory("");
      setBusinessActivity("");
      setIndustryMessage("");
      setBusinessCategoryMessage("");
      setBusinessSubCategoryMessage("");
      setBusinessActivityMessage("");
      setFormData((f) => ({ ...f, businessActivity: {} }));
    }
    // eslint-disable-next-line
  }, [searchInput]);

  // Fetch advert options (from CombinedSearch)
  React.useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const response = await fetch(
          "https://effortlessubp-backend.onrender.com/api/advert"
        );
        const optionsData = await response.json();
        const fetchedOptions = optionsData.map((item) => ({
          value: item.advertType,
          label: item.advertType,
        }));
        fetchedOptions.sort((a, b) => a.label.localeCompare(b.label));
        setAdvertOptions(fetchedOptions);
      } catch (error) {
        setAdvertOptions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Debounced fetch for advert details (from CombinedSearch)
  const debounceAdvert = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  const debouncedFetchAdvert = React.useRef(
    debounceAdvert(async (query) => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://effortlessubp-backend.onrender.com/api/advert/${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Failed to fetch advert details');
        const data = await response.json();
        setAdvertisementCategory(data.advertisementCategory || "");
        setApplicationFee(data.applicationFee || "");
        setFirstThreeMetres(data.firstThreeMetres || "");
        setFirstSquareMetres(data.firstSquareMetres || "");
        setFirstTenSquareMetres(data.firstTenSquareMetres || "");
        setExtraSquareMetres(data.extraSquareMetres || "");
        setPerEachperYear(data.perEachperYear || "");
        // Calculate licenceFee and licenceFeeN as in CombinedSearch
        let renewalFee = 0;
        let newApplicantFee = 0;
        const advertDimension = length * width;
        if (query === "Directional Signs") {
          renewalFee = 10500;
          newApplicantFee = 10500;
        } else if (query === "Billboard") {
          if (advertDimension < 3) {
            renewalFee = 0;
            newApplicantFee = 0;
          } else if (advertDimension > 3) {
            renewalFee = (advertDimension - 3) * data.extraSquareMetres + data.firstThreeMetres;
            newApplicantFee = (advertDimension - 3) * data.extraSquareMetres + data.firstThreeMetres;
          } else {
            renewalFee = data.firstThreeMetres;
            newApplicantFee = data.firstThreeMetres;
          }
        } else if (query === "Corporate Flags") {
          renewalFee = data.perEachperYear;
          newApplicantFee = data.perEachperYear;
        } else if (query === "Canvas") {
          renewalFee = data.firstSquareMetres;
          newApplicantFee = data.firstSquareMetres;
        } else if (query === "Business Encroachment") {
          if (advertDimension === 1) {
            renewalFee = data.firstSquareMetres;
            newApplicantFee = data.firstSquareMetres;
          } else {
            renewalFee = (advertDimension - 1) * data.firstSquareMetres + data.firstSquareMetres;
            newApplicantFee = (advertDimension - 1) * data.firstSquareMetres + data.firstSquareMetres;
          }
        } else if (query === "Call In Adverts") {
          renewalFee = 18200;
          newApplicantFee = 18200;
        } else if (
          query === "Wallpainting" ||
          query === "Window Branding" ||
          query === "Wall Branding"
        ) {
          if (advertDimension < 10) {
            renewalFee = 0;
            newApplicantFee = 0;
          } else if (advertDimension === 10) {
            renewalFee = data.firstTenSquareMetres;
            newApplicantFee = data.firstTenSquareMetres;
          } else {
            renewalFee = (advertDimension - 10) * data.extraSquareMetres + data.firstTenSquareMetres;
            newApplicantFee = (advertDimension - 10) * data.extraSquareMetres + data.firstTenSquareMetres;
          }
        } else {
          if (advertDimension === 1) {
            renewalFee = data.firstSquareMetres;
            newApplicantFee = data.firstSquareMetres;
          } else if (advertDimension > 1) {
            renewalFee = (advertDimension - 1) * data.extraSquareMetres + data.firstSquareMetres;
            newApplicantFee = (advertDimension - 1) * data.extraSquareMetres + data.firstSquareMetres;
          }
        }
        if (sideAdvertTypes.includes(query)) {
          renewalFee = (parseFloat(renewalFee) || 0) * (numberOfSides || 1);
          newApplicantFee = (parseFloat(newApplicantFee) || 0) * (numberOfSides || 1);
        }
        newApplicantFee += parseFloat(data.applicationFee || 0);
        setLicenceFee(renewalFee);
        setLicenceFeeN(newApplicantFee);
        setFormData((f) => ({
          ...f,
          advertDetails: {
            ...f.advertDetails,
            advertSearchInput: query,
            advertisementCategory: data.advertisementCategory,
            applicationFee: data.applicationFee,
            firstThreeMetres: data.firstThreeMetres,
            firstSquareMetres: data.firstSquareMetres,
            firstTenSquareMetres: data.firstTenSquareMetres,
            extraSquareMetres: data.extraSquareMetres,
            perEachperYear: data.perEachperYear,
            licenceFee: renewalFee,
            licenceFeeN: newApplicantFee,
            length,
            width,
            numberOfSides: sideAdvertTypes.includes(query) ? numberOfSides : undefined,
          },
        }));
      } catch (e) {
        setAdvertisementCategory("");
        setApplicationFee("");
        setFirstThreeMetres("");
        setFirstSquareMetres("");
        setFirstTenSquareMetres("");
        setExtraSquareMetres("");
        setPerEachperYear("");
        setLicenceFee("");
        setLicenceFeeN("");
        setFormData((f) => ({ ...f, advertDetails: {} }));
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  // Watch advertSearchInput and fetch details
  React.useEffect(() => {
    if (advertSearchInput !== "") {
      debouncedFetchAdvert(advertSearchInput);
    } else {
      setAdvertisementCategory("");
      setApplicationFee("");
      setFirstThreeMetres("");
      setFirstSquareMetres("");
      setFirstTenSquareMetres("");
      setExtraSquareMetres("");
      setPerEachperYear("");
      setLicenceFee("");
      setLicenceFeeN("");
      setFormData((f) => ({ ...f, advertDetails: {} }));
    }
    // eslint-disable-next-line
  }, [advertSearchInput, length, width, numberOfSides]);

  // Clear errors when step or relevant state changes
  React.useEffect(() => {
    setActivityErrors({});
    setAdvertErrors({});
  }, [activeStep, searchInput, industry, businessCategory, businessSubCategory, businessActivity, advertSearchInput, length, width, numberOfSides, showAdvert]);

  // Save business activity details to formData
  React.useEffect(() => {
    setFormData((f) => ({
      ...f,
      businessActivity: {
        searchInput,
        industry,
        businessCategory,
        businessSubCategory,
        businessActivity,
      },
    }));
  }, [searchInput, industry, businessCategory, businessSubCategory, businessActivity]);

  // Save advert details to formData only if showAdvert is true
  React.useEffect(() => {
    if (showAdvert) {
      setFormData((f) => ({
        ...f,
        advertDetails: {
          advertSearchInput,
          advertisementCategory,
          length,
          width,
          numberOfSides: sideAdvertTypes.includes(advertSearchInput) ? numberOfSides : undefined,
          applicationFee,
          firstThreeMetres,
          firstSquareMetres,
          firstTenSquareMetres,
          extraSquareMetres,
          licenceFee,
          licenceFeeN,
        },
      }));
    } else {
      setFormData((f) => ({ ...f, advertDetails: {} }));
    }
  }, [showAdvert, advertSearchInput, advertisementCategory, length, width, numberOfSides, applicationFee, firstThreeMetres, firstSquareMetres, firstTenSquareMetres, extraSquareMetres, licenceFee, licenceFeeN, sideAdvertTypes]);

  // Navigation handlers (update handleNext)
  const handleNext = () => {
    if (activeStep === 1 && !validateStep()) return;
    if (activeStep === 2) {
      const validActivity = validateBusinessActivity();
      const validAdvert = showAdvert ? validateAdvert() : true;
      if (!validActivity || !validAdvert) return;
    }
    if (activeStep === 3 && !validateStep()) return;
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const handleRestart = () => {
    setActiveStep(0);
    setFormData({
      applicationType: "",
      businessNature: "",
      businessDetails: {},
      businessActivity: {},
      advertDetails: {},
      contacts: {},
    });
  };

  // Read aloud function (from UBPAgent)
  const handleReadText = (text) => {
    if ("speechSynthesis" in window) {
      let modifiedText = text.replace(/KSH|KES/gi, 'Kenya shillings');
      const utterance = new window.SpeechSynthesisUtterance(modifiedText);
      utterance.lang = "en-US";
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.includes("Female") ||
          voice.name.includes("Zira") ||
          voice.name.includes("Google US English Female")
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Step explanations for TTS
  const stepExplanations = [
    "Welcome to the UBP Tutorial. In this first step, you'll select your application type and business nature. This helps us guide you through the right process for your business.",
    "Now, please enter your business details, such as name, branch, and location. Accurate information ensures your application is processed smoothly.",
    "Next, search and select your business activity. If you need to add an outdoor advertisement or other services, check the box to provide those details. This step ensures you get the correct permits and fees for your business.",
    "Enter your contact details, including business and contact person information. This allows the county to reach you with updates or questions about your application.",
    "Review all your information. If everything looks good, submit the tutorial. You're now ready to apply for your Unified Business Permit on NairobiPay. Thank you for using the UBP Tutorial!"
  ];

  // Read aloud on step change
  React.useEffect(() => {
    if (activeStep >= 0 && activeStep < stepExplanations.length) {
      handleReadText(stepExplanations[activeStep]);
    }
    // eslint-disable-next-line
  }, [activeStep]);

  const [openSections, setOpenSections] = useState({
    applicationType: true,
    businessDetails: true,
    businessActivity: true,
    advertDetails: true,
    contacts: true,
  });
  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Add customStyles for react-select dark mode
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#232b2f' : '#F4F4F4') : (document.documentElement.classList.contains('dark') ? '#182024' : '#FFFFFF'),
      borderColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#FFD700' : '#064E3B') : (document.documentElement.classList.contains('dark') ? '#FFD700' : '#FFD700'),
      boxShadow: state.isFocused
        ? (document.documentElement.classList.contains('dark') ? '0 0 0 0.2rem #FFD70055' : '0 0 0 0.2rem rgba(6, 90, 56, 0.25)')
        : 'none',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#232b2f',
      '&:hover': {
        borderColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#FFD700' : '#064E3B') : (document.documentElement.classList.contains('dark') ? '#FFD700' : '#FFD700'),
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#232b2f',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#FFD700' : '#064E3B') : (document.documentElement.classList.contains('dark') ? '#232b2f' : '#FFFFFF'),
      color: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#232b2f' : '#FFD700') : (document.documentElement.classList.contains('dark') ? '#fff' : '#232b2f'),
      '&:hover': {
        backgroundColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#FFD700' : '#064E3B') : (document.documentElement.classList.contains('dark') ? '#232b2f' : '#F4F4F4'),
        color: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#232b2f' : '#FFD700') : (document.documentElement.classList.contains('dark') ? '#fff' : '#232b2f'),
      },
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#FFD700' : '#064E3B') : (document.documentElement.classList.contains('dark') ? '#fff' : '#ADB5BD'),
      '&:hover': {
        color: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#FFD700' : '#064E3B') : (document.documentElement.classList.contains('dark') ? '#fff' : '#495057'),
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#232b2f' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#232b2f',
    }),
  };

  // Step content renderers
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="p-6 bg-gray-50 dark:bg-[var(--color-bg)] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4">Application Type</h1>
            <p className="text-emerald-900 dark:text-white italic mb-4">{stepExplanations[activeStep]}</p>
            {/* Application type and business nature selection */}
            <div className="mb-4">
              <label className="block text-emerald-900 dark:text-white font-medium mb-2">Application Type</label>
              <select
                className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                value={formData.applicationType}
                onChange={e => setFormData(f => ({ ...f, applicationType: e.target.value }))}
              >
                <option value="">Select...</option>
                <option value="new">New</option>
                <option value="renewal">Renewal</option>
              </select>
            </div>
            <div>
              <label className="block text-emerald-900 dark:text-white font-medium mb-2">Business Nature</label>
              <select
                className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                value={formData.businessNature}
                onChange={e => setFormData(f => ({ ...f, businessNature: e.target.value }))}
              >
                <option value="">Select...</option>
                <option value="registered">Registered/Formal</option>
                <option value="unregistered">Unregistered/Informal</option>
              </select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="p-6 bg-gray-50 dark:bg-[var(--color-bg)] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4">Business Details</h1>
            <p className="text-emerald-900 dark:text-white italic mb-4">{stepExplanations[activeStep]}</p>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                {focusedField === "businessName" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.businessName}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Business Name *</label>
                <input
                  type="text"
                  value={formData.businessDetails.businessName || ''}
                  onFocus={() => setFocusedField("businessName")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, businessName: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.businessName && <span className="text-red-600 text-xs">{errors.businessName}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "branchName" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.branchName}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Branch Name *</label>
                <input
                  type="text"
                  value={formData.businessDetails.branchName || ''}
                  onFocus={() => setFocusedField("branchName")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, branchName: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.branchName && <span className="text-red-600 text-xs">{errors.branchName}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "subcounty" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.subcounty}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Subcounty *</label>
                <input
                  type="text"
                  value={formData.businessDetails.subcounty || ''}
                  onFocus={() => setFocusedField("subcounty")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, subcounty: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.subcounty && <span className="text-red-600 text-xs">{errors.subcounty}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "ward" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.ward}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Ward *</label>
                <input
                  type="text"
                  value={formData.businessDetails.ward || ''}
                  onFocus={() => setFocusedField("ward")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, ward: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.ward && <span className="text-red-600 text-xs">{errors.ward}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "road" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.road}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Road/Street Name *</label>
                <input
                  type="text"
                  value={formData.businessDetails.road || ''}
                  onFocus={() => setFocusedField("road")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, road: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.road && <span className="text-red-600 text-xs">{errors.road}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "plot" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.plot}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Plot/Land Parcel Number *</label>
                <input
                  type="text"
                  value={formData.businessDetails.plot || ''}
                  onFocus={() => setFocusedField("plot")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, plot: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.plot && <span className="text-red-600 text-xs">{errors.plot}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "building" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.building}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Building/Trade Complex Name *</label>
                <input
                  type="text"
                  value={formData.businessDetails.building || ''}
                  onFocus={() => setFocusedField("building")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, building: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.building && <span className="text-red-600 text-xs">{errors.building}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "floor" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.floor}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Floor Number *</label>
                <input
                  type="text"
                  value={formData.businessDetails.floor || ''}
                  onFocus={() => setFocusedField("floor")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, floor: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.floor && <span className="text-red-600 text-xs">{errors.floor}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "unit" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.unit}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Unit/Room/Stall Number *</label>
                <input
                  type="text"
                  value={formData.businessDetails.unit || ''}
                  onFocus={() => setFocusedField("unit")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, businessDetails: { ...f.businessDetails, unit: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.unit && <span className="text-red-600 text-xs">{errors.unit}</span>}
              </div>
            </form>
          </div>
        );
      case 2:
        return (
          <div className="p-6 bg-gray-50 dark:bg-[var(--color-bg)] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4">Business Activity & Advert</h1>
            <p className="text-emerald-900 dark:text-white italic mb-4">{stepExplanations[activeStep]}</p>
            <div className="mb-4">
              <label className="block text-emerald-900 dark:text-white font-medium mb-2">Search Business Activity</label>
              <Select
                options={businessOptions}
                onChange={(selectedOption) => setSearchInput(selectedOption.value)}
                value={businessOptions.find((option) => option.value === searchInput) || null}
                className="md:w-1/2 w-full mb-4"
                isSearchable={true}
                placeholder="Search a business activity"
                aria-label="Select a business activity"
                isLoading={loading}
                styles={customSelectStyles}
              />
              {activityErrors.searchInput && <span className="text-red-600 text-xs">{activityErrors.searchInput}</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-md text-emerald-900 dark:text-white font-medium">Industry</label>
                <input type="text" value={industry} readOnly className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)] text-sm" />
                {activityErrors.industry && <span className="text-red-600 text-xs">{activityErrors.industry}</span>}
                {industry && industryMessage && <p className="text-sm text-emerald-900 dark:text-white">{industryMessage}</p>}
              </div>
              <div className="flex flex-col">
                <label className="text-md text-emerald-900 dark:text-white font-medium">Business Category</label>
                <input type="text" value={businessCategory} readOnly className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)] text-sm" />
                {activityErrors.businessCategory && <span className="text-red-600 text-xs">{activityErrors.businessCategory}</span>}
                {businessCategory && businessCategoryMessage && <p className="text-sm text-emerald-900 dark:text-white">{businessCategoryMessage}</p>}
              </div>
              <div className="flex flex-col">
                <label className="text-md text-emerald-900 dark:text-white font-medium">Business Subcategory</label>
                <input type="text" value={businessSubCategory} readOnly className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)] text-sm" />
                {activityErrors.businessSubCategory && <span className="text-red-600 text-xs">{activityErrors.businessSubCategory}</span>}
                {businessSubCategory && businessSubCategoryMessage && <p className="text-sm text-emerald-900 dark:text-white">{businessSubCategoryMessage}</p>}
              </div>
              <div className="flex flex-col">
                <label className="text-md text-emerald-900 dark:text-white font-medium">Business Activity</label>
                <input type="text" value={businessActivity} readOnly className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)] text-sm" />
                {activityErrors.businessActivity && <span className="text-red-600 text-xs">{activityErrors.businessActivity}</span>}
                {businessActivity && businessActivityMessage && <p className="text-sm text-emerald-900 dark:text-white">{businessActivityMessage}</p>}
              </div>
            </div>
            <div className="mt-6 flex items-center">
              <input
                id="showAdvertCheckbox"
                type="checkbox"
                checked={showAdvert}
                onChange={e => setShowAdvert(e.target.checked)}
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
                    options={advertOptions}
                    onChange={(selectedOption) => setAdvertSearchInput(selectedOption.value)}
                    value={advertOptions.find((option) => option.value === advertSearchInput) || null}
                    className="md:w-1/2 w-full mb-4"
                    isSearchable={true}
                    placeholder="Search advert type"
                    aria-label="Search advert type"
                    isLoading={loading}
                    styles={customSelectStyles}
                  />
                  {advertErrors.advertSearchInput && <span className="text-red-600 text-xs">{advertErrors.advertSearchInput}</span>}
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:mb-0 lg:mb-0 mb-8">
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 dark:text-white font-medium">Advertisement Category</label>
                    <input
                      type="text"
                      value={advertisementCategory}
                      readOnly
                      className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                    />
                  </div>
                  {applicationFee !== "" && (
                    <div className="flex flex-col">
                      <label className="text-md text-emerald-900 dark:text-white font-medium">Application Fee (New Applicant)</label>
                      <input
                        type="text"
                        value={
                          !isNaN(parseFloat(applicationFee))
                            ? parseFloat(applicationFee).toLocaleString("en-KE", {
                                style: "currency",
                                currency: "KES",
                                minimumFractionDigits: 2,
                              })
                            : ""
                        }
                        readOnly
                        className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 dark:text-white font-medium">Length (m) *</label>
                    <input
                      type="number"
                      min={0}
                      value={length}
                      onChange={e => setLength(Number(e.target.value))}
                      className="input input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md w-full"
                    />
                    {advertErrors.length && <span className="text-red-600 text-xs">{advertErrors.length}</span>}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 dark:text-white font-medium">Width (m) *</label>
                    <input
                      type="number"
                      min={0}
                      value={width}
                      onChange={e => setWidth(Number(e.target.value))}
                      className="input input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md w-full"
                    />
                    {advertErrors.width && <span className="text-red-600 text-xs">{advertErrors.width}</span>}
                  </div>
                  {advertSearchInput !== "" && (
                    <>
                      {firstSquareMetres !== "" && (
                        <div className={`flex flex-col ${firstSquareMetres === 0 ? "hidden" : ""}`}>
                          <label className="text-md text-emerald-900 dark:text-white font-medium">First m²</label>
                          <input
                            type="text"
                            value={
                              !isNaN(parseFloat(firstSquareMetres))
                                ? parseFloat(firstSquareMetres).toLocaleString("en-KE", {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  })
                                : ""
                            }
                            readOnly
                            className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                          />
                        </div>
                      )}
                      {extraSquareMetres !== "" && (
                        <div className={`flex flex-col ${extraSquareMetres === 0 ? "hidden" : ""}`}>
                          <label className="text-md text-emerald-900 dark:text-white font-medium">Each Extra m²</label>
                          <input
                            type="text"
                            value={
                              !isNaN(parseFloat(extraSquareMetres))
                                ? parseFloat(extraSquareMetres).toLocaleString("en-KE", {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  })
                                : ""
                            }
                            readOnly
                            className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                          />
                        </div>
                      )}
                      {firstThreeMetres !== "" && (
                        <div className={`flex flex-col ${firstThreeMetres === 0 ? "hidden" : ""}`}>
                          <label className="text-md text-emerald-900 dark:text-white font-medium">First 3m²</label>
                          <input
                            type="text"
                            value={
                              !isNaN(parseFloat(firstThreeMetres))
                                ? parseFloat(firstThreeMetres).toLocaleString("en-KE", {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  })
                                : ""
                            }
                            readOnly
                            className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                          />
                        </div>
                      )}
                      {firstTenSquareMetres !== "" && (
                        <div className={`flex flex-col ${firstTenSquareMetres === 0 ? "hidden" : ""}`}>
                          <label className="text-md text-emerald-900 dark:text-white font-medium">First 10m²</label>
                          <input
                            type="text"
                            value={
                              !isNaN(parseInt(firstTenSquareMetres))
                                ? parseInt(firstTenSquareMetres).toLocaleString("en-KE", {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  })
                                : ""
                            }
                            readOnly
                            className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                          />
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 dark:text-white font-medium">Licence Fee (Renewal)</label>
                    <input
                      type="text"
                      value={
                        !isNaN(parseInt(licenceFee))
                          ? parseInt(licenceFee).toLocaleString("en-KE", {
                              style: "currency",
                              currency: "KES",
                              minimumFractionDigits: 2,
                            })
                          : "Ksh 0.00"
                      }
                      readOnly
                      className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 dark:text-white font-medium">Licence Fee (New Applicant)</label>
                    <input
                      type="text"
                      value={
                        !isNaN(parseInt(licenceFeeN))
                          ? parseInt(licenceFeeN).toLocaleString("en-KE", {
                              style: "currency",
                              currency: "KES",
                              minimumFractionDigits: 2,
                            })
                          : "Ksh 0.00"
                      }
                      readOnly
                      className="input input-bordered input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md"
                    />
                  </div>
                  {/* Number of Sides field only for certain advert types */}
                  {sideAdvertTypes.includes(advertSearchInput) && (
                    <div className="flex flex-col">
                      <label className="text-md text-emerald-900 dark:text-white font-medium">Number of Sides *</label>
                      <input
                        type="number"
                        min={1}
                        value={numberOfSides}
                        onChange={e => setNumberOfSides(Number(e.target.value))}
                        className="input input-success bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md w-full"
                      />
                      {advertErrors.numberOfSides && <span className="text-red-600 text-xs">{advertErrors.numberOfSides}</span>}
                    </div>
                  )}
                </form>
                <div className="text-emerald-900 dark:text-white mt-2 sm:mt-4 lg:mt-6 max-w-1/2 mx-auto">
                  <span className="font-bold">Important Note:</span> If the <span className="font-semibold">length</span> and <span className="font-semibold">width</span> do not change when you press the up and down buttons, it indicates that the advert type carries a <span className="font-semibold">fixed rate</span>. <span role="img" aria-label="note">📝</span>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="p-6 bg-gray-50 dark:bg-[var(--color-bg)] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4">Contacts</h1>
            <p className="text-emerald-900 dark:text-white italic mb-4">{stepExplanations[activeStep]}</p>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                {focusedField === "businessEmail" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.businessEmail}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Business Email *</label>
                <input
                  type="email"
                  value={formData.contacts.businessEmail || ''}
                  onFocus={() => setFocusedField("businessEmail")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, businessEmail: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.businessEmail && <span className="text-red-600 text-xs">{errors.businessEmail}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "businessPhone" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.businessPhone}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Business Phone *</label>
                <input
                  type="text"
                  value={formData.contacts.businessPhone || ''}
                  onFocus={() => setFocusedField("businessPhone")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, businessPhone: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.businessPhone && <span className="text-red-600 text-xs">{errors.businessPhone}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "postalAddress" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.postalAddress}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Postal Address *</label>
                <input
                  type="text"
                  value={formData.contacts.postalAddress || ''}
                  onFocus={() => setFocusedField("postalAddress")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, postalAddress: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.postalAddress && <span className="text-red-600 text-xs">{errors.postalAddress}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "postalCode" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.postalCode}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Postal Code *</label>
                <input
                  type="text"
                  value={formData.contacts.postalCode || ''}
                  onFocus={() => setFocusedField("postalCode")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, postalCode: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.postalCode && <span className="text-red-600 text-xs">{errors.postalCode}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "role" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.role}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Contact Person Role *</label>
                <input
                  type="text"
                  value={formData.contacts.role || ''}
                  onFocus={() => setFocusedField("role")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, role: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.role && <span className="text-red-600 text-xs">{errors.role}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "nationalId" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.nationalId}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">National ID *</label>
                <input
                  type="text"
                  value={formData.contacts.nationalId || ''}
                  onFocus={() => setFocusedField("nationalId")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, nationalId: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.nationalId && <span className="text-red-600 text-xs">{errors.nationalId}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "firstName" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.firstName}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">First Name *</label>
                <input
                  type="text"
                  value={formData.contacts.firstName || ''}
                  onFocus={() => setFocusedField("firstName")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, firstName: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.firstName && <span className="text-red-600 text-xs">{errors.firstName}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "contactPhone" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.contactPhone}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Contact Phone *</label>
                <input
                  type="text"
                  value={formData.contacts.contactPhone || ''}
                  onFocus={() => setFocusedField("contactPhone")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, contactPhone: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.contactPhone && <span className="text-red-600 text-xs">{errors.contactPhone}</span>}
              </div>
              <div className="flex flex-col">
                {focusedField === "contactEmail" && (
                  <span className="text-emerald-900 dark:text-white text-xs mb-1 animate-fade-in">{fieldHelp.contactEmail}</span>
                )}
                <label className="text-md text-emerald-900 dark:text-white font-medium">Contact Email *</label>
                <input
                  type="email"
                  value={formData.contacts.contactEmail || ''}
                  onFocus={() => setFocusedField("contactEmail")}
                  onBlur={() => setFocusedField("")}
                  onChange={e => setFormData(f => ({ ...f, contacts: { ...f.contacts, contactEmail: e.target.value } }))}
                  className="input input-bordered bg-white dark:bg-[var(--color-surface)] text-black dark:text-white p-2 rounded-md border-[#FFD700] dark:border-[var(--color-primary)]"
                />
                {errors.contactEmail && <span className="text-red-600 text-xs">{errors.contactEmail}</span>}
              </div>
            </form>
          </div>
        );
      case 4:
        return (
          <div className="p-6 bg-gray-50 dark:bg-[var(--color-bg)] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4">Review & Submit</h1>
            <p className="text-emerald-900 dark:text-white italic mb-4">{stepExplanations[activeStep]}</p>
            <div className="mb-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 text-left text-lg font-bold focus:outline-none bg-[#FFD700] text-emerald-900 dark:text-[var(--color-bg)] transition-all duration-300"
                onClick={() => toggleSection('applicationType')}
              >
                Application Type
                {openSections.applicationType ? <ChevronUp className="text-emerald-900" /> : <ChevronDown className="text-emerald-900" />}
              </button>
              {openSections.applicationType && (
                <div className="bg-gray-50 dark:bg-[var(--color-bg)] p-4 text-emerald-900 dark:text-white">
                  <div className="mb-2">Type: <span className="font-medium">{formData.applicationType || '-'}</span></div>
                  <div className="mb-2">Business Nature: <span className="font-medium">{formData.businessNature || '-'}</span></div>
                </div>
              )}
            </div>
            <div className="mb-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 text-left text-lg font-bold focus:outline-none bg-[#FFD700] text-emerald-900 dark:text-[var(--color-bg)] transition-all duration-300"
                onClick={() => toggleSection('businessDetails')}
              >
                Business Details
                {openSections.businessDetails ? <ChevronUp className="text-emerald-900" /> : <ChevronDown className="text-emerald-900" />}
              </button>
              {openSections.businessDetails && (
                <div className="bg-gray-50 dark:bg-[var(--color-bg)] p-4 text-emerald-900 dark:text-white">
                  {Object.entries(formData.businessDetails || {}).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: <span className="font-medium">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 text-left text-lg font-bold focus:outline-none bg-[#FFD700] text-emerald-900 dark:text-[var(--color-bg)] transition-all duration-300"
                onClick={() => toggleSection('businessActivity')}
              >
                Business Activity
                {openSections.businessActivity ? <ChevronUp className="text-emerald-900" /> : <ChevronDown className="text-emerald-900" />}
              </button>
              {openSections.businessActivity && (
                <div className="bg-gray-50 dark:bg-[var(--color-bg)] p-4 text-emerald-900 dark:text-white">
                  {Object.entries(formData.businessActivity || {}).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: <span className="font-medium">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 text-left text-lg font-bold focus:outline-none bg-[#FFD700] text-emerald-900 dark:text-[var(--color-bg)] transition-all duration-300"
                onClick={() => toggleSection('advertDetails')}
              >
                Advert Details
                {openSections.advertDetails ? <ChevronUp className="text-emerald-900" /> : <ChevronDown className="text-emerald-900" />}
              </button>
              {openSections.advertDetails && (
                <div className="bg-gray-50 dark:bg-[var(--color-bg)] p-4 text-emerald-900 dark:text-white">
                  {Object.keys(formData.advertDetails || {}).length > 0 ? (
                    Object.entries(formData.advertDetails || {}).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: <span className="font-medium">{value || '-'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="mb-1 italic dark:text-white">No advert details provided.</div>
                  )}
                </div>
              )}
            </div>
            <div className="mb-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 text-left text-lg font-bold focus:outline-none bg-[#FFD700] text-emerald-900 dark:text-[var(--color-bg)] transition-all duration-300"
                onClick={() => toggleSection('contacts')}
              >
                Contacts
                {openSections.contacts ? <ChevronUp className="text-emerald-900" /> : <ChevronDown className="text-emerald-900" />}
              </button>
              {openSections.contacts && (
                <div className="bg-gray-50 dark:bg-[var(--color-bg)] p-4 text-emerald-900 dark:text-white">
                  {Object.entries(formData.contacts || {}).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: <span className="font-medium">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-8">
              <button
                className="btn bg-emerald-900 text-[#EAB308] px-8 py-2 rounded-md shadow-md font-bold text-lg"
                onClick={() => setShowModal(true)}
              >
                Submit
              </button>
            </div>
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white dark:bg-[var(--color-surface)] w-11/12 max-w-md rounded-lg shadow-lg p-8 border-4 border-[#EAB308] dark:border-[var(--color-primary)] relative flex flex-col items-center">
                  <h2 className="text-2xl font-bold text-emerald-900 dark:text-white mb-4 text-center">Tutorial Complete!</h2>
                  <p className="text-lg text-emerald-900 dark:text-white mb-6 text-center">
                    The tutorial is complete.<br />
                    Head over to <a href="https://nairobiservices.go.ke/" target="_blank" rel="noopener noreferrer" className="text-[#EAB308] underline font-semibold dark:text-[var(--color-primary)]">NairobiPay</a> to apply for Unified Business Permit.<br />
                    <span className="block mt-2">Thank you!</span>
                  </p>
                  <button
                    className="btn bg-[#EAB308] text-emerald-900 dark:bg-emerald-900 dark:text-[#EAB308] font-bold px-6 py-2 rounded-md shadow-md hover:bg-emerald-900 hover:text-[#EAB308] dark:hover:bg-[#EAB308] dark:hover:text-emerald-900 transition"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {steps.slice(0, 5).map((label, idx) => (
                <button
                  key={label}
                  className="btn btn-xs bg-[#EAB308] text-emerald-900 rounded shadow"
                  onClick={() => setActiveStep(idx)}
                  type="button"
                >
                  Edit {label}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Helmet>
        <title>UBP Tutorial</title>
        <meta name="description" content="Step-by-step tutorial for UBP application. Simplified, user-friendly, and interactive." />
      </Helmet>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 dark:from-[var(--color-bg)] dark:via-[var(--color-surface)] dark:to-[var(--color-bg)] pt-4 pb-4 px-2">
        <div className="w-11/12 max-w-4xl bg-white dark:bg-[var(--color-surface)] rounded-lg shadow-xl p-6 relative overflow-hidden mb-16 md:w-3/4">
          <header>
            <h1 className="text-emerald-900 dark:text-white text-center text-2xl font-bold mb-6">UBP Tutorial</h1>
          </header>
          <div className="hidden md:block w-full mb-6">
            <ul className="steps w-full">
              {steps.map((label, index) => (
                <li
                  key={index}
                  className={`step ${activeStep >= index ? "step-primary" : ""} dark:text-white`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="border p-5 rounded shadow w-full min-h-[60vh] overflow-y-auto dark:bg-[var(--color-bg)] dark:border-gray-700">
            {renderStep()}
          </div>
          <div className="flex justify-between mt-6 sticky bottom-0 bg-white dark:bg-[var(--color-surface)] py-4">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="btn bg-[#EAB308] text-emerald-900 disabled:opacity-50 px-6 py-2 rounded-md shadow-md"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <button
                onClick={handleNext}
                disabled={activeStep === steps.length - 1}
                className="btn bg-emerald-900 text-[#EAB308] disabled:opacity-50 px-6 py-2 rounded-md shadow-md mr-2"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={handleRestart}
                className="btn bg-emerald-900 text-[#EAB308] px-6 py-2 rounded-md shadow-md"
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