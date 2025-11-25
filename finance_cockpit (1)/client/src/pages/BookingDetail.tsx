import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, DollarSign } from "lucide-react";
import { craneLedgerClient } from "@/lib/craneLedgerClient";
import type { BookingDetails } from "@/lib/types";

export default function BookingDetail() {
  const [, params] = useRoute("/bookings/:id");
  const [, setLocation] = useLocation();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      loadBookingDetails(params.id);
    }
  }, [params?.id]);

  const loadBookingDetails = async (bookingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await craneLedgerClient.getBookingDetails(bookingId);
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking details");
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-AU");
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setLocation("/bookings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bookings
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">Booking Details</h2>
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
        ) : booking ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Booking ID</label>
                      <p className="text-sm text-slate-900 mt-1">{booking.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">External ID</label>
                      <p className="text-sm text-slate-900 mt-1">
                        {booking.externalBookingId || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Customer</label>
                      <p className="text-sm text-slate-900 mt-1">{booking.customer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Supplier</label>
                      <p className="text-sm text-slate-900 mt-1">{booking.supplier}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Status</label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Created</label>
                      <p className="text-sm text-slate-900 mt-1">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Deposit Amount</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        {formatCurrency(booking.depositAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Balance Amount</label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        {formatCurrency(booking.balanceAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Total Job Amount</label>
                      <p className="text-lg font-semibold text-blue-600 mt-1">
                        {formatCurrency(booking.totalJobAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Margin Amount</label>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        {formatCurrency(booking.marginAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Events Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Events Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.events.length === 0 ? (
                    <p className="text-sm text-slate-500">No events recorded</p>
                  ) : (
                    <div className="space-y-4">
                      {booking.events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900">
                                {event.type}
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {formatCurrency(event.amount)}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDate(event.date)}
                            </p>
                            {event.description && (
                              <p className="text-sm text-slate-600 mt-1">
                                {event.description}
                              </p>
                            )}
                            {event.journalEntryId && (
                              <p className="text-xs text-slate-400 mt-1">
                                Journal Entry: {event.journalEntryId}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Mini P&L */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Booking P&L
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Revenue</label>
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {formatCurrency(booking.revenue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Supplier Payout (COGS)
                    </label>
                    <p className="text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(booking.cogs)}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-slate-600">Gross Margin</label>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {formatCurrency(booking.grossMargin)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {booking.revenue > 0
                        ? `${((booking.grossMargin / booking.revenue) * 100).toFixed(1)}% margin`
                        : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
