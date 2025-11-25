import { describe, it, expect, beforeEach, vi } from "vitest";
import { craneLedgerClient } from "./craneLedgerClient";

// Mock fetch globally
global.fetch = vi.fn();

describe("CraneLedger API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch entities successfully", async () => {
    const mockEntities = [
      { id: "1", name: "Entity 1" },
      { id: "2", name: "Entity 2" },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntities,
    });

    const result = await craneLedgerClient.getEntities();
    expect(result).toEqual(mockEntities);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/entities")
    );
  });

  it("should fetch trial balance successfully", async () => {
    const mockTrialBalance = {
      entityId: "test-id",
      asOf: "2024-01-01",
      entries: [
        { accountCode: "110", accountName: "Cash", debit: 1000, credit: 0, balance: 1000 },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrialBalance,
    });

    const result = await craneLedgerClient.getTrialBalance("test-id", "2024-01-01");
    expect(result).toEqual(mockTrialBalance);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/entities/test-id/trial-balance?asOf=2024-01-01")
    );
  });

  it("should fetch P&L successfully", async () => {
    const mockPnL = {
      entityId: "test-id",
      from: "2024-01-01",
      to: "2024-01-31",
      revenue: [],
      cogs: [],
      expenses: [],
      totalRevenue: 10000,
      totalCogs: 5000,
      totalExpenses: 2000,
      grossMargin: 5000,
      netResult: 3000,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPnL,
    });

    const result = await craneLedgerClient.getPnL("test-id", "2024-01-01", "2024-01-31");
    expect(result).toEqual(mockPnL);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/entities/test-id/pnl?from=2024-01-01&to=2024-01-31")
    );
  });

  it("should fetch bookings with filters", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        customer: "Customer A",
        supplier: "Supplier B",
        status: "CONFIRMED" as const,
        depositAmount: 1000,
        balanceAmount: 2000,
        totalJobAmount: 3000,
        marginAmount: 500,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBookings,
    });

    const result = await craneLedgerClient.getBookings("test-id", {
      status: "CONFIRMED",
      fromDate: "2024-01-01",
    });

    expect(result).toEqual(mockBookings);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("entityId=test-id")
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("status=CONFIRMED")
    );
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(craneLedgerClient.getEntities()).rejects.toThrow(
      "CraneLedger API error: 404 Not Found"
    );
  });

  it("should handle network errors gracefully", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    await expect(craneLedgerClient.getEntities()).rejects.toThrow(
      "Failed to fetch from CraneLedger: Network error"
    );
  });
});
