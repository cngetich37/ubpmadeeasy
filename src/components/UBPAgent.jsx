import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiSend, FiMic, FiPlus, FiTrash, FiMenu } from "react-icons/fi";
import { GiSpeaker } from "react-icons/gi";
import { Helmet } from "react-helmet";
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";

// Helper function to normalize words (e.g., "watches" -> "watch")
const normalizeWord = (word) => {
  // Convert to lowercase for consistent comparison
  word = word.toLowerCase();

  // Handle exceptions explicitly
  const exceptions = {
    barbershop: "barbershop", // Ensure "barbershop" stays as "barbershop"
    bars: "bars", // Ensure "bars" stays as "bars"
  };

  if (exceptions[word]) return exceptions[word];

  // General pluralization rules
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y"; // Convert "butcheries" -> "butchery"
  } else if (
    word.endsWith("es") &&
    !word.endsWith("ss") &&
    !word.endsWith("us")
  ) {
    return word.slice(0, -2); // Convert "watches" -> "watch", "boxes" -> "box"
  } else if (
    word.endsWith("s") &&
    word.length > 1 &&
    !word.endsWith("ss") &&
    !word.endsWith("rs") // Prevents "bars" from becoming "bar"
  ) {
    return word.slice(0, -1); // Convert "cars" -> "car"
  }

  return word; // Return the word as is if no rules apply
};

// Convert words to numbers (e.g., "twenty-five" → 25)
const numberWords = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
};

const wordsToNumber = (words) => {
  let num = 0;
  let temp = 0;

  words.split(/[\s-]+/).forEach((word) => {
    if (numberWords[word] !== undefined) {
      temp += numberWords[word];
    } else if (word === "hundred") {
      temp *= 100;
    } else if (word === "thousand") {
      temp *= 1000;
      num += temp;
      temp = 0;
    }
  });

  return num + temp;
};

// Extract numbers from text input (e.g., "5 outlets" → [5])
const extractNumbers = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  let extractedNumbers = [];

  for (let i = 0; i < words.length; i++) {
    let word = words[i];

    if (numberWords[word]) {
      extractedNumbers.push(numberWords[word]);
    } else if (/\d+/.test(word)) {
      extractedNumbers.push(parseInt(word));
    } else if (word.includes("-")) {
      let num = wordsToNumber(word);
      if (num > 0) extractedNumbers.push(num);
    } else if (word === "over" && i + 1 < words.length) {
      let nextWord = words[i + 1];
      if (numberWords[nextWord] || /\d+/.test(nextWord)) {
        let num = numberWords[nextWord] || parseInt(nextWord);
        extractedNumbers.push(num + 1); // "over 5" → 6
      }
    }
  }
  return extractedNumbers;
};

