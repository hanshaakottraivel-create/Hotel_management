import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Check,
} from "lucide-react";

export const AvailabilityView: React.FC = () => {
  const {
    rooms,
    bookings,
    setSelectedBookingId,
    setIsNewBookingOpen,
  } = useHotel();

  // Base date start: 2026-09-14 (Monday before 15)
  const [startOffset, setStartOffset] = useState(0); // in days
  const [filterType, setFilterType] = useState<string>("All");

  const baseDate = new Date(2026, 8, 14); // 2026-09-14
  baseDate.setDate(baseDate.getDate() + startOffset);

  // Generate 14 days
  const days: Date[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    days.push(d);
  }

  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filteredRooms = rooms.filter((r) => filterType === "All" || r.type === filterType);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-indigo-600" />
            Interactive Availability & Tape Chart
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            14-day room occupancy timeline. Click any vacant cell to start a booking or click a block to view folio.
          </p>
        </div>

        {/* Date Navigation & Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setStartOffset((prev) => prev - 7)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all text-xs font-medium"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStartOffset(0)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-all"
            >
              Today
            </button>
            <button
              onClick={() => setStartOffset((prev) => prev + 7)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all text-xs font-medium"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Room Categories</option>
            <option value="Standard Queen">Standard Queen</option>
            <option value="Deluxe King">Deluxe King</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Presidential Suite">Presidential Suite</option>
            <option value="Oceanfront Villa">Oceanfront Villa</option>
          </select>
        </div>
      </div>

      {/* Legend strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600">Vacant / Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
            <span className="text-slate-600">Checked-In (In House)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-500"></span>
            <span className="text-slate-600">Confirmed Reservation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
            <span className="text-slate-600">Maintenance</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          Showing {formatDateStr(days[0])} to {formatDateStr(days[13])}
        </span>
      </div>

      {/* Grid Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header: Dates */}
            <div className="grid grid-cols-[160px_repeat(14,1fr)] bg-slate-50 border-b border-slate-200 text-center text-xs">
              <div className="p-3 text-left font-bold text-slate-700 border-r border-slate-200">
                Room Number
              </div>
              {days.map((day) => {
                const dateStr = formatDateStr(day);
                const isToday = dateStr === "2026-09-15";
                const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = day.getDate();

                // Compute occupancy on this date
                const occupiedOnDay = bookings.filter(
                  (b) =>
                    b.status !== "Cancelled" &&
                    b.checkInDate <= dateStr &&
                    b.checkOutDate > dateStr
                ).length;
                const occPercent = Math.round((occupiedOnDay / rooms.length) * 100);

                return (
                  <div
                    key={dateStr}
                    className={`p-2 border-r border-slate-200/80 flex flex-col justify-between ${
                      isToday ? "bg-indigo-50/80 ring-1 ring-indigo-300 font-bold" : ""
                    }`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">{dayName}</div>
                      <div className={`text-xs font-semibold ${isToday ? "text-indigo-700" : "text-slate-800"}`}>
                        {dayNum}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 font-mono">{occPercent}%</div>
                  </div>
                );
              })}
            </div>

            {/* Room Rows */}
            <div className="divide-y divide-slate-100">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="grid grid-cols-[160px_repeat(14,1fr)] items-stretch hover:bg-slate-50/50 transition-colors"
                >
                  {/* Left Column: Room info */}
                  <div className="p-3 border-r border-slate-200 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Room {room.roomNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">${room.ratePerNight}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate">{room.type}</span>
                  </div>

                  {/* 14 Day Cells */}
                  {days.map((day) => {
                    const dateStr = formatDateStr(day);
                    const isToday = dateStr === "2026-09-15";

                    // Check if room has maintenance
                    if (room.status === "Maintenance" && isToday) {
                      return (
                        <div
                          key={dateStr}
                          className="p-1 border-r border-slate-100 flex items-center justify-center bg-rose-50"
                          title={`Room ${room.roomNumber} - Maintenance`}
                        >
                          <span className="w-full h-7 rounded bg-rose-500/90 text-white text-[10px] font-semibold flex items-center justify-center truncate px-1 shadow-2xs">
                            Maint.
                          </span>
                        </div>
                      );
                    }

                    // Check if there is an active booking for this room on this date
                    const booking = bookings.find(
                      (b) =>
                        b.roomNumber === room.roomNumber &&
                        b.status !== "Cancelled" &&
                        b.checkInDate <= dateStr &&
                        b.checkOutDate > dateStr
                    );

                    if (booking) {
                      const isCheckInDay = booking.checkInDate === dateStr;
                      const isCheckedIn = booking.status === "Checked-In";

                      return (
                        <div
                          key={dateStr}
                          className={`p-1 border-r border-slate-100 flex items-center justify-center ${
                            isToday ? "bg-indigo-50/40" : ""
                          }`}
                        >
                          <button
                            onClick={() => setSelectedBookingId(booking.id)}
                            className={`w-full h-7 rounded text-[10px] font-semibold text-white px-1.5 flex items-center justify-center truncate shadow-2xs transition-all hover:opacity-90 ${
                              isCheckedIn ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-500 hover:bg-indigo-600"
                            }`}
                            title={`${booking.guestName} (${booking.checkInDate} to ${booking.checkOutDate})`}
                          >
                            {isCheckInDay ? (
                              <span className="truncate">→ {booking.guestName.split(" ")[0]}</span>
                            ) : (
                              <span className="truncate">{booking.guestName.split(" ")[0]}</span>
                            )}
                          </button>
                        </div>
                      );
                    }

                    // Empty cell -> Vacant
                    return (
                      <div
                        key={dateStr}
                        onClick={() => setIsNewBookingOpen(true)}
                        className={`p-1 border-r border-slate-100 flex items-center justify-center cursor-pointer group hover:bg-emerald-50/60 transition-colors ${
                          isToday ? "bg-indigo-50/20" : ""
                        }`}
                        title={`Available - Click to book Room ${room.roomNumber} for ${dateStr}`}
                      >
                        <div className="w-full h-7 rounded flex items-center justify-center text-slate-300 group-hover:text-emerald-600 group-hover:bg-emerald-100/60 transition-all">
                          <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
