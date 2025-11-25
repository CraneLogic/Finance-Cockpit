// Entity types
export interface Entity {
  id: string;
  name: string;
  type?: string;
  createdAt?: string;
}

// Trial Balance types
export interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceResponse {
  entityId: string;
  asOf: string;
  entries: TrialBalanceEntry[];
}

// P&L types
export interface PnLEntry {
  accountCode: string;
  accountName: string;
  amount: number;
  category?: string;
}

export interface PnLResponse {
  entityId: string;
  from: string;
  to: string;
  revenue: PnLEntry[];
  cogs: PnLEntry[];
  expenses: PnLEntry[];
  totalRevenue: number;
  totalCogs: number;
  totalExpenses: number;
  grossMargin: number;
  netResult: number;
}

// Balance Sheet types
export interface BalanceSheetEntry {
  accountCode: string;
  accountName: string;
  amount: number;
  category?: string;
}

export interface BalanceSheetResponse {
  entityId: string;
  asOf: string;
  assets: BalanceSheetEntry[];
  liabilities: BalanceSheetEntry[];
  equity: BalanceSheetEntry[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

// Booking types
export interface BookingSummary {
  id: string;
  externalBookingId?: string;
  customer: string;
  supplier: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  depositAmount: number;
  balanceAmount: number;
  totalJobAmount: number;
  marginAmount: number;
  createdAt: string;
}

export interface BookingEvent {
  id: string;
  type: string;
  date: string;
  amount: number;
  journalEntryId?: string;
  description?: string;
}

export interface BookingDetails {
  id: string;
  externalBookingId?: string;
  customer: string;
  supplier: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  depositAmount: number;
  balanceAmount: number;
  totalJobAmount: number;
  marginAmount: number;
  createdAt: string;
  events: BookingEvent[];
  revenue: number;
  cogs: number;
  grossMargin: number;
}

// API error type
export interface ApiError {
  message: string;
  status?: number;
}
