import * as XLSX from "xlsx";
import { SHOPEE_SPEC } from "./platforms/shopee";

/** ===== Types ===== */
export type ShopeeDailyOrderRow = {
  orderId: string;
  status?: string;
  productName?: string;
  quantity?: number;
};

export type ShopeeDailySettlementRow = {
  orderId: string;
  type?: string;
  settlementAmount: number; // Net received
  revenue: number;          // Gross info
  fees: number;             // Fee info
};

export type ShopeeProcessResult = {
  summaryGlobal: {
    totalOrderKelola: number;
    totalSettlementFound: number;
    orderWithoutSettlement: number;
    settlementWithoutKelola: number;
    totalSettlementAmount: number;
    totalRevenue: number;
    totalFees: number;
    totalNetRevenue: number;
    totalIncomeRowSettlement?: number;
    totalIncomeRowRevenue?: number;
  };
  summaryDaily: Array<{
    date: string; // YYYY-MM-DD
    totalOrders: number;
    totalMatchedSettlementOrders: number;
    totalSettlement: number;
    totalRevenue: number;
    totalFees: number;
    totalNetRevenue: number;
  }>;
  dailyOrders: Record<string, ShopeeDailyOrderRow[]>;
  dailySettlements: Record<string, ShopeeDailySettlementRow[]>;
  kelolaUnmatched: string[];
  incomeUnmatched: string[];
};

/** ===== Helpers ===== */
function readWorkbook(buffer: Buffer) {
  return XLSX.read(buffer, { type: "buffer" });
}

function normalizeHeader(s: any): string {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function resolveSheetName(wb: XLSX.WorkBook, preferred: string, fallbackContains: string = "") {
  const names = wb.SheetNames;
  const preferredNorm = normalizeHeader(preferred);
  
  // Exact match
  const foundPreferred = names.find((n) => normalizeHeader(n) === preferredNorm);
  if (foundPreferred) return foundPreferred;

  // Contains match (case insensitive)
  if (fallbackContains) {
    const fallbackNorm = normalizeHeader(fallbackContains);
    const foundFallback = names.find((n) => normalizeHeader(n).includes(fallbackNorm));
    if (foundFallback) return foundFallback;
  }
  
  // Last resort: first sheet
  return names[0] || "";
}

function sheetToRows(sheet: XLSX.WorkSheet): Record<string, any>[] {
  // raw: false ensures everything is read as string/formatted text
  // This helps with large Order IDs that Excel might parse as Scientific Notation Numbers
  return XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null, raw: false });
}

function resolveColumn(headers: string[], candidates: string[]): string | null {
  // 1. Exact match (Normalized)
  const map = new Map<string, string>(); 
  for (const h of headers) map.set(normalizeHeader(h), h);

  for (const c of candidates) {
    const norm = normalizeHeader(c);
    const got = map.get(norm);
    if (got) return got;
  }

  // 2. Fuzzy match (Contains)
  for (const c of candidates) {
    const norm = normalizeHeader(c);
    // Find header that includes the candidate string
    const found = headers.find(h => normalizeHeader(h).includes(norm));
    if (found) return found;
  }
  
  return null;
}

function toDateKey(v: any): string | null {
  if (!v) return null;

  try {
    // 1. Handle Excel Serial Date (Number)
    if (typeof v === "number" && Number.isFinite(v)) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const d = new Date(excelEpoch.getTime() + v * 24 * 60 * 60 * 1000);
      return d.toISOString().substring(0, 10);
    }

    const s = String(v).trim();
    if (!s) return null;

    // 2. Handle Strings
    // YYYY-MM-DD
    if (s.match(/^\d{4}-\d{2}-\d{2}/)) {
      return s.substring(0, 10);
    }
    
    // DD-MM-YYYY or DD/MM/YYYY
    const parts = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if (parts) {
      const d = new Date(Date.UTC(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1])));
      if (!Number.isNaN(d.getTime())) return d.toISOString().substring(0, 10);
    }
    
    // Fallback: Try standard Date parse (e.g. "Jan 1, 2023")
    const fallback = new Date(s);
    if (!Number.isNaN(fallback.getTime())) {
        return fallback.toISOString().substring(0, 10);
    }
    
  } catch (e) {
    return null;
  }
  return null;
}

