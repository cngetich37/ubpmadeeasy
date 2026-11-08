import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import Select from "react-select";
import "jspdf-autotable";
import { calculateAdvertFees, matchNumberRange, SIDE_ADVERT_TYPES } from "../lib/fees";
import { api, API_ERROR_MESSAGE } from "../lib/api";
import { readCache, writeCache } from "../lib/cache";
import { SITE_URL } from "../config";
import ErrorBanner from "./ErrorBanner";

const SEARCH_DEBOUNCE_MS = 500;

function CombinedSearch() {
  // Tab state
  const [activeTab, setActiveTab] = useState("business");

  // Common states
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const reportApiError = (error) => {
    console.error(error);
    setApiError(API_ERROR_MESSAGE);
  };

  // Business search states
  const [searchInput, setSearchInput] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessSubCategory, setBusinessSubCategory] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");
  const [industryMessage, setIndustryMessage] = useState("");
  const [businessCategoryMessage, setBusinessCategoryMessage] = useState("");
  const [businessSubCategoryMessage, setBusinessSubCategoryMessage] =
    useState("");
  const [businessActivityMessage, setBusinessActivityMessage] = useState("");
  const [businessOptions, setBusinessOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [labelText, setLabelText] = useState("");
  const ubp = searchParams.get("ubp");

  // Advertisement search states
  const [advertSearchInput, setAdvertSearchInput] = useState("");
  const [advertOptions, setAdvertOptions] = useState([]);
  const [advertisementCategory, setAdvertisementCategory] = useState("");
  const [length, setLength] = useState(1);
  const [width, setWidth] = useState(1);
  const [numberOfSides, setNumberOfSides] = useState(1); // NEW STATE
  const [applicationFee, setApplicationFee] = useState("");
  const [firstThreeMetres, setFirstThreeMetres] = useState("");
  const [firstSquareMetres, setFirstSquareMetres] = useState("");
  const [firstTenSquareMetres, setFirstTenSquareMetres] = useState("");
  const [extraSquareMetres, setExtraSquareMetres] = useState("");
  const [licenceFee, setLicenceFee] = useState("");
  const [licenceFeeN, setLicenceFeeN] = useState("");
  const [perEachperYear, setPerEachperYear] = useState("");
  const advert = searchParams.get("advert");

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#F4F4F4" : "#FFFFFF",
      borderColor: state.isFocused ? "#064E3B" : "#FFD700",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(6, 90, 56, 0.25)"
        : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#064E3B" : "#FFD700",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#495057",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#064E3B" : "#FFFFFF",
      color: state.isFocused ? "#FFD700" : "#495057",
      "&:hover": {
        backgroundColor: state.isFocused ? "#064E3B" : "#F4F4F4",
      },
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? "#064E3B" : "#ADB5BD",
      "&:hover": {
        color: state.isFocused ? "#064E3B" : "#495057",
      },
    }),
  };

  // Business search functions
  const extractLabel = (businessDescription) => {
    if (!businessDescription) return "";

    const match = businessDescription.match(
      /(?:over\s*)?(\d+)(?:\s*[-–—]\s*\d+)?\s+([\w]+)/i
    );

    return match ? `No of ${match[2]}` : "";
  };

  useEffect(() => {
    if (tableData?.financeActs?.length > 0) {
      const firstValidRow = tableData.financeActs.find(
        (row) => row.businessDescription
      );
      if (firstValidRow) {
        setLabelText(extractLabel(firstValidRow.businessDescription));
      }
    }
  }, [tableData]);

  const applyActivityCodes = (codes) => {
    setIndustry(codes.industry);
    setBusinessCategory(codes.businessCategory);
    setBusinessSubCategory(codes.businessSubCategory);
    setBusinessActivity(codes.businessActivity);
  };

  useEffect(() => {
    if (ubp && !businessOptions.some((option) => option.value === ubp)) {
      setBusinessOptions((prevOptions) => [
        ...prevOptions,
        { value: ubp, label: ubp },
      ]);
    }
  }, [ubp, businessOptions]);

  useEffect(() => {
    if (ubp) {
      setSearchInput(ubp);
    }
  }, [ubp]);

  // Activity name -> classification codes (debounced, cached for a day).
  useEffect(() => {
    if (searchInput === "") {
      clearFields();
      return;
    }
    const cached = readCache(`lookup:${searchInput}`);
    if (cached) {
      applyActivityCodes(cached);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const codes = await api.lookupActivity(searchInput);
        if (cancelled) return;
        applyActivityCodes(codes);
        writeCache(`lookup:${searchInput}`, codes);
        setApiError(null);
      } catch (error) {
        if (!cancelled) reportApiError(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchInput]);

  // Resolve a classification code to its human-readable description.
  // Returns an effect cleanup that ignores responses for an outdated code.
  const loadDescription = (code, fetcher, onResult) => {
    if (code === "") {
      clearFields();
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    fetcher(code)
      .then((response) => !cancelled && onResult(response))
      .catch((error) => !cancelled && reportApiError(error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  };

  useEffect(
    () => loadDescription(industry, api.industry, (r) => setIndustryMessage(r.industry)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the code changes
    [industry]
  );
  useEffect(
    () =>
      loadDescription(businessCategory, api.businessCategory, (r) =>
        setBusinessCategoryMessage(r.businessCategory)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the code changes
    [businessCategory]
  );
  useEffect(
    () =>
      loadDescription(businessSubCategory, api.businessSubCategory, (r) =>
        setBusinessSubCategoryMessage(r.businessSubCategory)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the code changes
    [businessSubCategory]
  );
  // One request gives both the description and the Finance Act fee rows.
  useEffect(
    () =>
      loadDescription(businessActivity, api.businessActivity, (r) => {
        setBusinessActivityMessage(r.businessActivity);
        setTableData(r);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the code changes
    [businessActivity]
  );

  useEffect(() => {
    const loadBusinessOptions = async () => {
      const cached = readCache("businessOptions");
      if (cached) {
        setBusinessOptions(cached);
        return;
      }
      try {
        setLoading(true);
        const optionsData = await api.ubpDictionary();
        const fetchedOptions = optionsData
          .map((item) => ({
            value: item.commonBusinessActivity,
            label: item.commonBusinessActivity,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        writeCache("businessOptions", fetchedOptions);
        setBusinessOptions(fetchedOptions);
      } catch (error) {
        reportApiError(error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessOptions();
  }, []);

  const clearFields = () => {
    setBusinessCategory("");
    setBusinessSubCategory("");
    setBusinessActivity("");
    setIndustryMessage("");
    setBusinessCategoryMessage("");
    setBusinessSubCategoryMessage("");
    setBusinessActivityMessage("");
    setTableData([]);
  };

  // Advertisement search functions
  useEffect(() => {
    const initializeDimensions = (searchInput) => {
      switch (searchInput) {
        case "Directional Signs":
          setLength(1);
          setWidth(1);
          break;
        case "Billboard":
          setLength(3);
          setWidth(1);
          break;
        case "Corporate Flags":
        case "Canvas":
        case "Call In Adverts":
          setLength(1);
          setWidth(1);
          break;
        case "Wallpainting":
        case "Window Branding":
        case "Wall Branding":
          setLength(10);
          setWidth(1);
          break;
        default:
          setLength(1);
          setWidth(1);
          break;
      }
    };

    initializeDimensions(advertSearchInput);
  }, [advertSearchInput]);

  useEffect(() => {
    if (advert && !advertOptions.some((option) => option.value === advert)) {
      setAdvertOptions((prevOptions) => [
        ...prevOptions,
        { value: advert, label: advert },
      ]);
    }
  }, [advert, advertOptions]);

  useEffect(() => {
    if (advert) {
      setAdvertSearchInput(decodeURIComponent(advert));
    }
  }, [advert]);

  // Advert type -> rates (debounced).
  useEffect(() => {
    if (advertSearchInput === "") {
      setAdvertisementCategory("");
      setApplicationFee("");
      setFirstThreeMetres("");
      setFirstSquareMetres("");
      setFirstTenSquareMetres("");
      setExtraSquareMetres("");
      setPerEachperYear("");
      setLicenceFee("");
      setLicenceFeeN("");
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.advert(advertSearchInput);
        if (cancelled) return;
        setAdvertisementCategory(data.advertisementCategory);
        setApplicationFee(data.applicationFee);
        setFirstThreeMetres(data.firstThreeMetres);
        setFirstSquareMetres(data.firstSquareMetres);
        setFirstTenSquareMetres(data.firstTenSquareMetres);
        setExtraSquareMetres(data.extraSquareMetres);
        setPerEachperYear(data.perEachperYear);
        setApiError(null);
      } catch (error) {
        if (!cancelled) reportApiError(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [advertSearchInput]);

  useEffect(() => {
    const loadAdvertOptions = async () => {
      try {
        setLoading(true);
        const optionsData = await api.adverts();
        const fetchedOptions = optionsData
          .map((item) => ({ value: item.advertType, label: item.advertType }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setAdvertOptions(fetchedOptions);
      } catch (error) {
        reportApiError(error);
      } finally {
        setLoading(false);
      }
    };

    loadAdvertOptions();
  }, []);

  useEffect(() => {
    if (!advertSearchInput) {
      setLicenceFee("");
      setLicenceFeeN("");
      return;
    }
    const { renewalFee, newApplicantFee } = calculateAdvertFees(
      advertSearchInput,
      {
        applicationFee,
        firstSquareMetres,
        firstThreeMetres,
        firstTenSquareMetres,
        extraSquareMetres,
        perEachperYear,
      },
      { length, width, numberOfSides }
    );
    setLicenceFee(renewalFee);
    setLicenceFeeN(newApplicantFee);
  }, [
    advertSearchInput,
    length,
    width,
    extraSquareMetres,
    firstSquareMetres,
    firstThreeMetres,
    perEachperYear,
    firstTenSquareMetres,
    applicationFee,
    numberOfSides,
  ]);

  // Common functions
  const closeModal = () => {
    setIsModalOpen(false);
    setUploadMessage(null);
  };

  // Business PDF generation
  const shareAsPDF = async (tableData) => {
    if (
      searchInput === "" ||
      industry === "" ||
      businessCategory === "" ||
      businessSubCategory === "" ||
      businessActivity === "" ||
      !tableData
    ) {
      setUploadMessage("Please select a business activity");
      setIsModalOpen(true);
      return;
    } else {
      setUploadMessage(null);
    }

    const pdf = new jsPDF("landscape", "pt", "a5");

    pdf.setFillColor("#FFFFFF");
    pdf.rect(
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight(),
      "F"
    );

    const title = "UBPMadeEasy";
    const titleX = pdf.internal.pageSize.getWidth() / 2;
    const titleY = 50;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const rectHeight = 40;

    pdf.setFillColor("#064E3B");
    pdf.rect(0, titleY - rectHeight / 2, pageWidth, rectHeight, "F");

    pdf.setTextColor("#FFD700");
    pdf.setFont("Times", "bold");
    pdf.text(title, titleX, titleY, { align: "center" });
    pdf.setFontSize(40);

    let currentY = titleY + 50;

    const tableHeaders = ["", ""];
    const tableRows = [
      [`Business: ${searchInput}`, ""],
      ["", ""],
      ["Industry", "Business Category"],
      [
        `${industryMessage} - ${industry}`,
        `${businessCategoryMessage} - ${businessCategory}`,
      ],
      ["", ""],
      ["Business Subcategory", "Business Activity"],
      [
        `${businessSubCategoryMessage} - ${businessSubCategory}`,
        `${businessActivityMessage} - ${businessActivity}`,
      ],
    ];

    pdf.autoTable({
      startY: currentY,
      margin: { top: 20, right: 10, bottom: 20, left: 5 },
      head: [tableHeaders],
      body: tableRows,
      theme: "striped",
      styles: {
        textColor: "#064E3B",
        font: "Times",
        fontSize: 12,
      },
      headStyles: {
        fillColor: "#FFFFFF",
        textColor: "#064E3B",
        fontStyle: "bold",
        fontSize: 14,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 300 },
        1: { cellWidth: 280 },
      },
      didDrawPage: (data) => {
        currentY = data.cursor.y + 30;
      },
    });


    // Add No of ... and value row if both labelText and filterValue are present and filterValue is not empty
    if (labelText && filterValue) {
      const detailsTableWidth = 220;
      const tableStartX = (pageWidth - detailsTableWidth) / 2;
      pdf.autoTable({
        startY: currentY,
        startX: tableStartX,
        margin: { top: 10, right: 10, bottom: 10, left: 5 },
        head: [["Details", "Value"]],
        body: [[
          { content: labelText.replace(/:$/, ""), styles: { fontStyle: 'bold', halign: 'right', cellPadding: 4 } },
          { content: filterValue, styles: { fontStyle: 'normal', halign: 'center', cellPadding: 4 } }
        ]],
        theme: "grid",
        styles: {
          textColor: "#064E3B",
          font: "Times",
          fontSize: 13,
          valign: 'middle',
        },
        headStyles: {
          fillColor: "#FFD700",
          textColor: "#064E3B",
          fontStyle: "bold",
          fontSize: 13,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 110, halign: 'right' },
          1: { cellWidth: 110, halign: 'right' },
        },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 20;
        },
      });
      currentY += 20;
    }
    currentY += 10;

    pdf.setFont("Times", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor("#064E3B");
    pdf.setFillColor("#FFFFFF");

    currentY += 20;

    const tableHeadersFinance = [
      "Code",
      "Business Description",
      "Trade Licence",
      "Fire Clearance",
      "Food Hygiene",
      "Health Certificate",
      "Pest Control",
      "Total (KES)",
    ];

    const tableRowsFinance = tableData.financeActs.map((row) => {
      const total =
        (parseFloat(row.tradeLicence) || 0) +
        (parseFloat(row.fireClearance) || 0) +
        (parseFloat(row.foodHygiene) || 0) +
        (parseFloat(row.healthCertificate) || 0) +
        (parseFloat(row.pestControl) || 0);

      return [
        row.subCategory,
        row.businessDescription,
        row.tradeLicence,
        row.fireClearance,
        row.foodHygiene,
        row.healthCertificate,
        row.pestControl,
        total.toLocaleString("en-KE", {
          style: "currency",
          currency: "KES",
          minimumFractionDigits: 2,
        }),
      ];
    });

    pdf.autoTable({
      startY: currentY,
      margin: { top: 20, right: 10, bottom: 70, left: 5 },
      head: [tableHeadersFinance],
      body: tableRowsFinance,
      theme: "striped",
      styles: {
        textColor: "#064E3B",
        fillColor: "#FFFFFF",
        font: "Arial",
        fontSize: 10,
      },
      headStyles: {
        fillColor: "#064E3B",
        textColor: "#FFD700",
        fontSize: 12,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 120 },
        2: { cellWidth: 60 },
        3: { cellWidth: 70 },
        4: { cellWidth: 70 },
        5: { cellWidth: 70 },
        6: { cellWidth: 60 },
        7: { cellWidth: 90 },
      },
    });

    const qrCodeURL = `${SITE_URL}/ubp?ubp=${encodeURIComponent(
      searchInput
    )}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeURL, { width: 80 });

    const qrCodeX = pdf.internal.pageSize.getWidth() - 100;
    const qrCodeY = pdf.internal.pageSize.getHeight() - 100;

    pdf.addImage(qrCodeDataUrl, "PNG", qrCodeX, qrCodeY, 80, 80);

    pdf.save("BusinessActivity.pdf");
  };

  // Advertisement PDF generation
  const generatePDF = async () => {
    if (
      advertSearchInput === "" ||
      applicationFee === "" ||
      advertisementCategory === "" ||
      length === "" ||
      width === "" ||
      licenceFee === "" ||
      licenceFeeN === ""
    ) {
      setUploadMessage("Please select an advert type.");
      setIsModalOpen(true);
      return;
    } else {
      setUploadMessage(null);
    }

    const formatCurrency = (amount) => {
      return amount !== 0
        ? parseFloat(amount).toLocaleString("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 2,
          })
        : "";
    };

    const pdfData = {
      applicationFee: formatCurrency(applicationFee),
      advertisementCategory: advertisementCategory || "N/A",
      dimensions: `${length ? length : "N/A"} m × ${width ? width : "N/A"} m`,
      numberOfSides: numberOfSides || 1,
      firstSquareMetres: formatCurrency(firstSquareMetres) || "N/A",
      extraSquareMetres: formatCurrency(extraSquareMetres) || "N/A",
      firstThreeMetres: formatCurrency(firstThreeMetres) || "N/A",
      firstTenSquareMetres: formatCurrency(firstTenSquareMetres) || "N/A",
      licenceFee: formatCurrency(licenceFee) || "N/A",
      licenceFeeN: formatCurrency(licenceFeeN) || "N/A",
    };

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [300, 450],
    });

    const topMargin = 50;
    const leftMargin = 35;
    const titleFontSize = 20;
    const spacing = 5;

    doc.setFontSize(titleFontSize);
    doc.setFont("Times", "Roman");

    doc.setFillColor("#FFFFFF");
    doc.rect(
      0,
      0,
      doc.internal.pageSize.width,
      doc.internal.pageSize.height,
      "F"
    );

    doc.setTextColor("#064E3B");
    doc.text("UBPMadeEasy", leftMargin, topMargin);

    let currentY = topMargin + titleFontSize + spacing;

    const tableHeaders = ["Advert", ""];
    let tableRows = [
      ["Advertisement Category", pdfData.advertisementCategory],
      ["Advert", advertSearchInput || "N/A"],
      ["Application Fee (New Applicant)", pdfData.applicationFee],
      ["Dimensions (Length × Width)", pdfData.dimensions],
      // Only show 'Number of Sides' for SIDE_ADVERT_TYPES (always, even if 1)
      ...(SIDE_ADVERT_TYPES.includes(advertSearchInput)
        ? [["Number of Sides", pdfData.numberOfSides]]
        : []),
      ["First m²", pdfData.firstSquareMetres],
      ["First 3m²", pdfData.firstThreeMetres],
      ["First 10m²", pdfData.firstTenSquareMetres],
      ["Each Extra m²", pdfData.extraSquareMetres],
      ["Licence Fee (Renewal)", pdfData.licenceFee],
      ["Licence Fee (New Applicant)", pdfData.licenceFeeN],
    ];
    // Filter out rows where value is 'N/A' or empty string
    tableRows = tableRows.filter(row => row[1] !== 'N/A' && row[1] !== '' && row[1] !== undefined);

    const columnWidths = [150, 120];
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const pageWidth = doc.internal.pageSize.width;
    const tableStartX = (pageWidth - tableWidth) / 2;

    doc.autoTable({
      startY: currentY,
      startX: tableStartX,
      margin: { top: 10, right: 10, bottom: 40, left: 30 },
      head: [tableHeaders],
      body: tableRows,
      theme: "striped",
      styles: {
        textColor: "#064E3B",
        font: "Arial",
        fontStyle: "normal",
        fontSize: 10,
      },
      headStyles: {
        fillColor: "#FFFFFF",
        textColor: "#FFFFFF",
        fontStyle: "bold",
        fontSize: 12,
      },
      columnStyles: {
        0: { cellWidth: 150 },
        1: { cellWidth: 150 },
      },
    });

    const qrCodeURL = `${SITE_URL}/ubp?advert=${encodeURIComponent(
      advertSearchInput
    )}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeURL, { width: 80 });

    const qrCodeX = doc.internal.pageSize.getWidth() - 100;
    const qrCodeY = doc.internal.pageSize.getHeight() - 100;

    doc.addImage(qrCodeDataUrl, "PNG", qrCodeX, qrCodeY, 80, 80);

    doc.save("Advert.pdf");
  };

  useEffect(() => {
    // Reset numberOfSides to 1 if advert type does not require sides
    if (!SIDE_ADVERT_TYPES.includes(advertSearchInput)) {
      setNumberOfSides(1);
    }
  }, [advertSearchInput]);

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
            <ErrorBanner message={apiError} onDismiss={() => setApiError(null)} />

            {/* Tab Navigation */}
            <div className="flex justify-center gap-x-2 mb-8">
              <button
                className={`w-1/2 py-3 px-6 font-bold text-lg rounded-full transition-all duration-200 focus:outline-none shadow-md border-2
                  ${
                    activeTab === "business"
                      ? "bg-emerald-900 text-[#FFD700] border-[#FFD700] dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)] dark:border-[var(--color-primary)] scale-105"
                      : "bg-white dark:bg-[var(--color-surface)] text-emerald-900 dark:text-[var(--color-text)] border-emerald-100 dark:border-[var(--color-primary)] hover:bg-[#FFD700]/10 dark:hover:bg-[var(--color-primary)]/10"
                  }
                `}
                onClick={() => setActiveTab("business")}
                aria-selected={activeTab === "business"}
              >
                UBP
              </button>
              <button
                className={`w-1/2 py-3 px-6 font-bold text-lg rounded-full transition-all duration-200 focus:outline-none shadow-md border-2
                  ${
                    activeTab === "advertisement"
                      ? "bg-emerald-900 text-[#FFD700] border-[#FFD700] dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)] dark:border-[var(--color-primary)] scale-105"
                      : "bg-white dark:bg-[var(--color-surface)] text-emerald-900 dark:text-[var(--color-text)] border-emerald-100 dark:border-[var(--color-primary)] hover:bg-[#FFD700]/10 dark:hover:bg-[var(--color-primary)]/10"
                  }
                `}
                onClick={() => setActiveTab("advertisement")}
                aria-selected={activeTab === "advertisement"}
              >
                Advert
              </button>
            </div>

            {/* Business Activity Tab */}
            {activeTab === "business" && (
              <>
                <header>
                  <h1 className="text-3xl font-extrabold text-center text-emerald-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
                    Business Activity Information
                  </h1>
                </header>

                <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                  <div className="w-full md:w-2/3">
                    <Select
                      options={businessOptions}
                      onChange={(selectedOption) =>
                        setSearchInput(selectedOption.value)
                      }
                      value={businessOptions.find(
                        (option) => option.value === searchInput
                      )}
                      className="w-full"
                      styles={customStyles}
                      isSearchable={true}
                      placeholder="Search a business activity"
                      aria-label="Select a business activity"
                    />
                  </div>
                  <span>
                    {loading ? (
                      <div className="flex items-center">
                        <div
                          className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FFD700] mr-2"
                          role="status"
                        />
                        <span className="text-emerald-900 font-bold ml-1">
                          Loading...
                        </span>
                      </div>
                    ) : null}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={`${industry}`}
                      readOnly
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                    {industry !== "" && industryMessage && (
                      <p className="text-xs text-emerald-900 dark:text-white mt-1">
                        {industryMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Business Category
                    </label>
                    <input
                      type="text"
                      value={`${businessCategory}`}
                      readOnly
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                    {businessCategory !== "" && businessCategoryMessage && (
                      <p className="text-xs text-emerald-900 dark:text-white mt-1">
                        {businessCategoryMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Business Sub category
                    </label>
                    <input
                      type="text"
                      value={`${businessSubCategory}`}
                      readOnly
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                    {businessSubCategory !== "" &&
                      businessSubCategoryMessage && (
                        <p className="text-xs text-emerald-900 dark:text-white mt-1">
                          {businessSubCategoryMessage}
                        </p>
                      )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Business Activity
                    </label>
                    <input
                      type="text"
                      value={`${businessActivity}`}
                      readOnly
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                    {businessActivity !== "" && businessActivityMessage && (
                      <p className="text-xs text-emerald-900 dark:text-white mt-1">
                        {businessActivityMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full overflow-x-auto mt-8">
                  <div className="mb-4">
                    <label
                      htmlFor="businessDescriptionFilter"
                      className="block text-base font-semibold text-emerald-900 dark:text-white mb-2"
                    >
                      {labelText
                        .replace(/Hospitals/g, "beds")
                        .replace(/\bsq\b/g, "sq.m")}
                    </label>
                    <input
                      type="text"
                      id="businessDescriptionFilter"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="bg-white border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition w-full md:w-1/3"
                    />
                  </div>
                  <div className="rounded-xl shadow overflow-hidden w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#FFD700]">
                      <thead className="bg-emerald-900 text-[#FFD700] sticky top-0 z-10">
                        <tr>
                          {[
                            "Business Description",
                            "Trade Licence",
                            "Fire Clearance",
                            "Food Hygiene",
                            "Health Certificate",
                            "Pest Control",
                            "Total",
                          ].map((header, index) => (
                            <th
                              key={index}
                              className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-b-2 border-[#FFD700]"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-black">
                        {(() => {
                          // Filter and deduplicate rows as in the table
                          const filteredRows = tableData?.financeActs
                            ?.filter((row) => {
                              if (!filterValue) return true;
                              const inputNumber = parseInt(filterValue);
                              return (
                                !isNaN(inputNumber) &&
                                matchNumberRange(
                                  row.businessDescription,
                                  inputNumber
                                )
                              );
                            })
                            .reduce((uniqueRows, row) => {
                              if (
                                !uniqueRows.some(
                                  (uniqueRow) =>
                                    uniqueRow.businessDescription ===
                                    row.businessDescription
                                )
                              ) {
                                uniqueRows.push(row);
                              }
                              return uniqueRows;
                            }, []);


                          return (
                            <>
                              {filteredRows?.map((row, index) => {
                                const rowTotal =
                                  (parseInt(row.tradeLicence) || 0) +
                                  (parseInt(row.fireClearance) || 0) +
                                  (parseInt(row.foodHygiene) || 0) +
                                  (parseInt(row.healthCertificate) || 0) +
                                  (parseInt(row.pestControl) || 0);
                                return (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-gray-50 hover:bg-yellow-50 transition"
                                        : "bg-white hover:bg-yellow-50 transition"
                                    }
                                  >
                                    <td className="px-4 py-2 whitespace-nowrap font-medium">
                                      {row.businessDescription}
                                    </td>
                                    {["tradeLicence", "fireClearance", "foodHygiene", "healthCertificate", "pestControl"].map((key, i) => (
                                      <td key={i} className="px-4 py-2 whitespace-nowrap">
                                        {!isNaN(parseInt(row[key]))
                                          ? parseInt(row[key]).toLocaleString("en-KE", {
                                              style: "currency",
                                              currency: "KES",
                                              minimumFractionDigits: 2,
                                            })
                                          : "KES 0.00"}
                                      </td>
                                    ))}
                                    <td className="px-4 py-2 whitespace-nowrap font-semibold text-emerald-900">
                                      {rowTotal.toLocaleString("en-KE", {
                                        style: "currency",
                                        currency: "KES",
                                        minimumFractionDigits: 2,
                                      })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      // Filter the data as in the table before generating PDF
                      const filteredRows = tableData?.financeActs
                        ?.filter((row) => {
                          if (!filterValue) return true;
                          const inputNumber = parseInt(filterValue);
                          return (
                            !isNaN(inputNumber) &&
                            matchNumberRange(
                              row.businessDescription,
                              inputNumber
                            )
                          );
                        })
                        .reduce((uniqueRows, row) => {
                          if (
                            !uniqueRows.some(
                              (uniqueRow) =>
                                uniqueRow.businessDescription ===
                                row.businessDescription
                            )
                          ) {
                            uniqueRows.push(row);
                          }
                          return uniqueRows;
                        }, []);
                      // Call shareAsPDF with filteredRows
                      shareAsPDF({ ...tableData, financeActs: filteredRows });
                    }}
                    className="bg-emerald-900 text-[#FFD700] font-bold py-2 px-6 rounded-full shadow-lg hover:bg-emerald-800 hover:text-yellow-300 transition mb-8"
                  >
                    Download PDF
                  </button>
                </div>
              </>
            )}

            {/* Advertisement Tab */}
            {activeTab === "advertisement" && (
              <>
                <header>
                  <h1 className="text-3xl font-extrabold text-center text-emerald-900 dark:text-white mb-6 tracking-tight drop-shadow-sm">
                    Advert Small Formats
                  </h1>
                </header>
                <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                  <div className="w-full md:w-2/3">
                    <Select
                      options={advertOptions}
                      onChange={(selectedOption) =>
                        setAdvertSearchInput(selectedOption.value)
                      }
                      value={advertOptions.find(
                        (option) => option.value === advertSearchInput
                      )}
                      className="w-full"
                      styles={customStyles}
                      isSearchable={true}
                      placeholder="Search advert"
                      aria-label="Search advert"
                    />
                  </div>
                  <span>
                    {loading ? (
                      <div className="flex items-center">
                        <div
                          className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#FFD700] mr-2"
                          role="status"
                        />
                        <span className="text-emerald-900 font-bold ml-1">
                          Loading...
                        </span>
                      </div>
                    ) : null}
                  </span>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Advertisement Category
                    </label>
                    <input
                      type="text"
                      value={advertisementCategory}
                      readOnly
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                  </div>
                  <div
                    className={`flex flex-col gap-1 ${
                      applicationFee === 0 ? "hidden" : ""
                    }`}
                  >
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Application Fee (New Applicant)
                    </label>
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
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Length (m)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        pattern="[0-9]*"
                        value={length}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            setLength(value);
                          } else if (e.target.value === "") {
                            setLength("");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp") {
                            setLength((prevLength) => prevLength + 1);
                          } else if (e.key === "ArrowDown") {
                            if (width > 0) {
                              setLength((prevLength) => prevLength - 1);
                            }
                          } else if (e.key === "Backspace") {
                            setLength("");
                          }
                        }}
                        className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition w-full"
                      />
                      <div className="absolute top-2 right-2 bottom-2 flex flex-col">
                        <div className="flex justify-center w-full">
                          <kbd
                            className="px-1 py-0 rounded-md cursor-pointer text-xs text-[#FFD700] bg-emerald-900"
                            onClick={() =>
                              setLength((prevLength) => prevLength + 1)
                            }
                          >
                            ▲
                          </kbd>
                        </div>
                        <div className="flex justify-center w-full">
                          <kbd
                            className="px-1 py-0 rounded-md cursor-pointer text-xs text-[#FFD700] bg-emerald-900"
                            onClick={() => {
                              if (length > 0) {
                                setLength((prevLength) => prevLength - 1);
                              }
                            }}
                          >
                            ▼
                          </kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Width (m)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        pattern="[0-9]*"
                        value={width}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            setWidth(value);
                          } else if (e.target.value === "") {
                            setWidth("");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp") {
                            setWidth((prevWidth) => prevWidth + 1);
                          } else if (e.key === "ArrowDown") {
                            if (width > 0) {
                              setWidth((prevWidth) => prevWidth - 1);
                            }
                          } else if (e.key === "Backspace") {
                            setWidth("");
                          }
                        }}
                        className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition w-full"
                      />
                      <div className="absolute top-2 right-2 bottom-2 flex flex-col">
                        <div className="flex justify-center w-full mt-0">
                          <kbd
                            className="px-1 py-0 rounded-md cursor-pointer text-xs text-[#FFD700] bg-emerald-900"
                            onClick={() =>
                              setWidth((prevWidth) => prevWidth + 1)
                            }
                          >
                            ▲
                          </kbd>
                        </div>
                        <div className="flex justify-center w-full">
                          <kbd
                            className="px-1 py-0 rounded-md cursor-pointer text-xs text-[#FFD700] bg-emerald-900"
                            onClick={() => {
                              if (width > 0) {
                                setWidth((prevWidth) => prevWidth - 1);
                              }
                            }}
                          >
                            ▼
                          </kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                  {advertSearchInput !== "" && (
                    <>
                      <div
                        className={`flex flex-col gap-1 ${
                          firstSquareMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                          First m²
                        </label>
                        <input
                          type="text"
                          value={
                            !isNaN(parseFloat(firstSquareMetres))
                              ? parseFloat(firstSquareMetres).toLocaleString(
                                  "en-KE",
                                  {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  }
                                )
                              : ""
                          }
                          readOnly
                          className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                        />
                      </div>
                      <div
                        className={`flex flex-col gap-1 ${
                          extraSquareMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                          Each Extra m²
                        </label>
                        <input
                          type="text"
                          value={
                            !isNaN(parseFloat(extraSquareMetres))
                              ? parseFloat(extraSquareMetres).toLocaleString(
                                  "en-KE",
                                  {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  }
                                )
                              : ""
                          }
                          readOnly
                          className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                        />
                      </div>
                      <div
                        className={`flex flex-col gap-1 ${
                          firstThreeMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                          First 3m²
                        </label>
                        <input
                          type="text"
                          value={
                            !isNaN(parseFloat(firstThreeMetres))
                              ? parseFloat(firstThreeMetres).toLocaleString(
                                  "en-KE",
                                  {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  }
                                )
                              : ""
                          }
                          readOnly
                          className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                        />
                      </div>
                      <div
                        className={`flex flex-col gap-1 ${
                          firstTenSquareMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                          First 10m²
                        </label>
                        <input
                          type="text"
                          value={
                            !isNaN(parseInt(firstTenSquareMetres))
                              ? parseInt(firstTenSquareMetres).toLocaleString(
                                  "en-KE",
                                  {
                                    style: "currency",
                                    currency: "KES",
                                    minimumFractionDigits: 2,
                                  }
                                )
                              : ""
                          }
                          readOnly
                          className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Licence Fee (Renewal)
                    </label>
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
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                      Licence Fee (New Applicant)
                    </label>
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
                      className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition"
                    />
                  </div>
                  {/* Number of Sides field only for certain advert types */}
                  {SIDE_ADVERT_TYPES.includes(advertSearchInput) && (
                    <div className="flex flex-col gap-1">
                      <label className="text-md text-emerald-900 dark:text-white font-semibold mb-1">
                        Number of Sides
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={numberOfSides}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            setNumberOfSides(value);
                          } else if (e.target.value === "") {
                            setNumberOfSides("");
                          }
                        }}
                        className="bg-gray-50 border-2 border-[#FFD700] rounded-lg px-3 py-2 text-black text-base focus:ring-2 focus:ring-emerald-900 focus:border-emerald-900 transition w-full"
                      />
                    </div>
                  )}
                </form>
                <div className="text-emerald-900 dark:text-white mt-2 sm:mt-4 lg:mt-6 max-w-1/2 mx-auto text-center text-base">
                  <span className="font-bold">Important Note:</span> If the {" "}
                  <span className="font-semibold">length</span> and {" "}
                  <span className="font-semibold">width</span> do not change
                  when you press the up and down buttons, it indicates that the
                  advert type carries a {" "}
                  <span className="font-semibold">fixed rate</span>. {" "}
                  <span role="img" aria-label="note">
                    📝
                  </span>
                </div>

                <div className="flex flex-row justify-end mt-6">
                  <button
                    className="bg-emerald-900 text-[#FFD700] font-bold py-2 px-6 rounded-full shadow-lg hover:bg-emerald-800 hover:text-yellow-300 transition"
                    onClick={generatePDF}
                  >
                    Download PDF
                  </button>
                </div>
              </>
            )}

            {/* Common Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white dark:bg-[var(--color-surface)] w-11/12 max-w-md rounded-2xl shadow-2xl p-8 relative border-2 border-[#FFD700] dark:border-[var(--color-primary)]">
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-emerald-900 dark:text-[var(--color-primary)] font-bold text-2xl hover:text-yellow-500 dark:hover:text-yellow-300 transition"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                  <h2 className="text-emerald-900 dark:text-[var(--color-primary)] font-extrabold text-2xl mb-4 text-center">
                    Missing Information
                  </h2>
                  <p className="text-lg text-red-500 dark:text-white text-center font-semibold mb-4">{uploadMessage}</p>
                  <div className="flex justify-center">
                    <button
                      onClick={closeModal}
                      className="bg-emerald-900 dark:bg-[var(--color-primary)] text-[#FFD700] dark:text-[var(--color-bg)] font-bold py-2 px-6 rounded-full shadow hover:bg-emerald-800 dark:hover:bg-yellow-300 hover:text-yellow-300 dark:hover:text-[var(--color-bg)] transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default CombinedSearch;


