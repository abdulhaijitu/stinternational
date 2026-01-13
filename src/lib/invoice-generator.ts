import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string | null;
  items: InvoiceItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  language?: "en" | "bn";
}

const formatPrice = (amount: number, language: "en" | "bn" = "en"): string => {
  return `BDT ${amount.toLocaleString(language === "bn" ? "bn-BD" : "en-BD")}`;
};

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF();
  const lang = data.language || "en";
  
  // Company branding colors
  const primaryColor: [number, number, number] = [26, 43, 60]; // Deep navy
  const accentColor: [number, number, number] = [245, 158, 11]; // Warm amber
  const textColor: [number, number, number] = [51, 51, 51];
  const mutedColor: [number, number, number] = [102, 102, 102];

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header - Company Logo/Name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ST INTERNATIONAL", margin, 28);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Industrial & Scientific Equipment Supplier", margin, 36);

  // Invoice Title
  yPos = 60;
  doc.setTextColor(...accentColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(lang === "bn" ? "INVOICE / চালান" : "INVOICE", pageWidth - margin, yPos, { align: "right" });

  // Invoice details (right side)
  yPos += 12;
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const invoiceDetails = [
    { label: lang === "bn" ? "চালান নং" : "Invoice #", value: data.orderNumber },
    { label: lang === "bn" ? "তারিখ" : "Date", value: new Date(data.orderDate).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US") },
  ];

  invoiceDetails.forEach((detail, index) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${detail.label}:`, pageWidth - margin - 50, yPos + (index * 7), { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(detail.value, pageWidth - margin, yPos + (index * 7), { align: "right" });
  });

  // Company Info (left side)
  yPos = 55;
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(lang === "bn" ? "প্রেরক:" : "From:", margin, yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  const companyInfo = [
    "ST International",
    "123 Industrial Zone, Tejgaon",
    "Dhaka 1208, Bangladesh",
    "Phone: +880 1234-567890",
    "Email: sales@stinternational.com",
  ];
  
  companyInfo.forEach((line, index) => {
    doc.text(line, margin, yPos + 7 + (index * 5));
  });

  // Customer Info
  yPos = 95;
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(lang === "bn" ? "প্রাপক:" : "Bill To:", margin, yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  const customerInfo = [
    data.customerName,
    data.companyName || "",
    data.shippingAddress,
    data.shippingCity + (data.shippingPostalCode ? `, ${data.shippingPostalCode}` : ""),
    `Phone: ${data.customerPhone}`,
    `Email: ${data.customerEmail}`,
  ].filter(Boolean);
  
  customerInfo.forEach((line, index) => {
    doc.text(line, margin, yPos + 7 + (index * 5));
  });

  // Items Table
  yPos = 140;
  
  const tableHeaders = lang === "bn" 
    ? [["পণ্য", "SKU", "পরিমাণ", "একক দাম", "মোট"]]
    : [["Product", "SKU", "Qty", "Unit Price", "Total"]];

  const tableData = data.items.map(item => [
    item.name,
    item.sku || "-",
    item.quantity.toString(),
    formatPrice(item.unitPrice, lang),
    formatPrice(item.totalPrice, lang),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: "plain",
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  yPos = finalY + 15;

  // Totals section
  const totalsX = pageWidth - margin - 80;
  const valuesX = pageWidth - margin;

  doc.setFontSize(10);
  doc.setTextColor(...textColor);

  // Subtotal
  doc.setFont("helvetica", "normal");
  doc.text(lang === "bn" ? "সাবটোটাল:" : "Subtotal:", totalsX, yPos, { align: "right" });
  doc.text(formatPrice(data.subtotal, lang), valuesX, yPos, { align: "right" });

  // Shipping
  yPos += 8;
  doc.text(lang === "bn" ? "শিপিং:" : "Shipping:", totalsX, yPos, { align: "right" });
  doc.text(formatPrice(data.shippingCost, lang), valuesX, yPos, { align: "right" });

  // Line
  yPos += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 20, yPos, valuesX, yPos);

  // Total
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(lang === "bn" ? "মোট:" : "Total:", totalsX, yPos, { align: "right" });
  doc.text(formatPrice(data.total, lang), valuesX, yPos, { align: "right" });

  // Payment Method
  yPos += 20;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  
  const paymentLabels: Record<string, string> = {
    cash_on_delivery: lang === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery",
    bank_transfer: lang === "bn" ? "ব্যাংক ট্রান্সফার" : "Bank Transfer",
    online_payment: lang === "bn" ? "অনলাইন পেমেন্ট" : "Online Payment",
  };
  
  doc.text(
    `${lang === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}: ${paymentLabels[data.paymentMethod] || data.paymentMethod}`,
    margin,
    yPos
  );

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(
    lang === "bn" 
      ? "ধন্যবাদ আপনার ব্যবসার জন্য! | Thank you for your business!"
      : "Thank you for your business!",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.text(
    "www.stinternational.com | sales@stinternational.com",
    pageWidth / 2,
    footerY + 6,
    { align: "center" }
  );

  return doc;
};

export const downloadInvoice = (data: InvoiceData): void => {
  const doc = generateInvoicePDF(data);
  doc.save(`Invoice-${data.orderNumber}.pdf`);
};
