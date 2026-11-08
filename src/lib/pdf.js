// PDF exports for the search page and the agent. jsPDF is loaded on demand
// so it stays out of the main bundle.
import { SITE_URL } from "../config";
import { SIDE_ADVERT_TYPES } from "./fees";
import { FEE_COLUMNS, rowTotal } from "./financeActs";
import { formatKES } from "./format";

const GREEN = "#064E3B";
const GOLD = "#FFD700";
const WHITE = "#FFFFFF";

async function loadJsPdf() {
  const [{ default: jsPDF }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  return jsPDF;
}

async function addQrCode(pdf, url) {
  const { default: QRCode } = await import("qrcode");
  const dataUrl = await QRCode.toDataURL(url, { width: 80 });
  const x = pdf.internal.pageSize.getWidth() - 100;
  const y = pdf.internal.pageSize.getHeight() - 100;
  pdf.addImage(dataUrl, "PNG", x, y, 80, 80);
}

export const businessQrUrl = (name) => `${SITE_URL}/ubp?ubp=${encodeURIComponent(name)}`;
export const advertQrUrl = (type) => `${SITE_URL}/ubp?advert=${encodeURIComponent(type)}`;

// ---------------------------------------------------------------- business

/**
 * Draw the landscape business report (title bar, classification table,
 * optional "No of ..." row, fee table). Returns the y position after it.
 */
function drawBusinessReport(pdf, { name, codes, descriptions, label, filterValue, rows }) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(WHITE);
  pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F");

  const titleY = 50;
  const barHeight = 40;
  pdf.setFillColor(GREEN);
  pdf.rect(0, titleY - barHeight / 2, pageWidth, barHeight, "F");
  pdf.setTextColor(GOLD);
  pdf.setFont("Times", "bold");
  pdf.text("UBPMadeEasy", pageWidth / 2, titleY, { align: "center" });
  pdf.setFontSize(40);

  let currentY = titleY + 50;
  pdf.autoTable({
    startY: currentY,
    margin: { top: 20, right: 10, bottom: 20, left: 5 },
    head: [["", ""]],
    body: [
      [`Business: ${name}`, ""],
      ["", ""],
      ["Industry", "Business Category"],
      [
        `${descriptions.industry} - ${codes.industry}`,
        `${descriptions.businessCategory} - ${codes.businessCategory}`,
      ],
      ["", ""],
      ["Business Subcategory", "Business Activity"],
      [
        `${descriptions.businessSubCategory} - ${codes.businessSubCategory}`,
        `${descriptions.businessActivity} - ${codes.businessActivity}`,
      ],
    ],
    theme: "striped",
    styles: { textColor: GREEN, font: "Times", fontSize: 12 },
    headStyles: { fillColor: WHITE, textColor: GREEN, fontStyle: "bold", fontSize: 14, halign: "center" },
    columnStyles: { 0: { cellWidth: 300 }, 1: { cellWidth: 280 } },
    didDrawPage: (data) => {
      currentY = data.cursor.y + 30;
    },
  });

  if (label && filterValue) {
    pdf.autoTable({
      startY: currentY,
      startX: (pageWidth - 220) / 2,
      margin: { top: 10, right: 10, bottom: 10, left: 5 },
      head: [["Details", "Value"]],
      body: [
        [
          { content: label.replace(/:$/, ""), styles: { fontStyle: "bold", halign: "right", cellPadding: 4 } },
          { content: String(filterValue), styles: { fontStyle: "normal", halign: "center", cellPadding: 4 } },
        ],
      ],
      theme: "grid",
      styles: { textColor: GREEN, font: "Times", fontSize: 13, valign: "middle" },
      headStyles: { fillColor: GOLD, textColor: GREEN, fontStyle: "bold", fontSize: 13, halign: "center" },
      columnStyles: { 0: { cellWidth: 110, halign: "right" }, 1: { cellWidth: 110, halign: "right" } },
      didDrawPage: (data) => {
        currentY = data.cursor.y + 20;
      },
    });
    currentY += 20;
  }
  currentY += 30;

  pdf.autoTable({
    startY: currentY,
    margin: { top: 20, right: 10, bottom: 70, left: 5 },
    head: [["Code", "Business Description", ...FEE_COLUMNS.map(([, title]) => title), "Total (KES)"]],
    body: rows.map((row) => [
      row.subCategory,
      row.businessDescription,
      ...FEE_COLUMNS.map(([field]) => row[field]),
      formatKES(rowTotal(row)),
    ]),
    theme: "striped",
    styles: { textColor: GREEN, fillColor: WHITE, font: "Arial", fontSize: 10 },
    headStyles: { fillColor: GREEN, textColor: GOLD, fontSize: 12 },
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
  return pdf.lastAutoTable.finalY + 20;
}

/**
 * Download the business activity report.
 * @param {object} report { name, codes, descriptions, label, filterValue, rows }
 */
export async function downloadBusinessPdf(report) {
  const jsPDF = await loadJsPdf();
  const pdf = new jsPDF("landscape", "pt", "a5");
  drawBusinessReport(pdf, report);
  await addQrCode(pdf, businessQrUrl(report.name));
  pdf.save("BusinessActivity.pdf");
}

// ---------------------------------------------------------------- adverts

/**
 * Label/value rows describing an advert quote, with empty values removed.
 * @param {object} quote { advertType, rates, length, width, numberOfSides, renewalFee, newApplicantFee }
 * @param {object} options { showDimensions = true }
 */
export function advertRows(quote, { showDimensions = true } = {}) {
  const money = (value) => formatKES(value, { blankZero: true });
  const { advertType, rates = {}, length, width, numberOfSides } = quote;
  const rows = [
    ["Advertisement Category", rates.advertisementCategory || ""],
    ["Advert", advertType || ""],
    ["Application Fee (New Applicant)", money(rates.applicationFee)],
    ...(showDimensions
      ? [["Dimensions (Length × Width)", `${length || "N/A"} m × ${width || "N/A"} m`]]
      : []),
    ...(SIDE_ADVERT_TYPES.includes(advertType) ? [["Number of Sides", numberOfSides || 1]] : []),
    ["First m²", money(rates.firstSquareMetres)],
    ["First 3m²", money(rates.firstThreeMetres)],
    ["First 10m²", money(rates.firstTenSquareMetres)],
    ["Each Extra m²", money(rates.extraSquareMetres)],
    ["Licence Fee (Renewal)", money(quote.renewalFee)],
    ["Licence Fee (New Applicant)", money(quote.newApplicantFee)],
  ];
  return rows.filter(([, value]) => value !== "" && value !== undefined);
}

async function createAdvertPdf(quote, options) {
  const jsPDF = await loadJsPdf();
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [300, 450] });
  pdf.setFontSize(20);
  pdf.setFont("Times", "Roman");
  pdf.setFillColor(WHITE);
  pdf.rect(0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height, "F");
  pdf.setTextColor(GREEN);
  pdf.text("UBPMadeEasy", 35, 50);

  pdf.autoTable({
    startY: 75,
    startX: (pdf.internal.pageSize.width - 270) / 2,
    margin: { top: 10, right: 10, bottom: 40, left: 30 },
    head: [["Advert", ""]],
    body: advertRows(quote, options),
    theme: "striped",
    styles: { textColor: GREEN, font: "Arial", fontStyle: "normal", fontSize: 10 },
    headStyles: { fillColor: WHITE, textColor: WHITE, fontStyle: "bold", fontSize: 12 },
    columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 150 } },
  });
  await addQrCode(pdf, advertQrUrl(quote.advertType));
  return pdf;
}

