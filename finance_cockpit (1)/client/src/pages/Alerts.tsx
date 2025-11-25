import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { aiCfoClient } from "@/lib/aiCfoClient";
import { EZYCRANE_ENTITY_ID } from "@/config";
import type { CfoAlert, AlertSeverity } from "@/lib/aiCfoTypes";
import { toast } from "sonner";

export default function Alerts() {
  const [alerts, setAlerts] = useState<CfoAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unacknowledgedOnly, setUnacknowledgedOnly] = useState(true);
  const [acknowledgingIds, setAcknowledgingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAlerts();
  }, [unacknowledgedOnly]);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await aiCfoClient.getAlerts(EZYCRANE_ENTITY_ID, {
        unacknowledgedOnly,
      });
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    setAcknowledgingIds((prev) => new Set(prev).add(id));

    try {
      await aiCfoClient.acknowledgeAlert(id);
      toast.success("Alert acknowledged");
      
      // Remove from list or reload
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    } catch (err) {
      toast.error("Failed to acknowledge alert");
      console.error("Failed to acknowledge alert:", err);
    } finally {
      setAcknowledgingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "INFO":
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "INFO":
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "CASHFLOW":
        return "bg-purple-100 text-purple-800";
      case "GST":
        return "bg-orange-100 text-orange-800";
      case "MARGIN":
        return "bg-green-100 text-green-800";
      case "DEPOSITS":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-AU");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Alerts</h2>
          <div className="flex items-center gap-2">
            <Switch
              id="unacknowledged-only"
              checked={unacknowledgedOnly}
              onCheckedChange={setUnacknowledgedOnly}
            />
            <Label htmlFor="unacknowledged-only" className="cursor-pointer">
              Show unacknowledged only
            </Label>
          </div>
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
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-slate-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">No alerts found</p>
                <p className="text-sm mt-1">
                  {unacknowledgedOnly
                    ? "All alerts have been acknowledged"
                    : "No alerts to display"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getCategoryColor(
                              alert.category
                            )}`}
                          >
                            {alert.category}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{alert.body}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!alert.acknowledgedAt ? (
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgingIds.has(alert.id)}
                        >
                          {acknowledgingIds.has(alert.id) ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Acknowledging...
                            </>
                          ) : (
                            "Acknowledge"
                          )}
                        </Button>
                      ) : (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Acknowledged
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
