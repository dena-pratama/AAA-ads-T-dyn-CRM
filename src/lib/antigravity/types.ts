// Antigravity Report Types

export interface OrderRecord {
  orderId: string;
  orderCreatedTime?: Date;
  totalSettlement?: number;
  totalRevenue?: number;
  totalFees?: number;
  type?: string;
  // Kelola fields
  productName?: string;
  quantity?: number;
  status?: string;
  rawData?: Record<string, unknown>;
}

export interface DailyBreakdown {
  date: string; // YYYY-MM-DD
  totalOrders: number;
  totalSettlement: number;
  totalRevenue: number;
  totalFees: number;
  orders: MatchedOrder[];
}

export interface MatchedOrder {
  orderId: string;
  orderCreatedTime: Date;
  totalSettlement: number;
  totalRevenue: number;
  totalFees: number;
  type: string;
  productName?: string;
  quantity?: number;
  status?: string;
}

export interface UnmatchedRecord {
  orderId: string;
  source: "kelola" | "income";
  rawData: Record<string, unknown>;
}

export interface SummaryGlobal {
  totalOrders: number;
  totalMatchedOrders: number;
  totalUnmatchedKelola: number;
  totalUnmatchedIncome: number;
  totalSettlement: number;
  totalRevenue: number;
  totalFees: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface SummaryDaily {
  date: string;
  totalOrders: number;
  totalSettlement: number;
  totalRevenue: number;
  totalFees: number;
}

export interface ProcessReportResult {
  summaryGlobal: SummaryGlobal;
  summaryDaily: SummaryDaily[];
  dailyTables: DailyBreakdown[];
  unmatchedKelola: UnmatchedRecord[];
  unmatchedIncome: UnmatchedRecord[];
}
