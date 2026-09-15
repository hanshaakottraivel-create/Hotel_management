import React, { useState, useMemo } from "react";
import { useHotel } from "../context/HotelContext";
import { Guest, VipTier } from "../types";
import {
  Users,
  Plus,
  Search,
  Award,
  DollarSign,
  Phone,
  Mail,
  Heart,
  Calendar,
  Sparkles,
  Edit,
} from "lucide-react";

export const GuestsView: React.FC = () => {
  const {
    guests,
    addGuest,
    setSelectedGuestId,
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [vipFilter, setVipFilter] = useState<string>("All");

  // New Guest Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("United States");
  const [vipTier, setVipTier] = useState<VipTier>("Standard");
  const [preferencesStr, setPreferencesStr] = useState("");
  const [notes, setNotes] = useState("");

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = g.name.toLowerCase().includes(q);
        const matchEmail = g.email.toLowerCase().includes(q);
        const matchPhone = g.phone.includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }

      if (vipFilter !== "All" && g.vipTier !== vipFilter) {
        return false;
      }

      return true;
    });
  }, [guests, searchQuery, vipFilter]);

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prefs = preferencesStr
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    addGuest({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      vipTier,
      idNumber: `ID-${Math.floor(100000 + Math.random() * 900000)}`,
      nationality,
      totalVisits: 1,
      totalSpend: 0,
      preferences: prefs.length > 0 ? prefs : ["Quiet Room"],
      notes: notes.trim(),
      lastVisit: new Date().toISOString().split("T")[0],
    });

    setIsAddModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setPreferencesStr("");
    setNotes("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Guest Profiles & VIP Loyalty
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {guests.length} registered guests. Access personalized stay preferences and AI guest communications.
          </p>
        </div>

        <button
          id="btn-add-guest"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Guest
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest by name, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* VIP Tier Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["All", "Platinum", "Gold", "Silver", "Standard"].map((tier) => (
            <button
              key={tier}
              onClick={() => setVipFilter(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                vipFilter === tier
                  ? "bg-slate-900 text-white shadow-2xs font-semibold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {tier === "All" ? "All Guests" : `${tier} VIP`}
            </button>
          ))}
        </div>
      </div>

      {/* Guests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => {
          const isPlatinum = guest.vipTier === "Platinum";
          const isGold = guest.vipTier === "Gold";
          const isSilver = guest.vipTier === "Silver";

          return (
            <div
              key={guest.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name & VIP Tier */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {guest.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h3
                        onClick={() => setSelectedGuestId(guest.id)}
                        className="font-bold text-sm text-slate-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {guest.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">{guest.nationality}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isPlatinum
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : isGold
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : isSilver
                        ? "bg-slate-200 text-slate-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {guest.vipTier} VIP
                  </span>
                </div>

                {/* Contact info */}
                <div className="mt-3.5 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{guest.phone}</span>
                  </div>
                </div>

                {/* Loyalty stats */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Visits</span>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{guest.totalVisits} stays</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Spend</span>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">${guest.totalSpend.toLocaleString()}</div>
                  </div>
                </div>

                {/* Preferences chips */}
                {guest.preferences.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> Preferences
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {guest.preferences.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedGuestId(guest.id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Folio & AI Letter</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Add New Guest Profile</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alexander Hamilton"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-200"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    VIP Tier
                  </label>
                  <select
                    value={vipTier}
                    onChange={(e) => setVipTier(e.target.value as VipTier)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="e.g. Canada"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferences (comma separated)
                </label>
                <input
                  type="text"
                  value={preferencesStr}
                  onChange={(e) => setPreferencesStr(e.target.value)}
                  placeholder="e.g. Feather-free pillows, High floor, Oat milk"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special concierge instructions..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
