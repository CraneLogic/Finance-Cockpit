import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { craneLedgerClient } from "@/lib/craneLedgerClient";
import { EZYCRANE_ENTITY_ID } from "@/config";
import type { PnLResponse, BalanceSheetResponse } from "@/lib/types";

type TimePeriod = "7days" | "30days" | "quarter" | "year";

export default function Reports() {
  const [period, setPeriod] = useState<TimePeriod>("30days");
  const [pnl, setPnl] = useState<PnLResponse | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [period]);

  const getDateRange = (period: TimePeriod): { from: string; to: string } => {
    const today = new Date();
    const to = today.toISOString().split("T")[0];
    let from: Date;

    switch (period) {
      case "7days":
        from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        from = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return {
      from: from.toISOString().split("T")[0],
      to,
    };
  };

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const { from, to } = getDateRange(period);
      const today = new Date().toISOString().split("T")[0];

      const [pnlData, bsData] = await Promise.all([
        craneLedgerClient.getPnL(EZYCRANE_ENTITY_ID, from, to),
        craneLedgerClient.getBalanceSheet(EZYCRANE_ENTITY_ID, today),
      ]);

      setPnl(pnlData);
      setBalanceSheet(bsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case "7days":
        return "Last 7 Days";
      case "30days":
        return "Last 30 Days";
      case "quarter":
        return "This Quarter";
      case "year":
        return "This Year";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Period Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <Select value={period} onValueChange={(value) => setPeriod(value as TimePeriod)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L Summary */}
            {pnl && (
              <Card>
                <CardHeader>
                  <CardTitle>Profit & Loss Summary</CardTitle>
                  <p className="text-sm text-slate-500">{getPeriodLabel(period)}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue</h3>
                    <div className="space-y-2">
                      {pnl.revenue.map((entry) => (
                        <div key={entry.accountCode} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {entry.accountCode} - {entry.accountName}
                          </span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(entry.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span className="text-slate-700">Total Revenue</span>
                        <span className="text-green-600">
                          {formatCurrency(pnl.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COGS Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                      Cost of Goods Sold
                    </h3>
                    <div className="space-y-2">
                      {pnl.cogs.map((entry) => (
                        <div key={entry.accountCode} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {entry.accountCode} - {entry.accountName}
                          </span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(entry.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span className="text-slate-700">Total COGS</span>
                        <span className="text-red-600">
                          {formatCurrency(pnl.totalCogs)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gross Margin */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-slate-700">Gross Margin</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(pnl.grossMargin)}
                      </span>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  {pnl.expenses.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Expenses</h3>
                      <div className="space-y-2">
                        {pnl.expenses.map((entry) => (
                          <div key={entry.accountCode} className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              {entry.accountCode} - {entry.accountName}
                            </span>
                            <span className="font-medium text-slate-900">
                              {formatCurrency(entry.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                          <span className="text-slate-700">Total Expenses</span>
                          <span className="text-red-600">
                            {formatCurrency(pnl.totalExpenses)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Result */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-slate-900">Net Result</span>
                      <span
                        className={`text-xl font-bold ${
                          pnl.netResult >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(pnl.netResult)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Balance Sheet */}
            {balanceSheet && (
              <Card>
                <CardHeader>
                  <CardTitle>Balance Sheet</CardTitle>
                  <p className="text-sm text-slate-500">As of Today</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Assets Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Assets</h3>
                    <div className="space-y-2">
                      {balanceSheet.assets.map((entry) => (
                        <div key={entry.accountCode} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {entry.accountCode} - {entry.accountName}
                          </span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(entry.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span className="text-slate-700">Total Assets</span>
                        <span className="text-blue-600">
                          {formatCurrency(balanceSheet.totalAssets)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Liabilities</h3>
                    <div className="space-y-2">
                      {balanceSheet.liabilities.map((entry) => (
                        <div key={entry.accountCode} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {entry.accountCode} - {entry.accountName}
                          </span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(entry.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span className="text-slate-700">Total Liabilities</span>
                        <span className="text-red-600">
                          {formatCurrency(balanceSheet.totalLiabilities)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Equity Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Equity</h3>
                    <div className="space-y-2">
                      {balanceSheet.equity.map((entry) => (
                        <div key={entry.accountCode} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {entry.accountCode} - {entry.accountName}
                          </span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(entry.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                        <span className="text-slate-700">Total Equity</span>
                        <span className="text-green-600">
                          {formatCurrency(balanceSheet.totalEquity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Check */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-slate-900">
                        Liabilities + Equity
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(
                          balanceSheet.totalLiabilities + balanceSheet.totalEquity
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Should equal Total Assets:{" "}
                      {formatCurrency(balanceSheet.totalAssets)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
