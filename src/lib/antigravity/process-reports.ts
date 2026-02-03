import * as XLSX from "xlsx";
import {
  OrderRecord,
  ProcessReportResult,
  DailyBreakdown,
  MatchedOrder,
  UnmatchedRecord,
  SummaryGlobal,
  SummaryDaily,
} from "./types";

/**
 * Process Kelola and Income XLSX files from TikTok Seller Center
 * Returns matched orders grouped by date with summary statistics
 */
export async function processReports(
  kelolaBuffer: ArrayBuffer,
  incomeBuffer: ArrayBuffer
): Promise<ProcessReportResult> {
  // Parse files
  const kelolaRecords = parseKelolaFile(kelolaBuffer);
  const incomeRecords = parseIncomeFile(incomeBuffer);

  // Create lookup maps
  const kelolaMap = new Map<string, OrderRecord>();
  kelolaRecords.forEach((record) => {
    kelolaMap.set(record.orderId, record);
  });

  const incomeMap = new Map<string, OrderRecord>();
  incomeRecords.forEach((record) => {
    incomeMap.set(record.orderId, record);
  });

  // Match orders
  const matchedOrders: MatchedOrder[] = [];
  const unmatchedKelola: UnmatchedRecord[] = [];
  const unmatchedIncome: UnmatchedRecord[] = [];
  const processedIncomeIds = new Set<string>();

  // Process Kelola records and find matches in Income
  kelolaRecords.forEach((kelolaOrder) => {
    const incomeOrder = incomeMap.get(kelolaOrder.orderId);

    if (incomeOrder) {
      processedIncomeIds.add(kelolaOrder.orderId);
      matchedOrders.push({
        orderId: kelolaOrder.orderId,
        orderCreatedTime: incomeOrder.orderCreatedTime || new Date(),
        totalSettlement: incomeOrder.totalSettlement || 0,
        totalRevenue: incomeOrder.totalRevenue || 0,
        totalFees: incomeOrder.totalFees || 0,
        type: incomeOrder.type || "Order",
        productName: kelolaOrder.productName,
        quantity: kelolaOrder.quantity,
        status: kelolaOrder.status,
      });
    } else {
      unmatchedKelola.push({
        orderId: kelolaOrder.orderId,
        source: "kelola",
        rawData: kelolaOrder.rawData || {},
      });
    }
  });

  // Find unmatched Income records
  incomeRecords.forEach((incomeOrder) => {
    if (!processedIncomeIds.has(incomeOrder.orderId)) {
      unmatchedIncome.push({
        orderId: incomeOrder.orderId,
        source: "income",
        rawData: incomeOrder.rawData || {},
      });
    }
  });

  // Group by date
  const dailyMap = new Map<string, DailyBreakdown>();

  matchedOrders.forEach((order) => {
    const dateKey = formatDateKey(order.orderCreatedTime);

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        totalOrders: 0,
        totalSettlement: 0,
        totalRevenue: 0,
        totalFees: 0,
        orders: [],
      });
    }

    const daily = dailyMap.get(dateKey)!;
    daily.totalOrders++;
    daily.totalSettlement += order.totalSettlement;
    daily.totalRevenue += order.totalRevenue;
    daily.totalFees += order.totalFees;
    daily.orders.push(order);
  });

  // Sort daily tables by date
  const dailyTables = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Generate summaries
  const summaryDaily: SummaryDaily[] = dailyTables.map((d) => ({
    date: d.date,
    totalOrders: d.totalOrders,
    totalSettlement: d.totalSettlement,
    totalRevenue: d.totalRevenue,
    totalFees: d.totalFees,
  }));

  const summaryGlobal: SummaryGlobal = {
    totalOrders: kelolaRecords.length + incomeRecords.length,
    totalMatchedOrders: matchedOrders.length,
    totalUnmatchedKelola: unmatchedKelola.length,
    totalUnmatchedIncome: unmatchedIncome.length,
    totalSettlement: matchedOrders.reduce((sum, o) => sum + o.totalSettlement, 0),
    totalRevenue: matchedOrders.reduce((sum, o) => sum + o.totalRevenue, 0),
    totalFees: matchedOrders.reduce((sum, o) => sum + o.totalFees, 0),
    dateRange: {
      from: dailyTables[0]?.date || "",
      to: dailyTables[dailyTables.length - 1]?.date || "",
    },
  };

  return {
    summaryGlobal,
    summaryDaily,
    dailyTables,
    unmatchedKelola,
    unmatchedIncome,
  };
}

/**
 * Parse Kelola XLSX file
 * - Header is row 1
 * - Row 2 is description (skip)
 * - Data starts from row 3
 * - Order ID column name varies
 */
