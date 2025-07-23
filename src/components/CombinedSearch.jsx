import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import Select from "react-select";
import "jspdf-autotable";
import axios from "axios";

function CombinedSearch() {
  // Tab state
  const [activeTab, setActiveTab] = useState("business");

  // Common states
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const apiUrl = "https://effortlessubp-backend.onrender.com";
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [data, setData] = useState(null);

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
  const [selectedRow, setSelectedRow] = useState(null);
  const [labelText, setLabelText] = useState("");
  const ubp = searchParams.get("ubp");

  // Advertisement search states
  const [advertSearchInput, setAdvertSearchInput] = useState("");
  const [advertOptions, setAdvertOptions] = useState([]);
  const [advertisementCategory, setAdvertisementCategory] = useState("");
  const [length, setLength] = useState(1);
  const [width, setWidth] = useState(1);
  const [numberOfSides, setNumberOfSides] = useState(1); // NEW STATE
  const sideAdvertTypes = [
    "Above Canopy",
    "Under Canopy",
    "Directional Signs",
    "Billboard",
    "Call In Adverts"
  ];
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

  const getCachedResults = (query) => {
    const cachedData = localStorage.getItem(query);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  };

  const cacheResults = (query, data) => {
    localStorage.setItem(query, JSON.stringify(data));
  };

  useEffect(() => {
    if (ubp && !businessOptions.some((option) => option.value === ubp)) {
      setBusinessOptions((prevOptions) => [
        ...prevOptions,
        { value: ubp, label: ubp },
      ]);
    }
    const cachedData = getCachedResults(ubp);
    if (cachedData) {
      setIndustry(cachedData.industry);
      setBusinessCategory(cachedData.businessCategory);
      setBusinessSubCategory(cachedData.businessSubCategory);
      setBusinessActivity(cachedData.businessActivity);
    }
  }, [ubp, businessOptions]);

  useEffect(() => {
    if (ubp) {
      setSearchInput(ubp);
    }
  }, [ubp]);

  useEffect(() => {
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

    const fetchData = async (query) => {
      try {
        setLoading(true);
        const cachedData = getCachedResults(query);
        if (cachedData) {
          setIndustry(cachedData.industry);
          setBusinessCategory(cachedData.businessCategory);
          setBusinessSubCategory(cachedData.businessSubCategory);
          setBusinessActivity(cachedData.businessActivity);
          setLoading(false);
          return;
        }
        const response = await fetch(
          `https://effortlessubp-backend.onrender.com/api/naics/${encodeURIComponent(
            query
          )}`
        );
        if (!response.ok) {
          throw new Error(" ");
        }
        const data = await response.json();
        setIndustry(data.industry);
        setBusinessCategory(data.businessCategory);
        setBusinessSubCategory(data.businessSubCategory);
        setBusinessActivity(data.businessActivity);
        cacheResults(query, data);
      } catch (error) {
        console.log("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetchData = debounce(fetchData, 500);

    if (searchInput !== "") {
      debouncedFetchData(searchInput);
    } else {
      clearFields();
    }
  }, [searchInput]);

  useEffect(() => {
    if (industry !== "") {
      fetchDataByIndustry();
    } else {
      clearFields();
    }
  }, [industry]);

  useEffect(() => {
    if (businessCategory !== "") {
      fetchDataByBusinessCategory();
    } else {
      clearFields();
    }
  }, [businessCategory]);

  useEffect(() => {
    if (businessSubCategory !== "") {
      fetchDataByBusinessSubCategory();
    } else {
      clearFields();
    }
  }, [businessSubCategory]);

  useEffect(() => {
    if (businessActivity !== "") {
      fetchDataByBusinessActivity();
    } else {
      clearFields();
    }
  }, [businessActivity]);

  const fetchDataByIndustry = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://effortlessubp-backend.onrender.com/api/naics/industry/${industry}`
      );
      const industryResponse = await response.json();
      setIndustryMessage(industryResponse.industry);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataByBusinessCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://effortlessubp-backend.onrender.com/api/naics/businesscategories/${businessCategory}`
      );
      const businessCategoryResponse = await response.json();
      setBusinessCategoryMessage(businessCategoryResponse.businessCategory);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataByBusinessSubCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://effortlessubp-backend.onrender.com/api/naics/businesssubcategories/${businessSubCategory}`
      );
      const businessSubCategoryResponse = await response.json();
      setBusinessSubCategoryMessage(
        businessSubCategoryResponse.businessSubCategory
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataByBusinessActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://effortlessubp-backend.onrender.com/api/naics/businessactivities/${businessActivity}`
      );
      const businessActivityResponse = await response.json();
      setBusinessActivityMessage(businessActivityResponse.businessActivity);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDataByOptions = async () => {
      try {
        setLoading(true);

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

        fetchedOptions.sort((a, b) => {
          return a.label.localeCompare(b.label);
        });

        localStorage.setItem("businessOptions", JSON.stringify(fetchedOptions));

        setBusinessOptions(fetchedOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataByOptions();
  }, []);

  const clearFields = () => {
    setBusinessCategory("");
    setBusinessSubCategory("");
    setBusinessActivity("");
    setIndustryMessage("");
    setBusinessCategoryMessage("");
    setBusinessSubCategoryMessage("");
    setBusinessActivityMessage("");
  };

  const fetchTableData = async () => {
    try {
      const response = await fetch(
        `https://effortlessubp-backend.onrender.com/api/naics/businessactivities/${businessActivity}`
      );
      if (!response.ok) {
        throw new Error("Unable to fetch table data");
      }
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [businessActivity]);

  const matchNumberRange = (description, input) => {
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
      const upperBound = parseInt(upToMatch[2], 10);
      return input >= 1 && input <= upperBound;
    }

    const aboveMatch = cleanedDescription.match(/\babove\s+(\d+)/);
    if (aboveMatch) {
      const lowerBound = parseInt(aboveMatch[1], 10);
      return input > lowerBound;
    }

    const lessThanMatch = cleanedDescription.match(/\bless\s+than\s+(\d+)/i);
    if (lessThanMatch) {
      const upperBound = parseInt(lessThanMatch[1], 10);
      return input >= 1 && input < upperBound;
    }

    const toMatch = cleanedDescription.match(/\bto\s+(\d+)/);
    if (toMatch) {
      const upperBound = parseInt(toMatch[1], 10);
      return input >= 2 && input <= upperBound;
    }

    const vehicleMatch = cleanedDescription.match(
      /(?:with|without)\s+(\d+)\s+vehicle/
    );
    if (vehicleMatch) {
      const vehicleCount = parseInt(vehicleMatch[1], 10);
      if (input === vehicleCount) {
        return true;
      }
    }

    const overMatch = cleanedDescription.match(/\bover\s+(\d+)/);
    if (overMatch) {
      const lowerBound = parseInt(overMatch[1], 10);
      return input > lowerBound;
    }

    return false;
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

  useEffect(() => {
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

    const fetchData = async (query) => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://effortlessubp-backend.onrender.com/api/advert/${encodeURIComponent(
            query
          )}`
        );
        if (!response.ok) {
          throw new Error(" ");
        }
        const data = await response.json();
        setAdvertisementCategory(data.advertisementCategory);
        setApplicationFee(data.applicationFee);
        setFirstThreeMetres(data.firstThreeMetres);
        setFirstSquareMetres(data.firstSquareMetres);
        setFirstTenSquareMetres(data.firstTenSquareMetres);
        setExtraSquareMetres(data.extraSquareMetres);
        setPerEachperYear(data.perEachperYear);
      } catch (error) {
        console.log("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetchData = debounce(fetchData, 500);

    if (advertSearchInput !== "") {
      debouncedFetchData(advertSearchInput);
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
    }
  }, [advertSearchInput]);

  useEffect(() => {
    const fetchDataByOptions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://effortlessubp-backend.onrender.com/api/advert"
        );
        const optionsData = await response.json();

        const fetchedOptions = optionsData.map((item) => ({
          value: item.advertType,
          label: item.advertType,
        }));

        fetchedOptions.sort((a, b) => {
          return a.label.localeCompare(b.label);
        });

        setAdvertOptions(fetchedOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataByOptions();
  }, []);

  useEffect(() => {
    const advertDimension = length * width;

    // Calculate Renewal Fee (licenceFee)
    let renewalFee = 0;
    if (advertSearchInput === "Directional Signs") {
      renewalFee = 10500;
    } else if (advertSearchInput === "Billboard") {
      if (advertDimension < 3) {
        renewalFee = 0;
      } else if (advertDimension > 3) {
        renewalFee = (advertDimension - 3) * extraSquareMetres + firstThreeMetres;
      } else {
        renewalFee = firstThreeMetres;
      }
    } else if (advertSearchInput === "Corporate Flags") {
      renewalFee = perEachperYear;
    } else if (advertSearchInput === "Canvas") {
      renewalFee = firstSquareMetres;
    } else if (advertSearchInput === "Business Encroachment") {
      if (advertDimension === 1) {
        renewalFee = firstSquareMetres;
      } else {
        renewalFee = (advertDimension - 1) * firstSquareMetres + firstSquareMetres;
      }
    } else if (advertSearchInput === "Call In Adverts") {
      renewalFee = 18200;
    } else if (
      advertSearchInput === "Wallpainting" ||
      advertSearchInput === "Window Branding" ||
      advertSearchInput === "Wall Branding"
    ) {
      if (advertDimension < 10) {
        renewalFee = 0;
      } else if (advertDimension === 10) {
        renewalFee = firstTenSquareMetres;
      } else {
        renewalFee = (advertDimension - 10) * extraSquareMetres + firstTenSquareMetres;
      }
    } else {
      if (advertDimension === 1) {
        renewalFee = firstSquareMetres;
      } else if (advertDimension > 1) {
        renewalFee = (advertDimension - 1) * extraSquareMetres + firstSquareMetres;
      }
    }
    if (sideAdvertTypes.includes(advertSearchInput)) {
      renewalFee = (parseFloat(renewalFee) || 0) * (numberOfSides || 1);
    }
    setLicenceFee(renewalFee);

    // Calculate New Applicant Fee (licenceFeeN)
    let newApplicantFee = 0;
    if (advertSearchInput === "Directional Signs") {
      newApplicantFee = 10500;
    } else if (advertSearchInput === "Billboard") {
      if (advertDimension < 3) {
        newApplicantFee = 0;
      } else if (advertDimension > 3) {
        newApplicantFee = (advertDimension - 3) * extraSquareMetres + firstThreeMetres;
      } else {
        newApplicantFee = firstThreeMetres;
      }
    } else if (advertSearchInput === "Corporate Flags") {
      newApplicantFee = perEachperYear;
    } else if (advertSearchInput === "Canvas") {
      newApplicantFee = firstSquareMetres;
    } else if (advertSearchInput === "Business Encroachment") {
      if (advertDimension === 1) {
        newApplicantFee = firstSquareMetres;
      } else {
        newApplicantFee = (advertDimension - 1) * firstSquareMetres + firstSquareMetres;
      }
    } else if (advertSearchInput === "Call In Adverts") {
      newApplicantFee = 18200;
    } else if (
      advertSearchInput === "Wallpainting" ||
      advertSearchInput === "Window Branding" ||
      advertSearchInput === "Wall Branding"
    ) {
      if (advertDimension < 10) {
        newApplicantFee = 0;
      } else if (advertDimension === 10) {
        newApplicantFee = firstTenSquareMetres;
      } else {
        newApplicantFee = (advertDimension - 10) * extraSquareMetres + firstTenSquareMetres;
      }
    } else {
      if (advertDimension === 1) {
        newApplicantFee = firstSquareMetres;
      } else if (advertDimension > 1) {
        newApplicantFee = (advertDimension - 1) * extraSquareMetres + firstSquareMetres;
      }
    }
    newApplicantFee += applicationFee;
    if (sideAdvertTypes.includes(advertSearchInput)) {
      newApplicantFee = (parseFloat(newApplicantFee) || 0) * (numberOfSides || 1);
    }
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
    numberOfSides, // Add dependency
  ]);

  // Common functions
  const closeModal = () => {
    setIsModalOpen(false);
    setUploadMessage(null);
  };

  const refreshData = async () => {
    try {
      await axios.get(apiUrl);
      await axios.get(apiUrl);
      const response = await axios.get(apiUrl);
      setData(response.data);
      console.log("UBPMadeEasy!");
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
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

    const qrCodeURL = `https://ubpeasy.vercel.app/ubp?ubp=${encodeURIComponent(
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
    const textFontSize = 12;
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
      // Only show 'Number of Sides' for sideAdvertTypes
      ...(sideAdvertTypes.includes(advertSearchInput)
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

    const qrCodeURL = `https://ubpeasy.vercel.app/ubp?advert=${encodeURIComponent(
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
    if (!sideAdvertTypes.includes(advertSearchInput)) {
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
      <main className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 pt-4 pb-4 pl-2">
        <div className="flex flex-col justify-center items-center md:w-full w-full max-w-screen-5xl mr-auto ml-auto overflow-x-auto">
          <div
            id="capture"
            className="bg-white  border-4  border-yellow-500 shadow-lg shadow-yellow-500/30 md:mb-2 md:w-3/4 w-11/12 md:h-screen h-3/4 md:mt-2 md:ml-2 p-4 rounded-md overflow-y-auto mb-16"
          >
            {/* Tab Navigation */}
            <div className="flex justify-center gap-x-2 border-b border-[#FFD700] mb-6">
              <button
                className={`w-1/2 md:w-1/2 py-2 px-6 font-semibold text-lg rounded-t-md transition-all duration-200 focus:outline-none
                  ${
                    activeTab === "business"
                      ? "bg-emerald-900 text-[#FFD700] border-b-4 border-[#FFD700] shadow-md"
                      : "bg-white text-emerald-900 hover:bg-[#FFD700]/20 border-b-4 border-transparent"
                  }
                `}
                onClick={() => setActiveTab("business")}
              >
                UBP
              </button>
              <button
                className={`w-1/2 md:w-1/2 py-2 px-6 font-semibold text-lg rounded-t-md transition-all duration-200 focus:outline-none
                  ${
                    activeTab === "advertisement"
                      ? "bg-emerald-900 text-[#FFD700] border-b-4 border-[#FFD700] shadow-md"
                      : "bg-white text-emerald-900 hover:bg-[#FFD700]/20 border-b-4 border-transparent"
                  }
                `}
                onClick={() => setActiveTab("advertisement")}
              >
                Advert
              </button>
            </div>

            {/* Business Activity Tab */}
            {activeTab === "business" && (
              <>
                <header>
                  <h1 className="text-2xl font-semibold text-center text-emerald-900 mb-4">
                    Business Activity Information
                  </h1>
                </header>

                <div className="flex flex-row">
                  <Select
                    options={businessOptions}
                    onChange={(selectedOption) =>
                      setSearchInput(selectedOption.value)
                    }
                    value={businessOptions.find(
                      (option) => option.value === searchInput
                    )}
                    className="md:w-1/2 w-full mb-4 mr-4"
                    styles={customStyles}
                    isSearchable={true}
                    placeholder="Search a business activity"
                    aria-label="Select a business activity"
                  />
                  <span>
                    {loading ? (
                      <div className="flex items-center mt-2">
                        <div
                          className="loading loading-spinner bg-[#FFD700] text-warning loading-md"
                          role="status"
                        />
                        <span className="hidden md:block text-emerald-900 font-bold ml-1">
                          Loading...
                        </span>
                      </div>
                    ) : null}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={`${industry}`}
                      readOnly
                      className="input input-bordered bg-white text-black p-2 rounded-md border-[#FFD700] focus:border-GRAY-900 text-sm"
                    />
                    {industry !== "" && industryMessage && (
                      <p className="text-sm text-emerald-900">
                        {industryMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Business Category
                    </label>
                    <input
                      type="text"
                      value={`${businessCategory}`}
                      readOnly
                      className="input input-bordered bg-white text-black p-2 rounded-md border-[#FFD700] focus:border-GRAY-900 text-sm"
                    />
                    {businessCategory !== "" && businessCategoryMessage && (
                      <p className="text-sm text-emerald-900">
                        {businessCategoryMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Business Sub category
                    </label>
                    <input
                      type="text"
                      value={`${businessSubCategory}`}
                      readOnly
                      className="input input-bordered bg-white text-black text-sm p-2 rounded-md border-[#FFD700] focus:border-GRAY-900"
                    />
                    {businessSubCategory !== "" &&
                      businessSubCategoryMessage && (
                        <p className="text-sm text-emerald-900">
                          {businessSubCategoryMessage}
                        </p>
                      )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Business Activity
                    </label>
                    <input
                      type="text"
                      value={`${businessActivity}`}
                      readOnly
                      className="input input-bordered bg-white text-black p-2 rounded-md border-[#FFD700] focus:border-GRAY-900 text-sm"
                    />
                    {businessActivity !== "" && businessActivityMessage && (
                      <p className="text-sm text-emerald-900">
                        {businessActivityMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="max-w-[desired-width] overflow-x-auto mt-6">
                  <div className="mt-2">
                    <label
                      htmlFor="businessDescriptionFilter"
                      className="block text-sm font-medium text-emerald-900 mb-2"
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
                      className="input input-bordered text-black bg-white p-2 rounded-md border-[#FFD700] focus:border-GRAY-900 px-2 py-1 border  w-full md:w-1/3 mb-4 mr-4"
                    />
                  </div>
                  <table className="table-auto max-w-full divide-y divide-GRAY-900">
                    <thead className="bg-emerald-900 text-[#FFD700]">
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
                            className="px-6 py-3 text-left text-xs font-semibold text-[#FFD700] uppercase tracking-wider border-b-2 border-[#FFD700] transition-all duration-300"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-GRAY-900 text-black">
                      {tableData?.financeActs
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
                        }, [])
                        .map((row, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {row.businessDescription}
                            </td>
                            {[
                              "tradeLicence",
                              "fireClearance",
                              "foodHygiene",
                              "healthCertificate",
                              "pestControl",
                            ].map((key, i) => (
                              <td
                                key={i}
                                className="px-3 py-2 whitespace-nowrap"
                              >
                                {!isNaN(parseInt(row[key]))
                                  ? parseInt(row[key]).toLocaleString("en-KE", {
                                      style: "currency",
                                      currency: "KES",
                                      minimumFractionDigits: 2,
                                    })
                                  : "KES 0.00"}
                              </td>
                            ))}
                            <td className="px-3 py-2 whitespace-nowrap">
                              {(
                                (parseInt(row.tradeLicence) || 0) +
                                (parseInt(row.fireClearance) || 0) +
                                (parseInt(row.foodHygiene) || 0) +
                                (parseInt(row.healthCertificate) || 0) +
                                (parseInt(row.pestControl) || 0)
                              ).toLocaleString("en-KE", {
                                style: "currency",
                                currency: "KES",
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
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
                    className="btn bg-emerald-900 mb-8  text-[#FFD700] font-semibold py-2 px-4 rounded-md"
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
                  <h1 className="text-2xl font-semibold text-center text-emerald-900 mb-4">
                    Advert Small Formats
                  </h1>
                </header>
                <div className="flex flex-row">
                  <Select
                    options={advertOptions}
                    onChange={(selectedOption) =>
                      setAdvertSearchInput(selectedOption.value)
                    }
                    value={advertOptions.find(
                      (option) => option.value === advertSearchInput
                    )}
                    className="md:w-1/2 w-full mb-4 mr-4"
                    styles={customStyles}
                    isSearchable={true}
                    placeholder="Search advert"
                    aria-label="Search advert"
                  />
                  <span>
                    {loading ? (
                      <div className="flex items-center mt-2">
                        <div
                          className="loading loading-spinner bg-[#FFD700] text-warning loading-md"
                          role="status"
                        />
                        <span className="hidden md:block text-emerald-900 font-bold ml-1 ">
                          Loading...
                        </span>
                      </div>
                    ) : null}
                  </span>
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:mb-0 lg:mb-0 mb-8">
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Advertisement Category
                    </label>
                    <input
                      type="text"
                      value={advertisementCategory}
                      readOnly
                      className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                    />
                  </div>
                  <div
                    className={`flex flex-col ${
                      applicationFee === 0 ? "hidden" : ""
                    }`}
                  >
                    <label className="text-md text-emerald-900 font-medium">
                      Application Fee(New Applicant)
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
                      className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Length(m)
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
                        className="input input-success bg-white text-black p-2 rounded-md w-full"
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
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Width(m)
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
                        className="input input-success bg-white text-black p-2 rounded-md w-full"
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
                        className={`flex flex-col ${
                          firstSquareMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 font-medium">
                          first m²
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
                          className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                        />
                      </div>
                      <div
                        className={`flex flex-col ${
                          extraSquareMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 font-medium">
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
                          className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                        />
                      </div>
                      <div
                        className={`flex flex-col ${
                          firstThreeMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 font-medium">
                          first 3m²
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
                          className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                        />
                      </div>
                      <div
                        className={`flex flex-col ${
                          firstTenSquareMetres === 0 ? "hidden" : ""
                        }`}
                      >
                        <label className="text-md text-emerald-900 font-medium">
                          first 10m²
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
                          className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Licence Fee(Renewal)
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
                      className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-md text-emerald-900 font-medium">
                      Licence Fee(New Applicant)
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
                      className="input input-bordered input-success bg-white text-black p-2 rounded-md"
                    />
                  </div>
                  {/* Number of Sides field only for certain advert types */}
                  {sideAdvertTypes.includes(advertSearchInput) && (
                    <div className="flex flex-col">
                      <label className="text-md text-emerald-900 font-medium">
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
                        className="input input-success bg-white text-black p-2 rounded-md w-full"
                      />
                    </div>
                  )}
                </form>
                <div className="text-emerald-900 mt-2 sm:mt-4 lg:mt-6 max-w-1/2 mx-auto">
                  <span className="font-bold">Important Note:</span> If the{" "}
                  <span className="font-semibold">length</span> and{" "}
                  <span className="font-semibold">width</span> do not change
                  when you press the up and down buttons, it indicates that the
                  advert type carries a{" "}
                  <span className="font-semibold">fixed rate</span>.{" "}
                  <span role="img" aria-label="note">
                    📝
                  </span>
                </div>

                <div className="flex flex-row justify-end">
                  <button
                    className="btn btn-md bg-emerald-900 text-[#FFD700] rounded-md font-medium"
                    onClick={generatePDF}
                  >
                    Download PDF
                  </button>
                </div>
              </>
            )}

            {/* Common Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white w-11/12 max-w-lg rounded-md shadow-lg p-6 relative">
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-emerald-900 font-bold text-xl"
                  >
                    ✕
                  </button>
                  <h2 className="text-emerald-900 font-bold text-2xl mb-4">
                    Missing Information
                  </h2>
                  <p className="text-lg text-red-500">{uploadMessage}</p>
                  <button
                    onClick={closeModal}
                    className="mt-4 px-4 py-2 bg-emerald-900 text-[#FFD700] rounded-md"
                  >
                    Close
                  </button>
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


