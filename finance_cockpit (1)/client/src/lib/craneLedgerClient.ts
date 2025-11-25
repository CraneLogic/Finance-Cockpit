import { CRANE_LEDGER_BASE_URL } from "../config";
import type {
  Entity,
  TrialBalanceResponse,
  PnLResponse,
  BalanceSheetResponse,
  BookingSummary,
  BookingDetails,
} from "./types";

class CraneLedgerClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(
          `CraneLedger API error: ${response.status} ${response.statusText}`
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from CraneLedger: ${error.message}`);
      }
      throw new Error("Failed to fetch from CraneLedger: Unknown error");
    }
  }

  async getEntities(): Promise<Entity[]> {
    return this.fetch<Entity[]>("/entities");
  }

  async getTrialBalance(
    entityId: string,
    asOf: string
  ): Promise<TrialBalanceResponse> {
    return this.fetch<TrialBalanceResponse>(
      `/entities/${entityId}/trial-balance?asOf=${asOf}`
    );
  }

  async getPnL(
    entityId: string,
    from: string,
    to: string
  ): Promise<PnLResponse> {
    return this.fetch<PnLResponse>(
      `/entities/${entityId}/pnl?from=${from}&to=${to}`
    );
  }

  async getBalanceSheet(
    entityId: string,
    asOf: string
  ): Promise<BalanceSheetResponse> {
    return this.fetch<BalanceSheetResponse>(
      `/entities/${entityId}/balance-sheet?asOf=${asOf}`
    );
  }

  async getBookings(
    entityId: string,
    filters?: {
      status?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<BookingSummary[]> {
    const params = new URLSearchParams({ entityId });
    
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.fromDate) {
      params.append("fromDate", filters.fromDate);
    }
    if (filters?.toDate) {
      params.append("toDate", filters.toDate);
    }
    
    return this.fetch<BookingSummary[]>(`/bookings?${params.toString()}`);
  }

  async getBookingDetails(bookingId: string): Promise<BookingDetails> {
    return this.fetch<BookingDetails>(`/bookings/${bookingId}`);
  }
}

// Export a singleton instance
export const craneLedgerClient = new CraneLedgerClient(CRANE_LEDGER_BASE_URL);