function parseKelolaFile(buffer: ArrayBuffer): OrderRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  // Get all data as array of arrays
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][];

  if (data.length < 3) {
    return [];
  }

  // Row 0 = headers, Row 1 = descriptions (skip), Row 2+ = data
  const headers = (data[0] as string[]).map((h) =>
    typeof h === "string" ? h.trim() : String(h)
  );

  // Find Order ID column (may have different names)
  const orderIdIndex = findColumnIndex(headers, [
    "Order ID",
    "ID Pesanan",
    "No. Pesanan",
    "Order/adjustment ID",
  ]);

  const productNameIndex = findColumnIndex(headers, [
    "Product Name",
    "Nama Produk",
    "Produk",
  ]);

  const quantityIndex = findColumnIndex(headers, [
    "Quantity",
    "Jumlah",
    "Qty",
  ]);

  const statusIndex = findColumnIndex(headers, [
    "Status",
    "Order Status",
    "Status Pesanan",
  ]);

  const records: OrderRecord[] = [];

  // Start from row 2 (index 2) to skip description row
  for (let i = 2; i < data.length; i++) {
    const row = data[i] as unknown[];
    const orderId = orderIdIndex >= 0 ? String(row[orderIdIndex] || "").trim() : "";

    if (!orderId) continue;

    const rawData: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      rawData[h] = row[idx];
    });

    records.push({
      orderId,
      productName: productNameIndex >= 0 ? String(row[productNameIndex] || "") : undefined,
      quantity: quantityIndex >= 0 ? Number(row[quantityIndex]) || 0 : undefined,
      status: statusIndex >= 0 ? String(row[statusIndex] || "") : undefined,
      rawData,
    });
  }

  return records;
}

/**
 * Parse Income XLSX file
 * - Sheet "Order details"
 * - Headers have trailing spaces (need trim)
 * - Columns: Order/adjustment ID, Order created time, Total settlement amount, etc.
 */
function parseIncomeFile(buffer: ArrayBuffer): OrderRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });

  // Find "Order details" sheet
  let sheetName = workbook.SheetNames.find((name) =>
    name.toLowerCase().includes("order details")
  );

  // Fallback to first sheet if not found
  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const rawData = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  }) as Record<string, unknown>[];

  if (rawData.length === 0) {
    return [];
  }

  // Trim all headers (Income file has trailing spaces)
  const trimmedData = rawData.map((row) => {
    const trimmedRow: Record<string, unknown> = {};
    Object.entries(row).forEach(([key, value]) => {
      trimmedRow[key.trim()] = value;
    });
    return trimmedRow;
  });

  const records: OrderRecord[] = [];

  trimmedData.forEach((row) => {
    // Find Order ID column
    const orderId = findValue(row, [
      "Order/adjustment ID",
      "Order ID",
      "ID Pesanan",
    ]);

    if (!orderId) return;

    // Parse date
    const orderCreatedTimeRaw = findValue(row, [
      "Order created time",
      "Waktu Pesanan Dibuat",
      "Created Time",
    ]);
    const orderCreatedTime = parseDate(orderCreatedTimeRaw);

    // Parse amounts
    const totalSettlement = parseNumber(
      findValue(row, [
        "Total settlement amount",
        "Total Settlement",
        "Jumlah Penyelesaian",
      ])
    );
    const totalRevenue = parseNumber(
      findValue(row, ["Total Revenue", "Revenue", "Pendapatan"])
    );
    const totalFees = parseNumber(
      findValue(row, ["Total Fees", "Fees", "Biaya Total"])
    );
    const type = findValue(row, ["Type", "Tipe"]) || "Order";

    records.push({
      orderId: String(orderId).trim(),
      orderCreatedTime,
      totalSettlement,
      totalRevenue,
      totalFees,
      type: String(type),
      rawData: row,
    });
  });

  return records;
}

// Helper functions

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const idx = headers.findIndex(
      (h) => h.toLowerCase() === name.toLowerCase()
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

function findValue(
  row: Record<string, unknown>,
  possibleKeys: string[]
): string | undefined {
  for (const key of possibleKeys) {
    const lowerKey = key.toLowerCase();
    const found = Object.entries(row).find(
      ([k]) => k.toLowerCase() === lowerKey
    );
    if (found && found[1] !== "" && found[1] !== undefined) {
      return String(found[1]);
    }
  }
  return undefined;
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  // Remove currency symbols, commas, spaces
  const cleaned = value.replace(/[^\d.-]/g, "");
  return parseFloat(cleaned) || 0;
}

function parseDate(value: string | undefined): Date {
  if (!value) return new Date();

  // Try different date formats
  // Format: "2024-01-15 10:30:00" or "15/01/2024" or Excel serial number
  if (typeof value === "number") {
    // Excel serial date
    return excelDateToJSDate(value);
  }

  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try DD/MM/YYYY format
  const parts = value.split(/[\/\-]/);
  if (parts.length === 3) {
    const d = Number(parts[0]);
    const m = Number(parts[1]);
    const y = Number(parts[2]);
    if (y && y > 1900 && m && d) {
      return new Date(y, m - 1, d);
    }
  }

  return new Date();
}

function excelDateToJSDate(serial: number): Date {
  // Excel dates are days since 1900-01-01
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
}

function formatDateKey(date: Date): string {
  const isoString = date.toISOString().split("T")[0];
  return isoString || "1970-01-01"; // YYYY-MM-DD
}
