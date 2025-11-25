import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { aiCfoClient } from "@/lib/aiCfoClient";
import { EZYCRANE_ENTITY_ID } from "@/config";
import type { CfoRecommendation, RecommendationStatus } from "@/lib/aiCfoTypes";
import { toast } from "sonner";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<CfoRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RecommendationStatus>("PENDING");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<CfoRecommendation | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadRecommendations();
  }, [activeTab]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await aiCfoClient.getRecommendations(EZYCRANE_ENTITY_ID, activeTab);
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));

    try {
      await aiCfoClient.approveRecommendation(id);
      toast.success("Recommendation approved successfully");
      
      // Remove from list
      setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
    } catch (err) {
      toast.error("Failed to approve recommendation");
      console.error("Failed to approve recommendation:", err);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const openRejectDialog = (recommendation: CfoRecommendation) => {
    setSelectedRecommendation(recommendation);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRecommendation) return;

    const id = selectedRecommendation.id;
    setProcessingIds((prev) => new Set(prev).add(id));
    setRejectDialogOpen(false);

    try {
      await aiCfoClient.rejectRecommendation(id, rejectionReason || undefined);
      toast.success("Recommendation rejected");
      
      // Remove from list
      setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
    } catch (err) {
      toast.error("Failed to reject recommendation");
      console.error("Failed to reject recommendation:", err);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSelectedRecommendation(null);
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "ADJUSTMENT_JOURNAL":
        return "bg-blue-100 text-blue-800";
      case "CASH_RESERVE_MOVE":
        return "bg-purple-100 text-purple-800";
      case "GST_RESERVE":
        return "bg-orange-100 text-orange-800";
      case "MARGIN_OPTIMIZATION":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-AU");
  };

  const renderImpactItem = (label: string, value: number | undefined) => {
    if (value === undefined) return null;
    
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">{label}</span>
        <div className={`flex items-center gap-1 ${colorClass}`}>
          <Icon className="h-4 w-4" />
          <span className="font-medium">{formatCurrency(Math.abs(value))}</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <h2 className="text-2xl font-bold text-slate-900">Recommendations</h2>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RecommendationStatus)}>
          <TabsList>
            <TabsTrigger value="PENDING">
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="APPLIED">
              <CheckCircle className="h-4 w-4 mr-2" />
              Applied
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : recommendations.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-slate-500">
                    <p className="text-lg font-medium">No {activeTab.toLowerCase()} recommendations</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getTypeColor(
                                rec.type
                              )}`}
                            >
                              {rec.type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{rec.description}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Created: {formatDate(rec.createdAt)}
                          </p>
                          {rec.appliedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Applied: {formatDate(rec.appliedAt)}
                            </p>
                          )}
                          {rec.rejectedAt && (
                            <p className="text-xs text-red-600 mt-1">
                              Rejected: {formatDate(rec.rejectedAt)}
                              {rec.rejectionReason && ` - ${rec.rejectionReason}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Impact Summary */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Impact Summary</h4>
                          <p className="text-sm text-slate-600 mb-3">{rec.impact.description}</p>
                          <div className="space-y-2 bg-slate-50 p-3 rounded">
                            {renderImpactItem("Cash Impact", rec.impact.cash)}
                            {renderImpactItem("Equity Impact", rec.impact.equity)}
                            {renderImpactItem("GST Impact", rec.impact.gst)}
                            {renderImpactItem("Margin Impact", rec.impact.margin)}
                          </div>
                        </div>

                        {/* Action Buttons (only for PENDING) */}
                        {activeTab === "PENDING" && (
                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              onClick={() => handleApprove(rec.id)}
                              disabled={processingIds.has(rec.id)}
                              className="flex-1"
                            >
                              {processingIds.has(rec.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => openRejectDialog(rec)}
                              disabled={processingIds.has(rec.id)}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Recommendation</DialogTitle>
              <DialogDescription>
                Optionally provide a reason for rejecting this recommendation.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason (optional)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReject}>
                Reject Recommendation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
