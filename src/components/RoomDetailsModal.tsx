import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import { RoomStatus } from "../types";
import {
  DoorClosed,
  X,
  BedDouble,
  User,
  Wrench,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Wifi,
  Tv,
  Coffee,
  Shield,
  Layers,
} from "lucide-react";

export const RoomDetailsModal: React.FC = () => {
  const {
    selectedRoomId,
    setSelectedRoomId,
    rooms,
    bookings,
    updateRoomStatus,
    updateRoomRate,
    setSelectedBookingId,
  } = useHotel();

  const [editRate, setEditRate] = useState<number | null>(null);

  if (!selectedRoomId) return null;

  const room = rooms.find((r) => r.id === selectedRoomId);
  if (!room) return null;

  const activeBooking = bookings.find(
    (b) =>
      b.roomNumber === room.roomNumber &&
      (b.status === "Checked-In" || (b.status === "Confirmed" && b.checkInDate === "2026-09-15"))
  );

  const handleSaveRate = () => {
    if (editRate && editRate > 0) {
      updateRoomRate(room.id, editRate);
    }
    setEditRate(null);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={() => setSelectedRoomId(null)}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {room.roomNumber}
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{room.type}</h3>
              <p className="text-[11px] text-slate-500">Floor {room.floor} • {room.bedConfig}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedRoomId(null)}
            className="text-slate-400 hover:text-slate-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Status & Rate Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Current State</span>
              <div className="mt-0.5">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    room.status === "Vacant Clean"
                      ? "bg-emerald-100 text-emerald-800"
                      : room.status === "Occupied"
                      ? "bg-blue-100 text-blue-800"
                      : room.status === "Vacant Dirty"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {room.status}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Nightly Tariff</span>
              <div className="mt-0.5 flex items-center gap-1.5 justify-end">
                {editRate !== null ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm sm:text-xs rounded-lg border border-indigo-300 min-h-[36px]"
                    />
                    <button
                      onClick={handleSaveRate}
                      className="text-xs px-2.5 py-1 min-h-[36px] bg-indigo-600 active:bg-indigo-700 text-white rounded-lg font-medium"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditRate(room.ratePerNight)}
                    className="font-bold text-sm text-slate-900 hover:text-indigo-600 py-1"
                  >
                    ${room.ratePerNight}/night
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Status Modifiers */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Set Operational Status
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => updateRoomStatus(room.id, "Vacant Clean", "Inspected & ready")}
                className={`min-h-[42px] py-2 px-2.5 rounded-xl border text-center font-medium transition-all active:scale-98 ${
                  room.status === "Vacant Clean"
                    ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                Vacant Clean
              </button>

              <button
                onClick={() => updateRoomStatus(room.id, "Vacant Dirty")}
                className={`min-h-[42px] py-2 px-2.5 rounded-xl border text-center font-medium transition-all active:scale-98 ${
                  room.status === "Vacant Dirty"
                    ? "bg-amber-500 text-white border-amber-500 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                Vacant Dirty
              </button>

              <button
                onClick={() => updateRoomStatus(room.id, "Occupied")}
                className={`min-h-[42px] py-2 px-2.5 rounded-xl border text-center font-medium transition-all active:scale-98 ${
                  room.status === "Occupied"
                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                Occupied
              </button>

              <button
                onClick={() => updateRoomStatus(room.id, "Maintenance", "Flagged for maintenance inspection")}
                className={`min-h-[42px] py-2 px-2.5 rounded-xl border text-center font-medium transition-all active:scale-98 ${
                  room.status === "Maintenance"
                    ? "bg-rose-600 text-white border-rose-600 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                Maintenance
              </button>
            </div>
          </div>

          {/* Current Occupant or Upcoming Reservation */}
          {activeBooking ? (
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-950">Active Reservation</span>
                <button
                  onClick={() => {
                    setSelectedRoomId(null);
                    setSelectedBookingId(activeBooking.id);
                  }}
                  className="text-blue-700 font-semibold hover:underline min-h-[36px] flex items-center"
                >
                  View Folio &rarr;
                </button>
              </div>
              <div className="text-xs text-blue-900 font-semibold">{activeBooking.guestName}</div>
              <div className="text-[11px] text-blue-700">
                {activeBooking.checkInDate} to {activeBooking.checkOutDate} ({activeBooking.nights} nights)
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
              No guests currently registered to this room.
            </div>
          )}

          {/* Housekeeping Notes */}
          {room.housekeepingNotes && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-0.5">Housekeeping Log:</span>
              {room.housekeepingNotes}
            </div>
          )}

          {/* Amenities */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Room Amenities & Features
            </div>
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={() => setSelectedRoomId(null)}
            className="w-full sm:w-auto min-h-[42px] px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
