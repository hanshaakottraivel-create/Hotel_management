import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import { PaymentTransaction } from "../types";
import {
  CreditCard,
  Plus,
  DollarSign,
  TrendingUp,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ShieldCheck,
  Download,
  X,
} from "lucide-react";

export const PaymentsView: React.FC = () => {
  const {
    payments,
    bookings,
    addPayment,
    showToast,
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("All");

  // Record payment modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [amount, setAmount] = useState(250);
  const [method, setMethod] = useState<"Credit Card" | "Apple Pay" | "Bank Transfer" | "Cash">("Credit Card");
  const [type, setType] = useState<"Room Charge" | "Deposit" | "Incidentals" | "Restaurant" | "Spa" | "Refund">("Incidentals");

  const totalCollected = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments.filter((p) => p.status === "Pending").length;

  const filteredPayments = payments.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchGuest = p.guestName.toLowerCase().includes(q);
      const matchBooking = p.reservationId.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      const matchType = p.type.toLowerCase().includes(q);
      if (!matchGuest && !matchBooking && !matchId && !matchType) return false;
    }

    if (methodFilter !== "All" && p.method !== methodFilter) return false;

    return true;
  });

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const booking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];
    if (!booking) return;

    addPayment({
      reservationId: booking.id,
      guestName: booking.guestName,
      roomNumber: booking.roomNumber,
      amount: Number(amount),
      type,
      method,
      status: "Completed",
    });

    setIsRecordModalOpen(false);
  };

  const handlePrintReceipt = (p: PaymentTransaction) => {
    showToast(`Receipt for ${p.id} generated and ready for print`, "info");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Payments, Billing & Guest Folios
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            PCI-compliant payment transaction logs, folio adjustments, and multi-channel revenue settlement.
          </p>
        </div>

        <button
          id="btn-record-payment"
          onClick={() => {
            if (bookings.length > 0) setSelectedBookingId(bookings[0].id);
            setIsRecordModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Record Payment / Charge
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Settled</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">${totalCollected.toLocaleString()}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">{payments.length} total transactions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway Status</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">Operational</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Stripe / Terminal connected</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Settlement</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{pendingCount} transactions</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Batch closes tonight 23:59</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] w-full sm:w-auto sm:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payment by guest, booking, ID..."
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 w-full sm:w-auto">
          <span className="shrink-0">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="flex-1 sm:flex-initial text-xs py-2 px-3 min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Payment Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Transactions Table for Desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Guest & Booking</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">{p.id}</td>
                    <td className="py-3.5 px-4 text-slate-500">{p.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.guestName}</div>
                      <div className="text-[11px] text-indigo-600 font-mono">{p.reservationId} (Room {p.roomNumber})</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{p.type}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${p.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          p.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handlePrintReceipt(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List for Transactions */}
      <div className="block md:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No payment records found.
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-slate-900">{p.guestName}</div>
                  <div className="text-[11px] text-indigo-600 font-mono mt-0.5">
                    {p.reservationId} • Room {p.roomNumber}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    p.status === "Completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : p.status === "Pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Amount</span>
                  <span className="font-bold text-slate-900 text-sm">${p.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Method & Type</span>
                  <span className="text-slate-700 font-medium truncate block">{p.method} • {p.type}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="font-mono text-[11px]">{p.id} • {p.date}</span>
                <button
                  onClick={() => handlePrintReceipt(p)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsRecordModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Record Folio Transaction</h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 active:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associate Reservation
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.guestName} (Room {b.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Apple Pay">Apple Pay</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Charge Category / Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                >
                  <option value="Room Charge">Room Charge</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Incidentals">Incidentals</option>
                  <option value="Restaurant">Restaurant / In-Room Dining</option>
                  <option value="Spa">Spa & Wellness</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold"
                >
                  Process Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