/** Download an advert licence quote. */
export async function downloadAdvertPdf(quote) {
  const pdf = await createAdvertPdf(quote);
  pdf.save("Advert.pdf");
}

// ---------------------------------------------------------------- agent

/**
 * Build the agent's PDF and return an object URL for it. Advert-only answers
 * use the advert layout; anything with a business uses the business report
 * with an advert summary appended.
 */
export async function createAgentPdfUrl({ business, advert }) {
  let pdf;
  if (!business && advert) {
    const showDimensions = advert.length !== 1 || advert.width !== 1;
    pdf = await createAdvertPdf(advert, { showDimensions });
  } else {
    const jsPDF = await loadJsPdf();
    pdf = new jsPDF("landscape", "pt", "a5");
    let currentY = drawBusinessReport(pdf, business);
    if (advert) {
      const money = (value) => formatKES(value, { blankZero: true }) || "N/A";
      const line = (text, gap = 16) => {
        pdf.text(text, 40, currentY);
        currentY += gap;
      };
      pdf.setFont("Times", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(GREEN);
      line("Advertisement Summary", 24);
      pdf.setFont("Times", "normal");
      pdf.setFontSize(12);
      line(`Advert: ${advert.advertType}`);
      line(`Category: ${advert.rates.advertisementCategory || "N/A"}`);
      line(`Dimensions: ${advert.length}m x ${advert.width}m`);
      if (advert.numberOfSides > 1) line(`Number of Sides: ${advert.numberOfSides}`);
      line(`Application Fee: ${formatKES(advert.rates.applicationFee, { blankZero: true })}`);
      line(`First m²: ${money(advert.rates.firstSquareMetres)}`);
      line(`First 3m²: ${money(advert.rates.firstThreeMetres)}`);
      line(`First 10m²: ${money(advert.rates.firstTenSquareMetres)}`);
      line(`Each Extra m²: ${money(advert.rates.extraSquareMetres)}`);
      line(`Licence Fee (Renewal): ${money(advert.renewalFee)}`);
      line(`Licence Fee (New Applicant): ${money(advert.newApplicantFee)}`, 20);
    }
    await addQrCode(pdf, `${SITE_URL}/`);
  }
  return URL.createObjectURL(pdf.output("blob"));
}
