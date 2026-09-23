import React from "react";
import { useHotel } from "../context/HotelContext";
import {
  TrendingUp,
  DollarSign,
  DoorOpen,
  CalendarCheck,
  LogIn,
  LogOut,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BedDouble,
  Users,
  Building,
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const {
    occupancyRate,
    totalRooms,
    occupiedRoomsCount,
    vacantCleanCount,
    vacantDirtyCount,
    maintenanceCount,
    adr,
    revPar,
    todayRevenue,
    todayArrivalsCount,
    todayDeparturesCount,
    inHouseCount,
    bookings,
    rooms,
    tasks,
    checkInBooking,
    checkOutBooking,
    setSelectedBookingId,
    setSelectedRoomId,
    setIsNewBookingOpen,
    setIsAiDrawerOpen,
    setCurrentTab,
  } = useHotel();

  // Filter today's arrivals and departures
  const todayArrivals = bookings.filter(
    (b) => b.checkInDate === "2026-09-15" && (b.status === "Confirmed" || b.status === "Checked-In")
  );

  const todayDepartures = bookings.filter(
    (b) => b.checkOutDate === "2026-09-15" && (b.status === "Checked-In" || b.status === "Checked-Out")
  );

  const urgentTasks = tasks
    .filter((t) => t.status !== "Completed")
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Operations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Front Desk & Operations Command</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Live Day 15 Sep
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy, guest turnover schedule, and AI task prioritization.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full md:w-auto">
          <button
            id="btn-dash-ai-brief"
            onClick={() => setCurrentTab("analytics")}
            className="flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:from-indigo-700 hover:to-purple-700 active:scale-98 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Morning AI Briefing</span>
          </button>
          <button
            id="btn-dash-new-booking"
            onClick={() => setIsNewBookingOpen(true)}
            className="flex items-center justify-center gap-1.5 min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Occupancy Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{occupancyRate}%</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                +4.2% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {occupiedRoomsCount} occupied of {totalRooms} total rooms
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${occupancyRate}%` }}></div>
          </div>
        </div>

        {/* RevPAR Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RevPAR</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">${revPar}</span>
              <span className="text-xs font-medium text-indigo-600">Rev / Available</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Average Daily Rate (ADR): <span className="font-semibold text-slate-700">${adr}</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: "72%" }}></div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">${todayRevenue.toLocaleString()}</span>
              <span className="text-xs font-medium text-emerald-600">Active Folios</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Includes room charges, dining & spa
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: "85%" }}></div>
          </div>
        </div>

        {/* In-House Guests */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In-House Guests</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{inHouseCount}</span>
              <span className="text-xs font-medium text-slate-500">Guests on-site</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {todayArrivalsCount} arriving • {todayDeparturesCount} departing today
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: "65%" }}></div>
          </div>
        </div>
      </div>

      {/* Room Status Visual Tracker */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Live Room Housekeeping & Occupancy Status</h2>
            <p className="text-xs text-slate-500">Click any category to filter the full rooms inventory</p>
          </div>
          <button
            onClick={() => setCurrentTab("rooms")}
            className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 min-h-[36px] flex items-center gap-1 self-start sm:self-auto"
          >
            Manage All Rooms ({totalRooms}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div
            onClick={() => setCurrentTab("rooms")}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 active:scale-98 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">Vacant Clean</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{vacantCleanCount}</div>
            <span className="text-[11px] text-emerald-700">Ready for check-in</span>
          </div>

          <div
            onClick={() => setCurrentTab("rooms")}
            className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 active:scale-98 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-800">Occupied</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{occupiedRoomsCount}</div>
            <span className="text-[11px] text-blue-700">Guests in residence</span>
          </div>

          <div
            onClick={() => setCurrentTab("rooms")}
            className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 active:scale-98 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">Vacant Dirty</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{vacantDirtyCount}</div>
            <span className="text-[11px] text-amber-700">Turnover required</span>
          </div>

          <div
            onClick={() => setCurrentTab("rooms")}
            className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 active:scale-98 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-800">Maintenance</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            </div>
            <div className="text-2xl font-bold text-rose-900 mt-1">{maintenanceCount}</div>
            <span className="text-[11px] text-rose-700">Out of order</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Arrivals/Departures + Urgent Operations Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arrivals & Departures (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Arrivals */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Today's Arrivals ({todayArrivals.length})</h2>
              </div>
              <span className="text-xs text-slate-500">Standard Check-in 14:00</span>
            </div>

            <div className="divide-y divide-slate-100">
              {todayArrivals.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No arrivals scheduled for today.</div>
              ) : (
                todayArrivals.map((booking) => {
                  const targetRoom = rooms.find((r) => r.roomNumber === booking.roomNumber);
                  const isRoomReady = targetRoom?.status === "Vacant Clean";

                  return (
                    <div
                      key={booking.id}
                      className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                          {booking.roomNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => setSelectedBookingId(booking.id)}
                              className="font-semibold text-xs text-slate-900 hover:text-indigo-600 cursor-pointer"
                            >
                              {booking.guestName}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {booking.nights} Nights
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {booking.roomType} • {booking.guestsCount} Guests • Source: {booking.source}
                          </div>
                          {booking.specialRequests && (
                            <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1.5 border border-amber-100 inline-block">
                              Note: {booking.specialRequests}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isRoomReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isRoomReady ? "Room Ready" : targetRoom?.status || "Turnover Pending"}
                        </span>

                        {booking.status === "Checked-In" ? (
                          <span className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> In-House
                          </span>
                        ) : (
                          <button
                            id={`btn-checkin-${booking.id}`}
                            onClick={() => checkInBooking(booking.id)}
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold transition-colors shadow-xs"
                          >
                            Check-In
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Today's Departures */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Today's Departures ({todayDepartures.length})</h2>
              </div>
              <span className="text-xs text-slate-500">Standard Check-out 11:00</span>
            </div>

            <div className="divide-y divide-slate-100">
              {todayDepartures.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No departures scheduled for today.</div>
              ) : (
                todayDepartures.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {booking.roomNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() => setSelectedBookingId(booking.id)}
                            className="font-semibold text-xs text-slate-900 hover:text-indigo-600 cursor-pointer py-0.5"
                          >
                            {booking.guestName}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Folio ${booking.totalAmount}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {booking.roomType} • Status: {booking.paymentStatus}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {booking.status === "Checked-Out" ? (
                        <span className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold flex items-center">
                          Departed
                        </span>
                      ) : (
                        <button
                          id={`btn-checkout-${booking.id}`}
                          onClick={() => checkOutBooking(booking.id)}
                          className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs font-semibold transition-colors shadow-xs"
                        >
                          Check-Out & Settle
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Operations & Urgent Dispatch Tasks */}
        <div className="space-y-6">
          {/* AI Copilot Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-indigo-800/60 shadow-md">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Assistant Active
            </div>
            <h3 className="text-base font-bold mt-2">Operational Intelligence</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Aura is actively monitoring room turnarounds, high-value VIP guest arrivals, and inventory yield.
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => setIsAiDrawerOpen(true)}
                className="w-full text-left min-h-[44px] p-3 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/10 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>Prioritize Housekeeping Tasks</span>
                <span className="text-indigo-300 text-xs font-bold">&rarr;</span>
              </button>
              <button
                onClick={() => setIsAiDrawerOpen(true)}
                className="w-full text-left min-h-[44px] p-3 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/10 text-xs text-slate-200 transition-colors flex items-center justify-between"
              >
                <span>Draft Welcome Letters for VIPs</span>
                <span className="text-indigo-300 text-xs font-bold">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Urgent Housekeeping & Work Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Priority Work Orders</h3>
              </div>
              <button
                onClick={() => setCurrentTab("staff")}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        task.priority === "Urgent"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due: {task.dueTime}</span>
                    </div>
                    <span>{task.assignedTo || "Unassigned"}</span>
                  </div>

                  {task.aiRationale && (
                    <div className="mt-2 text-[10px] text-indigo-700 bg-indigo-50/80 p-1.5 rounded border border-indigo-100">
                      AI Rationale: {task.aiRationale}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