const UBPAgent = () => {
  // State initialization
  const [prompt, setPrompt] = useState("");
  const [sessions, setSessions] = useState(
    JSON.parse(localStorage.getItem("ubpai_sessions")) || { "Chat 1": [] }
  );
  const [currentSession, setCurrentSession] = useState(
    localStorage.getItem("ubpai_currentSession") || "Chat 1"
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [typing, setTyping] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [businessData, setBusinessData] = useState(
    JSON.parse(localStorage.getItem("ubpai_businessData")) || []
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar toggle
  const [pdfUrl, setPdfUrl] = useState(null);

  // Fetch advert types once (on mount)
  const [advertTypes, setAdvertTypes] = useState([]);
  useEffect(() => {
    fetch('https://effortlessubp-backend.onrender.com/api/advert')
      .then(res => res.json())
      .then(data => setAdvertTypes(data.map(item => item.advertType)));
  }, []);

  // Move sideAdvertTypes here for global access in the component
  const sideAdvertTypes = [
    "Above Canopy", "Under Canopy", "Directional Signs", "Billboard", "Call In Adverts"
  ];

  const chatContainerRef = useRef(null);

  // Example prompts (unchanged)
  const examplePrompts = [
    "Business charges for MPESA with 5 outlets?",
    "Above canopy with 2 sides?",
    "Kinyozi with 2 employees?",
    "Food storage with 1000 sq.m?",
  ];

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("ubpai_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Save current session to localStorage
  useEffect(() => {
    localStorage.setItem("ubpai_currentSession", currentSession);
  }, [currentSession]);

  // Fetch business data (unchanged)
  useEffect(() => {
    if (!businessData.length) {
      fetch("https://effortlessubp-backend.onrender.com/api/naics/")
        .then((res) => res.json())
        .then((data) => {
          setBusinessData(data);
          localStorage.setItem("ubpai_businessData", JSON.stringify(data));
        })
        .catch((err) =>
          console.error(
            "Sorry, I did not understand you. Please try again",
            err
          )
        );
    }
  }, [businessData.length]);

  // Scroll to bottom of chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [sessions, typing]);

  // Handle sending a prompt
  const handleSendPrompt = async (inputPrompt = prompt) => {
    if (!inputPrompt.trim()) return;

    try {
    setSessions((prev) => ({
      ...prev,
      [currentSession]: [
        ...(prev[currentSession] || []),
        { role: "user", text: inputPrompt },
      ],
    }));

      // Detect if prompt contains both business and advert info
      const businessKeywords = [
        "business", "mpesa", "shop", "outlet", "employee", "butchery", "barbershop", "betting", "kinyozi"
      ];
      const advertKeywords = [
        "advert", "billboard", "canopy", "sign", "banner", "painting", "branding", "flag", "window", "wall"
      ];
      const hasBusiness = businessKeywords.some((kw) => inputPrompt.toLowerCase().includes(kw));
      const hasAdvert = advertKeywords.some((kw) => inputPrompt.toLowerCase().includes(kw));

      let businessResult = null;
      let advertResult = null;
      let errorMessage = null;

      // 1. Business logic (original logic)
      let selectedCategory = null;
      let bestMatch = null;
      let businessDetails = null;
      let requestedNumbers = [];
      let requestedSize = null;
      let labelText = "";
      let filterValue = "";
      let industryMessage = "";
      let businessCategoryMessage = "";
      let businessSubCategoryMessage = "";
      let businessActivityMessage = "";

      {
        // Improved normalization for robust matching
        const normalize = str => str
          .toLowerCase()
          .replace(/[^a-z0-9 ]/gi, '') // remove punctuation
          .replace(/\s+/g, ' ')        // collapse spaces
          .trim();

        const inputNorm = normalize(inputPrompt);
        console.log('Normalized input:', inputNorm);
        const matches = businessData
          .map(item => ({
            item,
            activityNorm: normalize(item.commonBusinessActivity)
          }))
          .filter(({ activityNorm }) => {
            
            // Try both includes and a word boundary regex
            const found = inputNorm.includes(activityNorm) ||
              new RegExp(`\\b${activityNorm}\\b`).test(inputNorm);
            if (found) console.log('MATCHED:', activityNorm);
            return found;
          });
       

        // Pick the longest match (most specific)
        bestMatch = matches.length
          ? matches.reduce((a, b) => (b.activityNorm.length > a.activityNorm.length ? b : a)).item
          : null;
        if (bestMatch) {
    try {
      const response = await fetch(
              `https://effortlessubp-backend.onrender.com/api/naics/businessactivities/${encodeURIComponent(bestMatch.businessActivity)}`
            );
            businessDetails = await response.json();

            // Fetch the message/description for each field
            const [industryMsg, businessCategoryMsg, businessSubCategoryMsg, businessActivityMsg] = await Promise.all([
              fetch(`https://effortlessubp-backend.onrender.com/api/naics/industry/${encodeURIComponent(bestMatch.industry)}`).then(res => res.json()).then(data => data.industry),
              fetch(`https://effortlessubp-backend.onrender.com/api/naics/businesscategories/${encodeURIComponent(bestMatch.businessCategory)}`).then(res => res.json()).then(data => data.businessCategory),
              fetch(`https://effortlessubp-backend.onrender.com/api/naics/businesssubcategories/${encodeURIComponent(bestMatch.businessSubCategory)}`).then(res => res.json()).then(data => data.businessSubCategory),
              fetch(`https://effortlessubp-backend.onrender.com/api/naics/businessactivities/${encodeURIComponent(bestMatch.businessActivity)}`).then(res => res.json()).then(data => data.businessActivity),
            ]);
            industryMessage = industryMsg;
            businessCategoryMessage = businessCategoryMsg;
            businessSubCategoryMessage = businessSubCategoryMsg;
            businessActivityMessage = businessActivityMsg;

      // Step 2: Extract numbers (outlets/employees)
            requestedNumbers = extractNumbers(inputPrompt);
      // Extract size-based classification (e.g., "1000 sq.m" or "500m²")
            const sizeMatch = inputPrompt.match(/(\d+)\s*(sq\.?m|square meters?|m²)/i);
            requestedSize = sizeMatch ? parseInt(sizeMatch[1]) : null;
            // Find category
      if (requestedNumbers.length > 0) {
        selectedCategory = businessDetails.financeActs.find((item) => {
          const numbersInDescription =
            item.businessDescription.match(/\d+/g)?.map(Number) || [];
          return requestedNumbers.some((num) => {
            if (numbersInDescription.length === 2) {
              return (
                num >= numbersInDescription[0] && num <= numbersInDescription[1]
              ); // Matches "X-Y range"
            } else if (numbersInDescription.length === 1) {
              return num > numbersInDescription[0]; // Matches "over X"
            }
            return false;
          });
        });
        // Handle specific cases like "up to X", "less than X", "over X"
        if (!selectedCategory) {
          selectedCategory = businessDetails.financeActs.find((item) => {
            const desc = item.businessDescription.toLowerCase();
            if (/up to|upto/.test(desc)) {
                    const match = item.businessDescription.match(/\b(up to|upto)\s+(\d+)/i);
              if (match)
                return requestedNumbers.some(
                  (num) => num <= parseInt(match[2], 10)
                );
            }
            if (/less than/.test(desc)) {
                    const match = item.businessDescription.match(/\bless\s+than\s+(\d+)/i);
              if (match)
                return requestedNumbers.some(
                  (num) => num < parseInt(match[1], 10)
                );
            }
            if (/over/.test(desc)) {
              const match = item.businessDescription.match(/\bover\s+(\d+)/i);
              if (match)
                return requestedNumbers.some(
                  (num) => num > parseInt(match[1], 10)
                );
            }
            return false;
          });
        }
      }
      if (requestedSize) {
        if (!selectedCategory) {
          selectedCategory = businessDetails.financeActs.find((item) => {
            const desc = item.businessDescription.toLowerCase();
            if (/up to|upto/.test(desc)) {
                    const match = item.businessDescription.match(/\b(up to|upto)\s+(\d+)/i);
              if (match) return requestedSize <= parseInt(match[2], 10);
            }
            if (/less than/.test(desc)) {
                    const match = item.businessDescription.match(/\bless\s+than\s+(\d+)/i);
              if (match) return requestedSize < parseInt(match[1], 10);
            }
            if (/\b(\d+)\s*-\s*(\d+)/.test(item.businessDescription)) {
                    const match = item.businessDescription.match(/\b(\d+)\s*-\s*(\d+)/);
              if (match) {
                const minSize = parseInt(match[1]);
                const maxSize = parseInt(match[2]);
                return requestedSize >= minSize && requestedSize <= maxSize;
              }
            }
            if (/over/.test(desc)) {
              const match = item.businessDescription.match(/\bover\s+(\d+)/);
              if (match) return requestedSize > parseInt(match[1], 10);
            }
            return false;
          });
        }
      }
      // Fallback to generic category if no exact match
      if (!selectedCategory && businessDetails.financeActs.length > 0) {
        selectedCategory =
          businessDetails.financeActs.find(
            (item) => !/\d+/.test(item.businessDescription)
          ) || businessDetails.financeActs[0];
            }
            // Label for PDF
            if (selectedCategory && selectedCategory.businessDescription) {
              const match = selectedCategory.businessDescription.match(/(?:over\s*)?(\d+)(?:\s*[-–—]\s*\d+)?\s+([\w]+)/i);
              labelText = match ? `No of ${match[2]}` : "";
              filterValue = requestedNumbers[0] || requestedSize || "";
            }
            businessResult = { bestMatch, businessDetails, selectedCategory, labelText, filterValue, industryMessage, businessCategoryMessage, businessSubCategoryMessage, businessActivityMessage };
          } catch (e) {
            console.error(e);
            errorMessage = "Could not fetch business details.";
          }
        } else {
          errorMessage = "I could not find a matching business activity.";
        }
      }

      // 2. Advert logic (from CombinedSearch, summary only)
      if (hasAdvert) {
        let foundAdvertType = advertTypes.find(type =>
          new RegExp(`\\b${type.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(inputPrompt)
        );
        if (!foundAdvertType) {
          // Try partial match
          foundAdvertType = advertTypes.find((type) => {
            return type.toLowerCase().split(" ").some(word => inputPrompt.toLowerCase().includes(word));
          });
        }
        if (foundAdvertType) {
          // Extract dimensions (e.g., "1 metre by 2 metres")
          let length = 1, width = 1;
          const dimMatch = inputPrompt.match(/(\d+(?:\.\d+)?)\s*(metre|meter|m)\s*(by|x|\*)\s*(\d+(?:\.\d+)?)\s*(metre|meter|m)/i);
          if (dimMatch) {
            length = parseFloat(dimMatch[1]);
            width = parseFloat(dimMatch[4]);
          }
          let numberOfSides = 1;
          // Try to extract number of sides from prompt (e.g. "2 sides")
          const sidesMatch = inputPrompt.match(/(\d+)\s*sides?/i);
          if (sidesMatch) {
            numberOfSides = parseInt(sidesMatch[1]);
          }
          try {
            const response = await fetch(
              `https://effortlessubp-backend.onrender.com/api/advert/${encodeURIComponent(foundAdvertType)}`
            );
            const advertDetails = await response.json();
            // Compute all fees as in CombinedSearch
            const applicationFee = Number(advertDetails.applicationFee) || 0;
            const firstThreeMetres = Number(advertDetails.firstThreeMetres) || 0;
            const firstSquareMetres = Number(advertDetails.firstSquareMetres) || 0;
            const firstTenSquareMetres = Number(advertDetails.firstTenSquareMetres) || 0;
            const extraSquareMetres = Number(advertDetails.extraSquareMetres) || 0;
            const perEachperYear = Number(advertDetails.perEachperYear) || 0;
            let renewalFee = 0;
            let newApplicantFee = 0;
            const advertDimension = length * width;
            if (foundAdvertType === "Directional Signs") {
              renewalFee = 10500;
              newApplicantFee = 10500;
            } else if (foundAdvertType === "Billboard") {
              if (advertDimension < 3) {
                renewalFee = 0;
                newApplicantFee = 0;
              } else if (advertDimension > 3) {
                renewalFee = (advertDimension - 3) * extraSquareMetres + firstThreeMetres;
                newApplicantFee = (advertDimension - 3) * extraSquareMetres + firstThreeMetres;
              } else {
                renewalFee = firstThreeMetres;
                newApplicantFee = firstThreeMetres;
              }
            } else if (foundAdvertType === "Corporate Flags") {
              renewalFee = perEachperYear;
              newApplicantFee = perEachperYear;
            } else if (foundAdvertType === "Canvas") {
              renewalFee = firstSquareMetres;
              newApplicantFee = firstSquareMetres;
            } else if (foundAdvertType === "Business Encroachment") {
              if (advertDimension === 1) {
                renewalFee = firstSquareMetres;
                newApplicantFee = firstSquareMetres;
              } else {
                renewalFee = (advertDimension - 1) * firstSquareMetres + firstSquareMetres;
                newApplicantFee = (advertDimension - 1) * firstSquareMetres + firstSquareMetres;
              }
            } else if (foundAdvertType === "Call In Adverts") {
              renewalFee = 18200;
              newApplicantFee = 18200;
            } else if (
              foundAdvertType === "Wallpainting" ||
              foundAdvertType === "Window Branding" ||
              foundAdvertType === "Wall Branding"
            ) {
              if (advertDimension < 10) {
                renewalFee = 0;
                newApplicantFee = 0;
              } else if (advertDimension === 10) {
                renewalFee = firstTenSquareMetres;
                newApplicantFee = firstTenSquareMetres;
              } else {
                renewalFee = (advertDimension - 10) * extraSquareMetres + firstTenSquareMetres;
                newApplicantFee = (advertDimension - 10) * extraSquareMetres + firstTenSquareMetres;
              }
            } else {
              if (advertDimension === 1) {
                renewalFee = firstSquareMetres;
                newApplicantFee = firstSquareMetres;
              } else if (advertDimension > 1) {
                renewalFee = (advertDimension - 1) * extraSquareMetres + firstSquareMetres;
                newApplicantFee = (advertDimension - 1) * extraSquareMetres + firstSquareMetres;
              }
            }
            // Add application fee to new applicant fee
            newApplicantFee += applicationFee;
            // Multiply by number of sides if needed
            if (sideAdvertTypes.includes(foundAdvertType)) {
              renewalFee = (parseFloat(renewalFee) || 0) * (numberOfSides || 1);
              newApplicantFee = (parseFloat(newApplicantFee) || 0) * (numberOfSides || 1);
            }
            // Format for display
            const formatCurrency = (amount) =>
              amount !== 0
                ? parseFloat(amount).toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                    minimumFractionDigits: 2,
                  })
                : "";
            advertResult = {
              foundAdvertType,
              advertDetails,
              length,
              width,
              numberOfSides,
              applicationFee: formatCurrency(applicationFee),
              advertisementCategory: advertDetails.advertisementCategory || "N/A",
              firstSquareMetres: formatCurrency(firstSquareMetres) || "N/A",
              extraSquareMetres: formatCurrency(extraSquareMetres) || "N/A",
              firstThreeMetres: formatCurrency(firstThreeMetres) || "N/A",
              firstTenSquareMetres: formatCurrency(firstTenSquareMetres) || "N/A",
              licenceFee: formatCurrency(renewalFee) || "N/A",
              licenceFeeN: formatCurrency(newApplicantFee) || "N/A",
            };
          } catch (e) {
            console.error(e);
            errorMessage = "Could not fetch advert details.";
          }
        } else {
          errorMessage = "I could not find a matching advert type.";
        }
      }

      // 3. Compose response and PDF
      if (businessResult || advertResult) {
        let responseText = "";
        if (businessResult) {
          const { bestMatch, selectedCategory } = businessResult;
          responseText += `Business: ${bestMatch.commonBusinessActivity}\n`;
        responseText += `Industry: ${bestMatch.industry}\n`;
        responseText += `Business Category: ${bestMatch.businessCategory}\n`;
        responseText += `Business Subcategory: ${bestMatch.businessSubCategory}\n`;
        responseText += `Business Activity: ${bestMatch.businessActivity}\n`;
          if (selectedCategory) {
            responseText += `For a ${selectedCategory.businessDescription}, the charges are:\n`;
            responseText += `Trade License: ${selectedCategory.tradeLicence}, Fire Clearance: ${selectedCategory.fireClearance}, Food Hygiene: ${selectedCategory.foodHygiene}, Health Certificate: ${selectedCategory.healthCertificate}, Pest Control: ${selectedCategory.pestControl}\n`;
          }
          responseText += `\n`;
        }
        if (advertResult) {
          // For advert, replace 'Kenya shillings' with 'KES' in all currency fields
          const replaceWithKES = (val) => String(val).replace(/Kenya shillings/gi, 'KES');
          advertResult.applicationFee = replaceWithKES(advertResult.applicationFee);
          advertResult.firstSquareMetres = replaceWithKES(advertResult.firstSquareMetres);
          advertResult.extraSquareMetres = replaceWithKES(advertResult.extraSquareMetres);
          advertResult.firstThreeMetres = replaceWithKES(advertResult.firstThreeMetres);
          advertResult.firstTenSquareMetres = replaceWithKES(advertResult.firstTenSquareMetres);
          advertResult.licenceFee = replaceWithKES(advertResult.licenceFee);
          advertResult.licenceFeeN = replaceWithKES(advertResult.licenceFeeN);
          // Compose advert response rows
          let advertRows = [
            ["Advert", advertResult.foundAdvertType],
            ["Category", advertResult.advertisementCategory],
            // Only show dimensions if not default 1m x 1m
            ...((advertResult.length !== 1 || advertResult.width !== 1)
              ? [["Dimensions", `${advertResult.length}m x ${advertResult.width}m`]]
              : []),
            ...(sideAdvertTypes.includes(advertResult.foundAdvertType)
              ? [["Number of Sides", advertResult.numberOfSides]]
              : []),
            ["Application Fee", advertResult.applicationFee],
            ["First m²", advertResult.firstSquareMetres],
            ["First 3m²", advertResult.firstThreeMetres],
            ["First 10m²", advertResult.firstTenSquareMetres],
            ["Each Extra m²", advertResult.extraSquareMetres],
            ["Licence Fee (Renewal)", advertResult.licenceFee],
            ["Licence Fee (New Applicant)", advertResult.licenceFeeN],
          ];
          // Filter out N/A, empty, or undefined
          advertRows = advertRows.filter(row => row[1] !== 'N/A' && row[1] !== '' && row[1] !== undefined);
          // Build responseText from filtered rows
          advertRows.forEach(([label, value]) => {
            responseText += `${label}: ${value}\n`;
          });
          responseText += `\n`;
        }
        responseText += `You can download a PDF with these details below.`;
        // Replace KSH/KES with Kenya shillings in the responseText
        responseText = responseText.replace(/KSH|KES/gi, 'KES');

        // PDF generation logic
        let pdf, currentY, pageWidth;
        if (!businessResult && advertResult) {
          // Only advert: use portrait, centered table, like CombinedSearch generatePDF
          pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [300, 450] });
          const topMargin = 50;
          const leftMargin = 35;
          const titleFontSize = 20;
          const spacing = 5;
          pdf.setFontSize(titleFontSize);
          pdf.setFont("Times", "Roman");
          pdf.setFillColor("#FFFFFF");
          pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, "F");
          pdf.setTextColor("#064E3B");
          pdf.text("UBPMadeEasy", leftMargin, topMargin);
          currentY = topMargin + titleFontSize + spacing;
          // Table
          const tableHeaders = ["Advert", ""];
          let tableRows = [
            ["Advertisement Category", advertResult.advertisementCategory],
            ["Advert", advertResult.foundAdvertType],
            ["Application Fee (New Applicant)", advertResult.applicationFee],
            // Only show dimensions if not default 1m x 1m
            ...((advertResult.length !== 1 || advertResult.width !== 1)
              ? [["Dimensions (Length × Width)", `${advertResult.length} m × ${advertResult.width} m`]]
              : []),
            // Always show number of sides for side-based types
            ...(sideAdvertTypes.includes(advertResult.foundAdvertType)
              ? [["Number of Sides", advertResult.numberOfSides]]
              : []),
            ["First m²", advertResult.firstSquareMetres],
            ["First 3m²", advertResult.firstThreeMetres],
            ["First 10m²", advertResult.firstTenSquareMetres],
            ["Each Extra m²", advertResult.extraSquareMetres],
            ["Licence Fee (Renewal)", advertResult.licenceFee],
            ["Licence Fee (New Applicant)", advertResult.licenceFeeN],
          ];
          // Filter out rows where value is 'N/A', empty string, or undefined
          tableRows = tableRows.filter(row => row[1] !== 'N/A' && row[1] !== '' && row[1] !== undefined);
          const columnWidths = [150, 120];
          const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
          pageWidth = pdf.internal.pageSize.width;
          const tableStartX = (pageWidth - tableWidth) / 2;
          pdf.autoTable({
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
          // QR code
          const qrCodeURL = `https://ubpeasy.vercel.app/ubp?advert=${encodeURIComponent(advertResult.foundAdvertType)}`;
          const qrCodeDataUrl = await QRCode.toDataURL(qrCodeURL, { width: 80 });
          const qrCodeX = pdf.internal.pageSize.getWidth() - 100;
          const qrCodeY = pdf.internal.pageSize.getHeight() - 100;
          pdf.addImage(qrCodeDataUrl, "PNG", qrCodeX, qrCodeY, 80, 80);
      } else {
          // Business or both: use landscape, append advert summary after business section
          pdf = new jsPDF("landscape", "pt", "a5");
          pdf.setFillColor("#FFFFFF");
          pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "F");
          const title = "UBPMadeEasy";
          const titleX = pdf.internal.pageSize.getWidth() / 2;
          const titleY = 50;
          pageWidth = pdf.internal.pageSize.getWidth();
          const rectHeight = 40;
          pdf.setFillColor("#064E3B");
          pdf.rect(0, titleY - rectHeight / 2, pageWidth, rectHeight, "F");
          pdf.setTextColor("#FFD700");
          pdf.setFont("Times", "bold");
          pdf.text(title, titleX, titleY, { align: "center" });
          pdf.setFontSize(40);
          currentY = titleY + 50;
          // Table 1: Business info
          if (businessResult) {
            const { bestMatch, industryMessage, businessCategoryMessage, businessSubCategoryMessage, businessActivityMessage } = businessResult;
            const tableHeaders = ["", ""];
            const tableRows = [
              [`Business: ${bestMatch.commonBusinessActivity || bestMatch.searchInput || ''}`, ""],
              ["", ""],
              ["Industry", "Business Category"],
              [
                `${industryMessage} - ${bestMatch.industry}`,
                `${businessCategoryMessage} - ${bestMatch.businessCategory}`,
              ],
              ["", ""],
              ["Business Subcategory", "Business Activity"],
              [
                `${businessSubCategoryMessage} - ${bestMatch.businessSubCategory}`,
                `${businessActivityMessage} - ${bestMatch.businessActivity}`,
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
            // Details row if present
            if (businessResult.labelText && businessResult.filterValue) {
              const detailsTableWidth = 220;
              const tableStartX = (pageWidth - detailsTableWidth) / 2;
              pdf.autoTable({
                startY: currentY,
                startX: tableStartX,
                margin: { top: 10, right: 10, bottom: 10, left: 5 },
                head: [["Details", "Value"]],
                body: [[
                  { content: businessResult.labelText.replace(/:$/, ""), styles: { fontStyle: 'bold', halign: 'right', cellPadding: 4 } },
                  { content: businessResult.filterValue, styles: { fontStyle: 'normal', halign: 'center', cellPadding: 4 } }
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
            // Table 2: Charges
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
            // Filtering logic like CombinedSearch.jsx
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
            let filteredRows = businessDetails.financeActs;
            if (filterValue) {
              const inputNumber = parseInt(filterValue);
              if (!isNaN(inputNumber)) {
                filteredRows = filteredRows.filter(row => matchNumberRange(row.businessDescription, inputNumber));
              }
            }
            // Remove duplicates by businessDescription
            filteredRows = filteredRows.reduce((uniqueRows, row) => {
              if (!uniqueRows.some(uniqueRow => uniqueRow.businessDescription === row.businessDescription)) {
                uniqueRows.push(row);
              }
              return uniqueRows;
            }, []);
            const tableRowsFinance = filteredRows.map((row) => {
              const total =
                (parseFloat(row.tradeLicence) || 0) +
                (parseFloat(row.fireClearance) || 0) +
                (parseFloat(row.foodHygiene) || 0) +
                (parseFloat(row.healthCertificate) || 0) +
                (parseFloat(row.pestControl) || 0);
              const formatCurrency = (val) => String(val).replace(/KES|KSH/gi, 'KES');
              return [
                row.subCategory,
                row.businessDescription,
                formatCurrency(row.tradeLicence),
                formatCurrency(row.fireClearance),
                formatCurrency(row.foodHygiene),
                formatCurrency(row.healthCertificate),
                formatCurrency(row.pestControl),
                formatCurrency(total.toLocaleString("en-KE", {
                  style: "currency",
                  currency: "KES",
                  minimumFractionDigits: 2,
                })),
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
            currentY = pdf.lastAutoTable.finalY + 20;
          }
          // Append advert summary if present
          if (advertResult) {
            pdf.setFont("Times", "bold");
            pdf.setFontSize(16);
            pdf.setTextColor("#064E3B");
            pdf.text("Advertisement Summary", 40, currentY);
            currentY += 24;
            pdf.setFont("Times", "normal");
            pdf.setFontSize(12);
            pdf.text(`Advert: ${advertResult.foundAdvertType}`, 40, currentY); currentY += 16;
            pdf.text(`Category: ${advertResult.advertisementCategory}`, 40, currentY); currentY += 16;
            pdf.text(`Dimensions: ${advertResult.length}m x ${advertResult.width}m`, 40, currentY); currentY += 16;
            if (advertResult.numberOfSides && advertResult.numberOfSides > 1) {
              pdf.text(`Number of Sides: ${advertResult.numberOfSides}`, 40, currentY); currentY += 16;
            }
            pdf.text(`Application Fee: ${advertResult.applicationFee}`, 40, currentY); currentY += 16;
            pdf.text(`First m²: ${advertResult.firstSquareMetres}`, 40, currentY); currentY += 16;
            pdf.text(`First 3m²: ${advertResult.firstThreeMetres}`, 40, currentY); currentY += 16;
            pdf.text(`First 10m²: ${advertResult.firstTenSquareMetres}`, 40, currentY); currentY += 16;
            pdf.text(`Each Extra m²: ${advertResult.extraSquareMetres}`, 40, currentY); currentY += 16;
            pdf.text(`Licence Fee (Renewal): ${advertResult.licenceFee}`, 40, currentY); currentY += 16;
            pdf.text(`Licence Fee (New Applicant): ${advertResult.licenceFeeN}`, 40, currentY); currentY += 20;
          }
          // QR code
          const qrText = "https://ubpeasy.vercel.app/";
          const qrCodeDataUrl = await QRCode.toDataURL(qrText, { width: 80 });
          pdf.addImage(qrCodeDataUrl, "PNG", pageWidth - 100, pdf.internal.pageSize.getHeight() - 100, 80, 80);
        }
        // Output PDF as blob URL
        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);

      simulateTyping(responseText, () => {
        setSessions((prev) => ({
          ...prev,
          [currentSession]: [
            ...(prev[currentSession] || []),
              { role: "assistant", text: responseText, pdf: url },
          ],
        }));
        handleReadText(responseText);
      });
        return;
      }

      // If only error
      setSessions((prev) => ({
        ...prev,
        [currentSession]: [
          ...(prev[currentSession] || []),
          { role: "assistant", text: errorMessage || "I am sorry, I didn't understand you." },
        ],
      }));
    } catch (e) {
      console.error("Unexpected error in handleSendPrompt:", e);
      setSessions((prev) => ({
        ...prev,
        [currentSession]: [
          ...(prev[currentSession] || []),
          { role: "assistant", text: "An unexpected error occurred. Please try again or check the console for details." },
        ],
      }));
    }
  };

  // Simulate typing effect
  const simulateTyping = (text, callback) => {
    let index = 0;
    setTyping("");
    const interval = setInterval(() => {
      if (index < text.length) {
        setTyping((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        callback();
        setTyping("");
      }
    }, 50);
  };

  // Handle deleting a session
  const handleDeleteSession = (session) => {
    const updatedSessions = { ...sessions };
    delete updatedSessions[session];
    setSessions(updatedSessions);
    if (currentSession === session) {
      const nextSession = Object.keys(updatedSessions)[0] || "Chat 1";
      setCurrentSession(nextSession);
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    setIsListening(true);
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setPrompt(speechResult);
      handleSendPrompt(speechResult);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // Handle reading text aloud
  const handleReadText = (text) => {
    if ("speechSynthesis" in window) {
      // Replace all KSH/KES (case-insensitive) with 'Kenya shillings' for TTS
      let modifiedText = text.replace(/KSH|KES/gi, 'Kenya shillings');
      // Also handle the specific breakdowns for legacy support
      modifiedText = modifiedText.replace(
        /(Trade License:.*?)(\d+)\n|(Fire Clearance:.*?)(\d+)\n|(Food Hygiene:.*?)(\d+)\n|(Health Certificate:.*?)(\d+)\n|(Pest Control:.*?)(\d+)\n|(Total Charges:.*?)(\d+)\n/g,
        (
          match,
          tradeLabel,
          tradeNum,
          fireLabel,
          fireNum,
          foodLabel,
          foodNum,
          healthLabel,
          healthNum,
          pestLabel,
          pestNum,
          totalLabel,
          totalNum
        ) => {
          if (tradeLabel) return `${tradeLabel}${tradeNum} KES\n`;
          if (fireLabel) return `${fireLabel}${fireNum} KES\n`;
          if (foodLabel) return `${foodLabel}${foodNum} KES\n`;
          if (healthLabel)
            return `${healthLabel}${healthNum} KES\n`;
          if (pestLabel) return `${pestLabel}${pestNum} KES\n`;
          if (totalLabel) return `${totalLabel}${totalNum} KES\n`;
          return match;
        }
      );

      const utterance = new SpeechSynthesisUtterance(modifiedText);
      utterance.lang = "en-US";

      // Get the list of available voices
      const voices = window.speechSynthesis.getVoices();

      // Find a female voice (e.g., "Google US English Female" or "Microsoft Zira")
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.includes("Female") || // Generic female voices
          voice.name.includes("Zira") || // Microsoft Zira (female voice)
          voice.name.includes("Google US English Female") // Google female voice
      );

      // Set the voice if found, otherwise use the default voice
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, text-to-speech is not supported in your browser.");
    }
  };

  return (
    <>
      <Helmet>
        <title>UBP Made Easy - Streamline UBP</title>
        <meta
          name="description"
          content="Get accurate finance act estimates based on your industry and size. Powered by AI, UBP Assistant helps businesses with business activity search."
        />
        <meta
          name="keywords"
          content="Business permit, AI Business Assistant, Business charges Estimation, Financial Act Planning"
        />
      </Helmet>
      <div className="flex flex-col md:flex-row h-screen bg-[#F5F5F5] dark:bg-[var(--color-bg)] p-4 gap-4">
        {/* Mobile Sidebar Toggle Button */}
        <button
          className="md:hidden p-2 bg-emerald-900 text-white rounded-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <FiMenu className="text-lg" />
        </button>

        {/* Sidebar for Chat Sessions */}
        <div
          className={`${
            isSidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-1/4 bg-white dark:bg-[var(--color-surface)] p-4 rounded-lg shadow-lg`}
        >
          <h2 className="text-xl font-bold text-emerald-900 dark:text-white mb-4">Chats</h2>
          <button
            className="w-full bg-emerald-900 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#05482D] transition-colors"
            onClick={() => {
              const newSessionName = `Chat ${Object.keys(sessions).length + 1}`;
              setSessions((prev) => ({
                ...prev,
                [newSessionName]: [],
              }));
              setCurrentSession(newSessionName);
              setIsSidebarOpen(false); // Close sidebar on mobile after creating a new session
            }}
          >
            <FiPlus className="text-lg" /> New Chat
          </button>
          <div className="mt-4 space-y-2">
            {Object.keys(sessions).map((session) => (
              <div
                key={session}
                className="flex justify-between items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <span
                  className="text-emerald-900"
                  onClick={() => {
                    setCurrentSession(session);
                    setIsSidebarOpen(false); // Close sidebar on mobile after selecting a session
                  }}
                >
                  {session}
                </span>
                <FiTrash
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                  onClick={() => handleDeleteSession(session)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[var(--color-surface)] rounded-lg shadow-lg overflow-hidden">
          <header className="bg-emerald-900 p-4">
            <h1 className="text-2xl font-bold text-center text-white">
              <span className="text-[#FFD700]">UBP</span>Agent
            </h1>
          </header>
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-[var(--color-surface)]"
          >
            {sessions[currentSession]?.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#FFD700] text-emerald-900"
                      : "bg-emerald-900 text-white dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)]"
                  }`}
                >
                  {message.text}
                  {message.pdf && (
                    <div className="mt-2">
                      <a
                        href={message.pdf}
                        download="UBP_Advert_Combined.pdf"
                        className="inline-block bg-[#FFD700] text-emerald-900 px-3 py-1 rounded hover:bg-emerald-900 hover:text-[#FFD700] transition-colors font-semibold text-sm"
                      >
                        Download PDF
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] p-3 bg-emerald-900 text-white dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)] rounded-lg">
                  {typing}
                </div>
              </motion.div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="flex-1 p-2 border border-emerald-900 dark:border-[var(--color-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[var(--color-primary)] bg-white dark:bg-[var(--color-surface)] text-emerald-900 dark:text-[var(--color-text)]"
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  className="bg-emerald-900 text-white p-2 rounded-lg hover:bg-[#05482D] transition-colors"
                  onClick={() => handleSendPrompt()}
                >
                  <FiSend className="text-lg" />
                </button>
                <button
                  className={`${
                    isListening ? "bg-emerald-900" : "bg-[#FFD700]"
                  } text-emerald-900 p-2 rounded-lg hover:bg-[#E6B800] transition-colors`}
                  onClick={handleVoiceInput}
                >
                  <FiMic className="text-lg" />
                </button>
                <button
                  onClick={() =>
                    sessions[currentSession]?.length
                      ? handleReadText(
                          sessions[currentSession].slice(-1)[0].text
                        )
                      : null
                  }
                  className="bg-emerald-900 text-[#FFD700] p-2 rounded-lg hover:bg-[#05482D] transition-colors"
                >
                  <GiSpeaker className="text-lg" />
                </button>
              </div>
            </div>
            <p className="text-sm text-emerald-900 dark:text-white text-center mt-2 italic">
              UBPAgent can make mistakes. Please consult the Finance Act.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[var(--color-surface)">
            <h2 className="text-lg font-bold text-emerald-900 dark:text-white mb-2">
              Example Prompts:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {examplePrompts.map((ex, index) => (
                <button
                  key={index}
                  className="p-2 bg-emerald-900 text-white dark:bg-[var(--color-primary)] dark:text-[var(--color-bg)] rounded-lg hover:bg-[#05482D] dark:hover:bg-yellow-300 transition-colors text-sm text-left"
                  onClick={() => handleSendPrompt(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UBPAgent;