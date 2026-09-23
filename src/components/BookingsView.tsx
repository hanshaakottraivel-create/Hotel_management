import React, { useState, useMemo } from "react";
import { useHotel } from "../context/HotelContext";
import { Booking, BookingStatus } from "../types";
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  User,
  XCircle,
  LogIn,
  LogOut,
} from "lucide-react";

export const BookingsView: React.FC = () => {
  const {
    bookings,
    checkInBooking,
    checkOutBooking,
    cancelBooking,
    setSelectedBookingId,
    setIsNewBookingOpen,
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.guestName.toLowerCase().includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        const matchRoom = b.roomNumber.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRoom) return false;
      }

      if (statusFilter !== "All" && b.status !== statusFilter) {
        return false;
      }

      if (sourceFilter !== "All" && b.source !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [bookings, searchQuery, statusFilter, sourceFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            Bookings & Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {bookings.length} reservations on record. Filter by guest status, view guest folios, and process check-ins.
          </p>
        </div>

        <button
          id="btn-create-booking-page"
          onClick={() => setIsNewBookingOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Reservation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] w-full sm:w-auto sm:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest, ID, room..."
            className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {["All", "Confirmed", "Checked-In", "Checked-Out", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-medium transition-all ${
                statusFilter === status
                  ? "bg-indigo-600 text-white shadow-2xs font-semibold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 active:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Source Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-start">
          <span>Channel:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs py-2 px-3 min-h-[38px] rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Channels</option>
            <option value="Direct">Direct</option>
            <option value="Corporate">Corporate</option>
            <option value="Booking.com">Booking.com</option>
            <option value="Expedia">Expedia</option>
          </select>
        </div>
      </div>

      {/* Bookings Mobile Card List (visible on screens < md) */}
      <div className="md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No reservations found matching the filters.
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span
                  onClick={() => setSelectedBookingId(b.id)}
                  className="font-mono text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  {b.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    b.status === "Checked-In"
                      ? "bg-emerald-100 text-emerald-800"
                      : b.status === "Confirmed"
                      ? "bg-blue-100 text-blue-800"
                      : b.status === "Checked-Out"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    onClick={() => setSelectedBookingId(b.id)}
                    className="font-bold text-sm text-slate-900 cursor-pointer hover:text-indigo-600"
                  >
                    {b.guestName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{b.guestPhone || b.guestEmail}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">${b.totalAmount}</div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      b.paymentStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : b.paymentStatus === "Partial"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {b.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">ROOM & TYPE</span>
                  <span className="font-semibold text-slate-800">Room {b.roomNumber}</span> • {b.roomType}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">DATES ({b.nights}N)</span>
                  <span>{b.checkInDate} &rarr; {b.checkOutDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Channel: <strong className="text-slate-700">{b.source}</strong></span>
                <span>{b.guestsCount} {b.guestsCount === 1 ? "Guest" : "Guests"}</span>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {b.status === "Confirmed" && (
                  <button
                    onClick={() => checkInBooking(b.id)}
                    className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 active:scale-98"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Check-In
                  </button>
                )}

                {b.status === "Checked-In" && (
                  <button
                    onClick={() => checkOutBooking(b.id)}
                    className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 active:scale-98"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Check-Out
                  </button>
                )}

                <button
                  onClick={() => setSelectedBookingId(b.id)}
                  className="flex-1 min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1 active:scale-98"
                >
                  <FileText className="w-3.5 h-3.5" /> View Folio
                </button>

                {b.status === "Confirmed" && (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center active:scale-98"
                    title="Cancel Booking"
                    aria-label="Cancel Booking"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bookings Table (visible on md and up) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Room & Type</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Folio & Status</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                    No reservations found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                      <span
                        onClick={() => setSelectedBookingId(b.id)}
                        className="cursor-pointer hover:underline"
                      >
                        {b.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => setSelectedBookingId(b.id)}
                        className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {b.guestName}
                      </div>
                      <div className="text-[11px] text-slate-400">{b.guestPhone || b.guestEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">Room {b.roomNumber}</div>
                      <div className="text-[11px] text-slate-500">{b.roomType}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>
                        {b.checkInDate} &rarr; {b.checkOutDate}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {b.nights} {b.nights === 1 ? "night" : "nights"} • {b.guestsCount} guests
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">${b.totalAmount}</div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          b.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.paymentStatus === "Partial"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px]">
                        {b.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          b.status === "Checked-In"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "Confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "Checked-Out"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {b.status === "Confirmed" && (
                        <button
                          onClick={() => checkInBooking(b.id)}
                          className="px-2.5 py-1.5 min-h-[32px] rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-colors"
                        >
                          Check-In
                        </button>
                      )}

                      {b.status === "Checked-In" && (
                        <button
                          onClick={() => checkOutBooking(b.id)}
                          className="px-2.5 py-1.5 min-h-[32px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-colors"
                        >
                          Check-Out
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedBookingId(b.id)}
                        className="px-2.5 py-1.5 min-h-[32px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                        title="View Folio / Details"
                      >
                        Folio
                      </button>

                      {b.status === "Confirmed" && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="p-1.5 min-h-[32px] rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Cancel Reservation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
