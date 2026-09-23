import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import {
  CalendarCheck,
  X,
  User,
  CreditCard,
  DollarSign,
  DoorClosed,
  Calendar,
  Sparkles,
  Printer,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

export const BookingDetailsModal: React.FC = () => {
  const {
    selectedBookingId,
    setSelectedBookingId,
    bookings,
    rooms,
    checkInBooking,
    checkOutBooking,
    cancelBooking,
    recordPayment,
    showToast,
  } = useHotel();

  const [isAiMessageOpen, setIsAiMessageOpen] = useState(false);
  const [aiMessageDraft, setAiMessageDraft] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!selectedBookingId) return null;

  const booking = bookings.find((b) => b.id === selectedBookingId);
  if (!booking) return null;

  const room = rooms.find((r) => r.roomNumber === booking.roomNumber);

  const handleDraftMessage = async (messageType: string) => {
    setIsGeneratingAi(true);
    setIsAiMessageOpen(true);
    try {
      const response = await fetch("/api/ai/draft-guest-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: booking.guestName,
          vipTier: "Gold",
          roomNumber: booking.roomNumber,
          roomType: booking.roomType,
          purpose: messageType,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          specialRequests: booking.specialRequests,
        }),
      });

      const data = await response.json();
      setAiMessageDraft(data.draft || "Draft prepared.");
    } catch (err) {
      console.error("AI Draft error", err);
      setAiMessageDraft(`Dear ${booking.guestName},\n\nWe look forward to hosting you in Room ${booking.roomNumber}. Please let the concierge know if we can prepare anything for your arrival.\n\nWarm regards,\nFront Office`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSettleFullFolio = () => {
    recordPayment({
      bookingId: booking.id,
      guestName: booking.guestName,
      amount: booking.totalAmount,
      method: "Credit Card",
      status: "Success",
      date: new Date().toISOString().split("T")[0],
      description: `Full folio settlement for stay in Room ${booking.roomNumber}`,
    });
    showToast(`Folio for ${booking.guestName} settled in full ($${booking.totalAmount})`, "success");
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={() => setSelectedBookingId(null)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-800 rounded-lg">
              {booking.id}
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{booking.guestName}</h3>
              <p className="text-[11px] text-slate-500">Reservation Folio & Master Ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                booking.status === "Checked-In"
                  ? "bg-emerald-100 text-emerald-800"
                  : booking.status === "Confirmed"
                  ? "bg-blue-100 text-blue-800"
                  : booking.status === "Checked-Out"
                  ? "bg-slate-100 text-slate-700"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {booking.status}
            </span>
            <button
              onClick={() => setSelectedBookingId(null)}
              className="text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Room Assigned</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Room {booking.roomNumber}</div>
              <span className="text-[11px] text-slate-500 truncate block">{booking.roomType}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Stay Duration</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{booking.nights} Nights</div>
              <span className="text-[11px] text-slate-500">{booking.guestsCount} Guests</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Check-In</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{booking.checkInDate}</div>
              <span className="text-[11px] text-slate-500">From 14:00</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Check-Out</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{booking.checkOutDate}</div>
              <span className="text-[11px] text-slate-500">By 11:00</span>
            </div>
          </div>

          {/* Guest Contact & Channel */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Guest Details</span>
              <span className="text-[11px] text-slate-500 font-normal">Channel: {booking.source}</span>
            </div>
            <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>Email: <strong className="text-slate-900">{booking.guestEmail || "N/A"}</strong></div>
              <div>Phone: <strong className="text-slate-900">{booking.guestPhone || "N/A"}</strong></div>
            </div>
            {booking.specialRequests && (
              <div className="mt-2 text-xs p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <strong>Special Request:</strong> {booking.specialRequests}
              </div>
            )}
          </div>

          {/* Folio Billing Breakdown */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Guest Folio & Charges</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                booking.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                Payment: {booking.paymentStatus}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
              <div className="flex justify-between">
                <span>Room Charges ({booking.nights} nights @ ${room?.ratePerNight || Math.round(booking.totalAmount / booking.nights)}/night)</span>
                <span className="font-semibold text-slate-900">${booking.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hospitality Tax & Tourism Assessment (Included)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm text-slate-900">
                <span>Master Total Balance</span>
                <span>${booking.totalAmount}</span>
              </div>
            </div>

            {booking.paymentStatus !== "Paid" && (
              <button
                onClick={handleSettleFullFolio}
                className="w-full min-h-[42px] py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" /> Settle Full Folio (${booking.totalAmount})
              </button>
            )}
          </div>

          {/* AI Guest Communications Tool */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Concierge Guest Assistant</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDraftMessage("Pre-Arrival Welcome")}
                  className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 text-xs font-semibold transition-colors border border-indigo-200"
                >
                  Draft Welcome
                </button>
                <button
                  onClick={() => handleDraftMessage("Departure & Folio Invoice")}
                  className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 text-xs font-semibold transition-colors border border-indigo-200"
                >
                  Draft Check-out Note
                </button>
              </div>
            </div>

            {isAiMessageOpen && (
              <div className="bg-white p-3 rounded-xl border border-indigo-100 text-xs space-y-2">
                {isGeneratingAi ? (
                  <div className="text-slate-400 italic py-2">Drafting personalized letter with Gemini...</div>
                ) : (
                  <>
                    <textarea
                      rows={5}
                      value={aiMessageDraft}
                      onChange={(e) => setAiMessageDraft(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-sm sm:text-xs font-sans focus:outline-hidden"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiMessageDraft);
                          showToast("Copied letter to clipboard", "info");
                        }}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                      >
                        Copy Draft
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            {booking.status === "Confirmed" && (
              <button
                onClick={() => cancelBooking(booking.id)}
                className="text-xs min-h-[40px] text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
              >
                Cancel Reservation
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {booking.status === "Confirmed" && (
              <button
                onClick={() => checkInBooking(booking.id)}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Complete Check-In
              </button>
            )}

            {booking.status === "Checked-In" && (
              <button
                onClick={() => checkOutBooking(booking.id)}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Process Check-Out
              </button>
            )}

            <button
              onClick={() => setSelectedBookingId(null)}
              className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white active:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
