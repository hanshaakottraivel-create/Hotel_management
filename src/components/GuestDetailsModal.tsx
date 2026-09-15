import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import {
  Users,
  X,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Heart,
  Plus,
  Send,
} from "lucide-react";

export const GuestDetailsModal: React.FC = () => {
  const {
    selectedGuestId,
    setSelectedGuestId,
    guests,
    bookings,
    setSelectedBookingId,
    setIsNewBookingOpen,
    showToast,
  } = useHotel();

  const [aiNotePurpose, setAiNotePurpose] = useState("Pre-Arrival VIP Welcome");
  const [aiGeneratedNote, setAiGeneratedNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!selectedGuestId) return null;

  const guest = guests.find((g) => g.id === selectedGuestId);
  if (!guest) return null;

  const guestBookings = bookings.filter((b) => b.guestName.toLowerCase() === guest.name.toLowerCase());

  const handleGenerateAiMessage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/draft-guest-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guest.name,
          vipTier: guest.vipTier,
          roomNumber: guestBookings[0]?.roomNumber || "Suite",
          roomType: guestBookings[0]?.roomType || "Executive Suite",
          purpose: aiNotePurpose,
          specialRequests: guest.preferences.join(", "),
        }),
      });

      const data = await response.json();
      setAiGeneratedNote(data.draft || "Draft ready.");
    } catch (err) {
      console.error(err);
      setAiGeneratedNote(`Dear ${guest.name},\n\nWe are delighted to welcome you back for another exceptional stay. Your preferred amenities have been arranged.\n\nWarmest regards,\nGuest Experience Management`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={() => setSelectedGuestId(null)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white font-bold text-sm flex items-center justify-center">
              {guest.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{guest.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-100 text-amber-800">
                  {guest.vipTier} VIP
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{guest.nationality} • {guest.idNumber}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedGuestId(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Stays</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{guest.totalVisits} visits</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Lifetime Spend</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">${guest.totalSpend.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Last Visited</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{guest.lastVisit || "Recent"}</div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email: <strong className="text-slate-900">{guest.email}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone: <strong className="text-slate-900">{guest.phone}</strong></span>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Guest Preferences & Allergens
            </div>
            <div className="flex flex-wrap gap-1.5">
              {guest.preferences.map((p, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* AI Communication Generator */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Personalized Communication</span>
              </div>
              <button
                onClick={handleGenerateAiMessage}
                disabled={isGenerating}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {isGenerating ? "Drafting..." : "Generate Letter"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={aiNotePurpose}
                onChange={(e) => setAiNotePurpose(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-indigo-200 bg-white text-slate-800"
              >
                <option value="Pre-Arrival VIP Welcome">Pre-Arrival VIP Welcome</option>
                <option value="Post-Stay Thank You & Loyalty Survey">Post-Stay Thank You</option>
                <option value="Special Occasion / Anniversary Congratulations">Special Occasion</option>
                <option value="Service Recovery / Apology Note">Service Recovery</option>
              </select>
            </div>

            {aiGeneratedNote && (
              <div className="bg-white p-3 rounded-xl border border-indigo-100 text-xs space-y-2">
                <textarea
                  rows={4}
                  value={aiGeneratedNote}
                  onChange={(e) => setAiGeneratedNote(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-sans focus:outline-hidden"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiGeneratedNote);
                      showToast("Copied letter to clipboard", "info");
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold text-[11px]"
                  >
                    Copy Letter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stay History */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Stay History & Active Bookings ({guestBookings.length})
            </div>
            {guestBookings.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No past reservations linked to this profile.</div>
            ) : (
              <div className="space-y-1.5">
                {guestBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedGuestId(null);
                      setSelectedBookingId(b.id);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        Room {b.roomNumber} ({b.roomType})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {b.checkInDate} to {b.checkOutDate} • ${b.totalAmount}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-200 text-slate-700">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              setSelectedGuestId(null);
              setIsNewBookingOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Book Room For Guest
          </button>

          <button
            onClick={() => setSelectedGuestId(null)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
