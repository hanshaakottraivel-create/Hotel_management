import React, { useState } from "react";
import { useHotel } from "../context/HotelContext";
import {
  Search,
  Sparkles,
  Plus,
  Bell,
  Building2,
  Calendar,
  RotateCcw,
  Check,
  Database,
  RefreshCw,
} from "lucide-react";

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    setIsSearchOpen,
    setIsAiDrawerOpen,
    setIsNewBookingOpen,
    occupancyRate,
    activities,
    resetToDemo,
    dbStatus,
    syncDatabase,
  } = useHotel();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Brand & Quick Stats */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center text-amber-400 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-base">Grand Horizon</span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-slate-100 text-slate-600 border border-slate-200">
                PMS v2.5
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Luxury Hotel & Suites</p>
          </div>
        </div>

        {/* Date ticker */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Tuesday, Sep 15, 2026</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">{occupancyRate}% Occupied</span>
          </span>
        </div>

        {/* Database Status indicator */}
        <div
          id="badge-db-status"
          className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600"
          title={dbStatus.message || (dbStatus.connected ? "Connected to Supabase PostgreSQL" : "Local Database Mode")}
        >
          <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? "bg-emerald-500" : "bg-blue-500"}`} />
          <Database className="w-3 h-3 text-slate-400" />
          <span className="font-medium text-slate-700">
            {dbStatus.connected ? "Supabase PostgreSQL" : "PostgreSQL Store"}
          </span>
          <button
            onClick={() => syncDatabase()}
            className="text-slate-400 hover:text-slate-700 transition-colors ml-0.5"
            title="Sync Database"
            aria-label="Sync Database"
          >
            <RefreshCw className={`w-3 h-3 ${dbStatus.loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Center: Quick Search Command Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          id="btn-global-search-trigger"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-sm rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-normal">Search rooms, guests, bookings, staff...</span>
          </div>
          <kbd className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Search"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* AI Assistant Quick Briefing Button */}
        <button
          id="btn-ai-assistant-navbar"
          onClick={() => setIsAiDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 text-xs font-medium transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
          <span className="sm:hidden">AI</span>
        </button>

        {/* Activity & Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Activity Feed"
          >
            <Bell className="w-4.5 h-4.5" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="font-semibold text-sm text-slate-900">Hotel Activity Stream</div>
                <span className="text-[11px] text-slate-400">Live operational events</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 px-2 py-1">
                {activities.map((act) => (
                  <div key={act.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-xs flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <div className="flex-1">
                      <p className="text-slate-800 font-medium leading-relaxed">{act.message}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 bg-slate-50 border-y border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>DB: <strong className="font-semibold text-slate-800">{dbStatus.connected ? "Supabase PostgreSQL" : "Local PostgreSQL Store"}</strong></span>
                </div>
                <button
                  onClick={() => syncDatabase()}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <RefreshCw className={`w-3 h-3 ${dbStatus.loading ? "animate-spin" : ""}`} />
                  Sync Now
                </button>
              </div>

              <div className="px-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    resetToDemo();
                    setIsNotificationsOpen(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Demo State
                </button>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* New Reservation Action */}
        <button
          id="btn-new-reservation-navbar"
          onClick={() => setIsNewBookingOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Reservation</span>
          <span className="sm:hidden">Book</span>
        </button>
      </div>
    </header>
  );
};
