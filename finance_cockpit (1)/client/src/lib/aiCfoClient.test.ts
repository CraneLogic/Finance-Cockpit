import { describe, it, expect, beforeEach, vi } from "vitest";
import { aiCfoClient } from "./aiCfoClient";

// Mock fetch globally
global.fetch = vi.fn();

describe("AI-CFO API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch entities successfully", async () => {
    const mockEntities = [
      { id: "1", ledgerEntityId: "ledger-1", name: "Entity 1" },
      { id: "2", ledgerEntityId: "ledger-2", name: "Entity 2" },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEntities,
    });

    const result = await aiCfoClient.getEntities();
    expect(result).toEqual(mockEntities);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/entities"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("should fetch daily brief successfully", async () => {
    const mockBrief = {
      ledgerEntityId: "test-id",
      asOf: "2024-01-01",
      cash: 50000,
      runwayDays: 180,
      depositsHeld: 25000,
      gstExposure: 5000,
      marginPctCurrent: 35.5,
      marginPctPrevious: 32.0,
      marginTrendDelta: 3.5,
      narrative: "Strong performance this month",
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBrief,
    });

    const result = await aiCfoClient.getBrief("test-id");
    expect(result).toEqual(mockBrief);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/entities/test-id/brief"),
      expect.any(Object)
    );
  });

  it("should fetch alerts with filters", async () => {
    const mockAlerts = [
      {
        id: "alert-1",
        ledgerEntityId: "test-id",
        severity: "WARNING" as const,
        category: "CASHFLOW" as const,
        title: "Low cash warning",
        body: "Cash is running low",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlerts,
    });

    const result = await aiCfoClient.getAlerts("test-id", { unacknowledgedOnly: true });
    expect(result).toEqual(mockAlerts);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("unacknowledged=true"),
      expect.any(Object)
    );
  });

  it("should acknowledge alert successfully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await aiCfoClient.acknowledgeAlert("alert-1");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/alerts/alert-1/ack"),
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should fetch recommendations with status filter", async () => {
    const mockRecommendations = [
      {
        id: "rec-1",
        ledgerEntityId: "test-id",
        type: "ADJUSTMENT_JOURNAL" as const,
        status: "PENDING" as const,
        title: "Adjust GST reserve",
        description: "Increase GST reserve",
        impact: {
          gst: 1000,
          description: "Increase GST reserve by $1000",
        },
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRecommendations,
    });

    const result = await aiCfoClient.getRecommendations("test-id", "PENDING");
    expect(result).toEqual(mockRecommendations);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("status=PENDING"),
      expect.any(Object)
    );
  });

  it("should approve recommendation successfully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await aiCfoClient.approveRecommendation("rec-1");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/recommendations/rec-1/approve"),
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should reject recommendation with reason", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await aiCfoClient.rejectRecommendation("rec-1", "Not needed");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/recommendations/rec-1/reject"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ reason: "Not needed" }),
      })
    );
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    await expect(aiCfoClient.getEntities()).rejects.toThrow(
      "AI-CFO API error: 500 Internal Server Error"
    );
  });

  it("should handle network errors gracefully", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    await expect(aiCfoClient.getBrief("test-id")).rejects.toThrow(
      "Failed to fetch from AI-CFO: Network error"
    );
  });
});
