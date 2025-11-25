import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, Users, FileText, TrendingUp, Wallet } from "lucide-react";
import { craneLedgerClient } from "@/lib/craneLedgerClient";
import { EZYCRANE_ENTITY_ID } from "@/config";
import type { Entity, TrialBalanceResponse, PnLResponse } from "@/lib/types";

export default function Dashboard() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState(EZYCRANE_ENTITY_ID);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [pnl, setPnl] = useState<PnLResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    if (selectedEntityId) {
      loadDashboardData();
    }
  }, [selectedEntityId]);

  const loadEntities = async () => {
    try {
      const data = await craneLedgerClient.getEntities();
      setEntities(data);
    } catch (err) {
      console.error("Failed to load entities:", err);
      // Continue with default entity even if entities list fails
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const [tbData, pnlData] = await Promise.all([
        craneLedgerClient.getTrialBalance(selectedEntityId, today),
        craneLedgerClient.getPnL(selectedEntityId, thirtyDaysAgo, today),
      ]);

      setTrialBalance(tbData);
      setPnl(pnlData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getAccountBalance = (accountCode: string): number => {
    if (!trialBalance) return 0;
    const entry = trialBalance.entries.find((e) => e.accountCode === accountCode);
    return entry?.balance ?? 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const kpis = [
    {
      title: "Cash (Bank / Clearing)",
      value: formatCurrency(getAccountBalance("110")),
      icon: Wallet,
      description: "Account 110",
    },
    {
      title: "Customer Deposits Held",
      value: formatCurrency(getAccountBalance("800")),
      icon: Users,
      description: "Account 800",
    },
    {
      title: "Accounts Receivable",
      value: formatCurrency(getAccountBalance("112")),
      icon: FileText,
      description: "Account 112",
    },
    {
      title: "Margin (Last 30 Days)",
      value: formatCurrency(pnl?.grossMargin ?? 0),
      icon: TrendingUp,
      description: "Revenue minus COGS",
    },
    {
      title: "Net Result (Last 30 Days)",
      value: formatCurrency(pnl?.netResult ?? 0),
      icon: DollarSign,
      description: "Total profit/loss",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Entity Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          {entities.length > 0 && (
            <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">
                        {kpi.title}
                      </CardTitle>
                      <Icon className="h-5 w-5 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900">
                        {kpi.value}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {kpi.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Revenue Chart Placeholder */}
            {pnl && (
              <Card>
                <CardHeader>
                  <CardTitle>Last 30 Days Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(pnl.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Total COGS</span>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(pnl.totalCogs)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Gross Margin</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(pnl.grossMargin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-sm font-medium text-slate-600">Net Result</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(pnl.netResult)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
