import React, { useState, useEffect, useMemo, useRef } from "react";
import { useHotel } from "../context/HotelContext";
import {
  Search,
  X,
  DoorClosed,
  CalendarCheck,
  Users,
  Briefcase,
  ArrowRight,
} from "lucide-react";

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    rooms,
    bookings,
    guests,
    staff,
    setSelectedBookingId,
    setSelectedRoomId,
    setSelectedGuestId,
    setCurrentTab,
  } = useHotel();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { rooms: [], bookings: [], guests: [], staff: [] };
    const q = query.toLowerCase().trim();

    const matchedRooms = rooms.filter(
      (r) =>
        r.roomNumber.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        (r.currentGuestName && r.currentGuestName.toLowerCase().includes(q))
    );

    const matchedBookings = bookings.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.roomNumber.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
    );

    const matchedGuests = guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        g.vipTier.toLowerCase().includes(q)
    );

    const matchedStaff = staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );

    return {
      rooms: matchedRooms.slice(0, 4),
      bookings: matchedBookings.slice(0, 4),
      guests: matchedGuests.slice(0, 4),
      staff: matchedStaff.slice(0, 4),
    };
  }, [query, rooms, bookings, guests, staff]);

  if (!isSearchOpen) return null;

  const totalResults =
    searchResults.rooms.length +
    searchResults.bookings.length +
    searchResults.guests.length +
    searchResults.staff.length;

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center px-3 sm:px-4 py-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-2.5 sm:mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms, guests, bookings, staff..."
            className="w-full text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden bg-transparent min-h-[40px]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="sm:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
          <kbd className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">
                Type a room number, guest name, confirmation code, or staff member...
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {["401", "Brody", "Suite", "Housekeeping", "Checked-In"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setQuery(chip)}
                    className="text-xs min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No results found for "{query}". Try a different keyword.
            </div>
          ) : (
            <>
              {/* Rooms Section */}
              {searchResults.rooms.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <DoorClosed className="w-3.5 h-3.5" /> Rooms
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.rooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setCurrentTab("rooms");
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-800">
                            {room.roomNumber}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {room.type} - Floor {room.floor}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {room.currentGuestName ? `Occupied by ${room.currentGuestName}` : `$${room.ratePerNight}/night`}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          room.status === "Vacant Clean" ? "bg-emerald-100 text-emerald-800" :
                          room.status === "Occupied" ? "bg-blue-100 text-blue-800" :
                          room.status === "Vacant Dirty" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {room.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings Section */}
              {searchResults.bookings.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5" /> Bookings
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => {
                          setSelectedBookingId(booking.id);
                          setCurrentTab("bookings");
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            {booking.guestName} - Room {booking.roomNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {booking.id} | {booking.checkInDate} to {booking.checkOutDate} ({booking.nights} nights)
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          booking.status === "Checked-In" ? "bg-emerald-100 text-emerald-800" :
                          booking.status === "Confirmed" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guests Section */}
              {searchResults.guests.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Guests
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.guests.map((guest) => (
                      <div
                        key={guest.id}
                        onClick={() => {
                          setSelectedGuestId(guest.id);
                          setCurrentTab("guests");
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            {guest.name}
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {guest.vipTier} VIP
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {guest.email} | {guest.phone}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-700">${guest.totalSpend.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Staff Section */}
              {searchResults.staff.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Staff
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.staff.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setCurrentTab("staff");
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.role} • {s.department}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          s.status === "On Duty" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search hotel records instantly</span>
          <div className="flex items-center gap-3">
            <span>Click any item to view</span>
          </div>
        </div>
      </div>
    </div>
  );
};
