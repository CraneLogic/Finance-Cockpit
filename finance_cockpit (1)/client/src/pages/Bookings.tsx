import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { craneLedgerClient } from "@/lib/craneLedgerClient";
import { EZYCRANE_ENTITY_ID } from "@/config";
import type { BookingSummary } from "@/lib/types";

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadBookings();
  }, [statusFilter, fromDate, toDate]);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: { status?: string; fromDate?: string; toDate?: string } = {};
      
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (fromDate) {
        filters.fromDate = fromDate;
      }
      if (toDate) {
        filters.toDate = toDate;
      }

      const data = await craneLedgerClient.getBookings(EZYCRANE_ENTITY_ID, filters);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
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
    return new Date(dateString).toLocaleDateString("en-AU");
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

  const handleRowClick = (bookingId: string) => {
    setLocation(`/bookings/${bookingId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Bookings</h2>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">From Date</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">To Date</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Booking ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        External ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                        Deposit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                        Balance
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                        Margin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        onClick={() => handleRowClick(booking.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {booking.id.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {booking.externalBookingId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {booking.customer}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {booking.supplier}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-900">
                          {formatCurrency(booking.depositAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-900">
                          {formatCurrency(booking.balanceAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                          {formatCurrency(booking.totalJobAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                          {formatCurrency(booking.marginAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDate(booking.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