function toNumberCurrencySafe(v: any): number {
  if (v == null || v === "") return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;

  let s = String(v).trim();
  if (!s) return 0;

  // Cleanup: Remove currency symbols and non-numeric chars except dot, comma, minus
  s = s.replace(/[^\d.,-]/g, "");

  // Detect format:
  // If dot is thousand separator and comma is decimal (e.g. 10.000,00) -> ID style
  // If comma is thousand separator and dot is decimal (e.g. 10,000.00) -> US style
  
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");

  if (lastComma > lastDot) {
    // Likely ID style: 1.000,00 or 100,00
    // Remove dots, replace comma with dot
    s = s.replace(/\./g, "").replace(/,/g, ".");
  } else if (lastDot > lastComma) {
    // Likely US style: 1,000.00
    // Remove commas
    s = s.replace(/,/g, "");
  }
  
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}


function normalizeId(id: any): string {
    // Aggressive normalization: Strip everything except A-Z and 0-9
    // This fixes issues with hidden spaces, hyphens vs en-dashes, etc.
    return String(id || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

/** ===== Core Engine ===== */
export function processShopeeReports(orderBuffer: Buffer, incomeBuffer: Buffer): ShopeeProcessResult {
  const { kelola, income } = SHOPEE_SPEC;

  // --- 1. Parsing Kelola (Orders) ---
  const orderWb = readWorkbook(orderBuffer);
  console.log("Shopee Debug: Order Sheets Found:", orderWb.SheetNames);
  
  const orderSheetName = resolveSheetName(orderWb, kelola.sheetName, "order");
  console.log("Shopee Debug: Selected Order Sheet:", orderSheetName);

  const orderSheet = orderWb.Sheets[orderSheetName];
  if (!orderSheet) throw new Error(`Sheet '${kelola.sheetName}' tidak ditemukan di file Orders. Available: ${orderWb.SheetNames.join(", ")}`);

  const orderRows = sheetToRows(orderSheet);
  const firstOrderRow = orderRows[0];
  const orderHeaders = firstOrderRow ? Object.keys(firstOrderRow) : [];
  console.log("Shopee Debug: Order Headers Found:", orderHeaders);

  // Validate required columns
  const orderIdCol = resolveColumn(orderHeaders, [kelola.orderId]);
  const createdCol = resolveColumn(orderHeaders, [kelola.createdTime]);
  
  if (!orderIdCol) throw new Error(`Shopee Order: kolom '${kelola.orderId}' tidak ditemukan. Headers: ${orderHeaders.join(", ")}`);
  if (!createdCol) throw new Error(`Shopee Order: kolom '${kelola.createdTime}' tidak ditemukan. Headers: ${orderHeaders.join(", ")}`);

  // Optional columns
  const colProduct = resolveColumn(orderHeaders, [kelola.productName]);
  const colQty = resolveColumn(orderHeaders, [kelola.quantity]);
  const colStatus = resolveColumn(orderHeaders, [kelola.status]);

  // Indexing: OrderID -> Date
  const orderDateMap = new Map<string, string>(); 
  const dailyOrders: Record<string, ShopeeDailyOrderRow[]> = {};

  for (const row of orderRows) {
    const rawId = row[orderIdCol];
    const id = normalizeId(rawId);
    if (!id) continue;

    const date = toDateKey(row[createdCol]);
    if (!date) continue; // Skip invalid dates

    if (!orderDateMap.has(id)) {
      orderDateMap.set(id, date);
    }

    dailyOrders[date] = dailyOrders[date] || [];
    dailyOrders[date].push({
      orderId: id,
      status: colStatus ? String(row[colStatus] || "") : undefined,
      productName: colProduct ? String(row[colProduct] || "") : undefined,
      quantity: colQty ? toNumberCurrencySafe(row[colQty]) : undefined,
    });
  }

  // --- 2. Parsing Income (Settlement) ---
  const incomeWb = readWorkbook(incomeBuffer);
  console.log("Shopee Debug: Income Sheets Found:", incomeWb.SheetNames);

  const incomeSheetName = resolveSheetName(incomeWb, income.sheetName, "income");
  console.log("Shopee Debug: Selected Income Sheet:", incomeSheetName);

  const incomeSheet = incomeWb.Sheets[incomeSheetName];
  if (!incomeSheet) throw new Error(`Sheet '${income.sheetName}' tidak ditemukan di file Income. Available: ${incomeWb.SheetNames.join(", ")}`);

  // Read as AoA to find header row
  const incomeAoA = XLSX.utils.sheet_to_json<any[]>(incomeSheet, { header: 1, range: 0 });
  
  let headerRowIndex = -1;
  let incomeHeaders: string[] = [];

  // Candidate markers to identify header row
  const headerMarkers = ["No. Pesanan", "Total Penghasilan"];

  for (let i = 0; i < Math.min(incomeAoA.length, 20); i++) {
    const row = incomeAoA[i];
    if (!Array.isArray(row)) continue;
    
    // Check if this row contains ALL markers (Fuzzy check)
    // We check if each required marker exists as a substring in at least one cell of the row
    const rowStr = row.map(c => normalizeHeader(c));
    const allFound = headerMarkers.every(marker => {
        const mNorm = normalizeHeader(marker);
        return rowStr.some(cell => cell.includes(mNorm));
    });
    
    if (allFound) {
      headerRowIndex = i;
      incomeHeaders = row.map(c => String(c || "").trim());
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(`Shopee Income: Tidak dapat menemukan baris header. Pastikan ada kolom: ${headerMarkers.join(", ")}`);
  }

  console.log(`Shopee Debug: Found Income Header at Row ${headerRowIndex + 1}:`, incomeHeaders);

  // Re-read with strict header offset
  const incomeRowsRaw = XLSX.utils.sheet_to_json<Record<string, any>>(incomeSheet, { 
    range: headerRowIndex,
    defval: null,
    raw: false // Critical: Read as strings to avoid scientific notation on IDs
  });

  // Resolve Columns
  const colIncOrderId = resolveColumn(incomeHeaders, ["No. Pesanan", "Order ID"]);
  const colIncSettlement = resolveColumn(incomeHeaders, ["Total Penghasilan", "Total Income"]);
  
  // Resolve Date Column for fallback
  const colIncDate = resolveColumn(incomeHeaders, ["Tanggal Penghasilan", "Waktu Transaksi", "Date", "Waktu"]);

  // Revenue Candidates
  const revenueCandidates = [
    "Harga Asli Produk",
    "Product Price", 
    "Harga Produk",
    "Harga Barang",
    "Total Harga Produk",
    "Jumlah Harga Produk",
    "Product Amount",
    "Order Amount"
  ];
  const colIncRevenue = resolveColumn(incomeHeaders, revenueCandidates);
  
  console.log("Shopee Debug: Revenue Column Search:");
  console.log("  - Candidates:", revenueCandidates);
  console.log("  - Found:", colIncRevenue || "NOT FOUND");
  
  // Fee Columns to sum
  const feeCandidates = [
    "Biaya Komisi AMS",
    "Biaya Administrasi",
    "Biaya Layanan",
    "Biaya Proses Pesanan",
    "Premi",
    "Biaya Program Hemat Biaya Kirim",
    "Biaya Transaksi",
    "Biaya Kampanye",
    "Bea Masuk, PPN & PPh"
  ];
  const feeCols = feeCandidates.map(c => resolveColumn(incomeHeaders, [c])).filter(c => c !== null) as string[];

  console.log("Shopee Debug: Fee Columns Found:", feeCols);

  if (!colIncOrderId) throw new Error(`Shopee Income: Kolom 'No. Pesanan' tidak ditemukan.`);
  if (!colIncSettlement) throw new Error(`Shopee Income: Kolom 'Total Penghasilan' tidak ditemukan.`);

  // Grouping Income by Order ID
  const incomeMap = new Map<string, { settlement: number, revenue: number, fees: number, type?: string, date?: string }>();
  let totalIncomeRowSettlement = 0;
  let totalIncomeRowRevenue = 0;

  for (const row of incomeRowsRaw) {
    const rawId = row[colIncOrderId];
    const id = normalizeId(rawId);
    // Note: normalizeId strips special chars. If 'No. Pesanan' header is repeated in data, it becomes 'NOPESANAN'.
    // We skip if empty or if it looks like a header repetition.
    if (!id || id === "NOPESANAN") continue;

    // Settlement = Total Penghasilan
    let settlement = toNumberCurrencySafe(row[colIncSettlement]);
    if (Number.isNaN(settlement)) {
       settlement = 0;
    }
    
    totalIncomeRowSettlement += settlement;

    // Fees = Sum of identified fee columns
    let fees = 0;
    for (const col of feeCols) {
        const val = toNumberCurrencySafe(row[col]);
        fees += val || 0;
    }

    // Revenue (Strict Logic)
    let revenue = 0;
    
    // 1. Strict Priority: "Harga Asli Produk" Column
    if (colIncRevenue) {
        revenue = toNumberCurrencySafe(row[colIncRevenue]);
    }
    
    // 2. Fallback ONLY if column missing or zero
    if (revenue === 0) {
        if (settlement !== 0 || fees !== 0) {
             revenue = Math.abs(settlement) + Math.abs(fees);
        }
    }
    
    totalIncomeRowRevenue += revenue;

    // Type is "Order" default
    const type = "Order";
    
    // Date fallback
    let incomeDate: string | undefined;
    if (colIncDate) {
        const d = toDateKey(row[colIncDate]);
        if (d) incomeDate = d;
    }

    const prev = incomeMap.get(id) || { settlement: 0, revenue: 0, fees: 0, type, date: incomeDate };
    incomeMap.set(id, {
      settlement: prev.settlement + settlement,
      revenue: prev.revenue + revenue,
      fees: prev.fees + fees,
      type: type || prev.type,
      date: prev.date || incomeDate
    });
  }

  // --- 3. Matching & Daily Aggregation ---
  const dailySettlements: Record<string, ShopeeDailySettlementRow[]> = {};
  const matchedIncIds = new Set<string>();
  const kelolaUnmatched: string[] = [];
  const incomeUnmatchedIds: string[] = [];

  // 1. Scan Kelola Orders (Primary Match)
  orderDateMap.forEach((date, id) => {
    const inc = incomeMap.get(id);
    if (inc) {
      // Matched
      matchedIncIds.add(id);
      
      dailySettlements[date] = dailySettlements[date] || [];
      dailySettlements[date].push({
        orderId: id,
        type: inc.type,
        settlementAmount: inc.settlement,
        revenue: inc.revenue,
        fees: inc.fees
      });
    } else {
      // Unmatched Kelola
      kelolaUnmatched.push(id);
    }
  });
  
  console.log(`Shopee Debug: Matching Stats - Orders: ${orderDateMap.size}, Income: ${incomeMap.size}, Matched: ${matchedIncIds.size}`);

  // 2. Scan Income for Unmatched (Fallback)
  incomeMap.forEach((inc, id) => {
    if (!orderDateMap.has(id)) {
      // It's unmatched
      incomeUnmatchedIds.push(id);
      
      // FALLBACK: Use Income Date if available to show in breakdown
      if (inc.date) {
        const d = inc.date; // Capture safe string
        dailySettlements[d] = dailySettlements[d] || [];
        dailySettlements[d].push({
           orderId: id,
           type: (inc.type || "Order") + " (Unmatched)",
           settlementAmount: inc.settlement,
           revenue: inc.revenue,
           fees: inc.fees
        });
      }
    }
  });

  // --- 4. Summaries ---
  const dates = Array.from(new Set([
    ...Object.keys(dailyOrders), 
    ...Object.keys(dailySettlements)
  ])).sort();

  const summaryDaily = dates.map(date => {
    const orders = dailyOrders[date] || [];
    const settles = dailySettlements[date] || [];

    const totalSettlement = settles.reduce((acc, curr) => acc + curr.settlementAmount, 0);
    const totalRevenue = settles.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalFees = settles.reduce((acc, curr) => acc + curr.fees, 0);

    return {
      date,
      totalOrders: orders.length, 
      totalMatchedSettlementOrders: settles.length,
      totalSettlement,
      totalRevenue,
      totalFees,
      totalNetRevenue: totalSettlement 
    };
  });

  // Global
  // User Request: Use Raw Sums from Income File
  const finalTotalSettlement = totalIncomeRowSettlement || 0;
  const finalTotalRevenue = totalIncomeRowRevenue || 0;
  
  // Fees can be summed from daily/row iteration too, but aggregating from mapped items is close enough roughly
  // Actually, let's just sum from the income loop for 100% accuracy too if needed, 
  // but usually fees are derived from matched items. 
  // For consistency with "Raw Sums", we should probably sum all fees found in income rows too.
  // But current implementation sums from `summaryDaily` which includes the Unmatched Fallbacks now.
  const totalFees = summaryDaily.reduce((acc, d) => acc + d.totalFees, 0);

  return {
    summaryGlobal: {
      totalOrderKelola: orderDateMap.size,
      totalSettlementFound: matchedIncIds.size,
      orderWithoutSettlement: kelolaUnmatched.length,
      settlementWithoutKelola: incomeUnmatchedIds.length,
      totalSettlementAmount: finalTotalSettlement, 
      totalRevenue: finalTotalRevenue, // Use raw sum
      totalFees,
      totalNetRevenue: finalTotalSettlement,
      totalIncomeRowSettlement,
      totalIncomeRowRevenue
    },
    summaryDaily,
    dailyOrders,
    dailySettlements,
    kelolaUnmatched,
    incomeUnmatched: incomeUnmatchedIds
  };
}
