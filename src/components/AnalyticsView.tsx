import React from "react";
import { useHotel } from "../context/HotelContext";
import { AiReportGenerator } from "./AiReportGenerator";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Layers,
  Users,
} from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const {
    occupancyRate,
    adr,
    revPar,
    todayRevenue,
    rooms,
    bookings,
  } = useHotel();

  // Weekly occupancy simulation
  const weeklyData = [
    { day: "Mon", rate: 68, rev: 4100 },
    { day: "Tue", rate: 74, rev: 4450 },
    { day: "Wed", rate: 82, rev: 5200 },
    { day: "Thu", rate: 80, rev: 4980 },
    { day: "Fri", rate: 94, rev: 6700 },
    { day: "Sat", rate: 98, rev: 7200 },
    { day: "Sun", rate: 78, rev: 4800 },
  ];

  // Channel distribution
  const channels = [
    { name: "Direct Booking Engine", share: 44, color: "bg-indigo-600" },
    { name: "Corporate Accounts", share: 26, color: "bg-blue-500" },
    { name: "Booking.com OTA", share: 18, color: "bg-amber-500" },
    { name: "Expedia Group", share: 12, color: "bg-emerald-500" },
  ];

  // Revenue by stream
  const streams = [
    { category: "Room Accommodation", amount: 28400, percent: 74 },
    { category: "Food & Beverage / In-Room Dining", amount: 5600, percent: 15 },
    { category: "Spa & Wellness Club", amount: 2800, percent: 7 },
    { category: "Parking & Incidentals", amount: 1500, percent: 4 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Hospitality Analytics & Revenue Yield
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key operational metrics: Occupancy, ADR, RevPAR, channel acquisition mix, and predictive yield insights.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last 7 Days vs Previous Cycle</span>
        </div>
      </div>

      {/* 3 Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Daily Rate (ADR)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">${adr}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              +8.4% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Weighted average across standard and premium suite categories.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RevPAR (Yield)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">${revPar}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              +11.2% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Calculated as Occupancy ({occupancyRate}%) × ADR (${adr}).</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direct Channel Yield</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">70%</span>
            <span className="text-xs font-medium text-emerald-600">Direct + Corp</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">High direct share keeps OTA commission expenditures low.</p>
        </div>
      </div>

      {/* Occupancy and Revenue Velocity Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Weekly Occupancy & Revenue Velocity</h2>
            <p className="text-xs text-slate-500">Day-by-day guest occupancy percentage and daily revenue</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
              <span className="text-slate-600">Occupancy %</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2 border-b border-slate-200">
          {weeklyData.map((item) => (
            <div key={item.day} className="flex flex-col items-center h-full justify-end group">
              <div className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                ${item.rev}
              </div>
              <div
                className="w-full max-w-[48px] bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg transition-all duration-300 group-hover:from-indigo-800 group-hover:to-indigo-600 relative flex items-start justify-center pt-2"
                style={{ height: `${item.rate}%` }}
              >
                <span className="text-[10px] font-bold text-white leading-none">{item.rate}%</span>
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-2">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Channel Distribution + Revenue Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Acquisition Channels */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Booking Channels & Commission Savings</h2>
          <p className="text-xs text-slate-500 mb-4">Direct reservations eliminate 15-20% third-party intermediary commissions.</p>

          <div className="space-y-3.5">
            {channels.map((channel) => (
              <div key={channel.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{channel.name}</span>
                  <span className="text-slate-900">{channel.share}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${channel.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${channel.share}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Streams Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Total Revenue by Ancillary Stream</h2>
          <p className="text-xs text-slate-500 mb-4">Ancillary non-room revenue accounts for 26% of gross billings.</p>

          <div className="space-y-3.5">
            {streams.map((stream) => (
              <div key={stream.category}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{stream.category}</span>
                  <span className="text-slate-900">${stream.amount.toLocaleString()} ({stream.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stream.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive AI Executive Report & Operational Summary Generator */}
      <AiReportGenerator initialReportType="revenue-yield" />

      {/* AI Revenue Strategy Box */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-900 shadow-md">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> AI Dynamic Pricing & Yield Advisory
        </div>
        <h3 className="text-base font-bold mt-2">Yield Strategy Recommendations for September 15 - 20</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="text-xs font-bold text-indigo-300">Raise Weekend Suite Rates</span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              With 94% forecast occupancy on Friday and Saturday, increase Deluxe King and Suites by $40/night to maximize RevPAR.
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="text-xs font-bold text-indigo-300">Promote Midweek Spa Packages</span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Midweek F&B and Spa utilization is at 62%. Trigger an automated welcome email with a 15% afternoon spa credit.
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="text-xs font-bold text-indigo-300">Turnaround Velocity</span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Average room turnaround time is currently 38 minutes. Floor 3 has 2 vacant dirty rooms requiring expedited cleaning before 14:00.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
