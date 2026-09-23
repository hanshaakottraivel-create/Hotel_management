import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import { RoomType, BookingSource } from "../types";
import { CalendarCheck, X, DollarSign, Calendar, User, BedDouble } from "lucide-react";

export const NewBookingModal: React.FC = () => {
  const {
    isNewBookingOpen,
    setIsNewBookingOpen,
    rooms,
    createBooking,
  } = useHotel();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(
    rooms.find((r) => r.status === "Vacant Clean")?.roomNumber || rooms[0]?.roomNumber || "101"
  );
  const [checkInDate, setCheckInDate] = useState("2026-09-15");
  const [checkOutDate, setCheckOutDate] = useState("2026-09-18");
  const [guestsCount, setGuestsCount] = useState(2);
  const [source, setSource] = useState<BookingSource>("Direct");
  const [specialRequests, setSpecialRequests] = useState("");

  if (!isNewBookingOpen) return null;

  const selectedRoom = rooms.find((r) => r.roomNumber === selectedRoomNumber);
  const ratePerNight = selectedRoom?.ratePerNight || 179;

  // Calculate nights
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffTime = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = diffTime * ratePerNight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !selectedRoom) return;

    createBooking({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      guestPhone: guestPhone.trim() || "+1 (555) 019-900",
      roomNumber: selectedRoom.roomNumber,
      roomType: selectedRoom.type,
      checkInDate,
      checkOutDate,
      nights: diffTime,
      guestsCount,
      totalAmount,
      source,
      specialRequests: specialRequests.trim() || undefined,
    });

    setIsNewBookingOpen(false);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={() => setIsNewBookingOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Create New Reservation</h3>
          </div>
          <button
            onClick={() => setIsNewBookingOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Guest Information */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Primary Guest
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Katherine Pierce"
                className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="katherine@example.com"
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+1 (555) 432-8901"
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Stay & Room Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Stay & Room Allocation
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Check-In</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Check-Out</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Assignment</label>
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.roomNumber}>
                      Room {r.roomNumber} - {r.type} (${r.ratePerNight}/nt) [{r.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guests</label>
                <input
                  type="number"
                  min={1}
                  max={selectedRoom?.maxGuests || 4}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as BookingSource)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                >
                  <option value="Direct">Direct</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Expedia">Expedia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Folio</label>
                <div className="w-full px-3 py-2.5 min-h-[42px] text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 flex items-center justify-between">
                  <span>${totalAmount}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({diffTime} nights)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requests</label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. High floor, anniversary champagne, extra hypoallergenic pillows"
                className="w-full px-3 py-2.5 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewBookingOpen(false)}
              className="flex-1 sm:flex-initial min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
