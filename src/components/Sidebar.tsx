import React from "react";
import { useHotel, NavigationTab } from "../context/HotelContext";
import {
  LayoutDashboard,
  DoorClosed,
  CalendarCheck,
  CalendarRange,
  Users,
  Briefcase,
  CreditCard,
  BarChart3,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    currentTab,
    setCurrentTab,
    tasks,
    vacantDirtyCount,
    occupancyRate,
    occupiedRoomsCount,
    totalRooms,
  } = useHotel();

  const pendingTasksCount = tasks.filter((t) => t.status !== "Completed").length;

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rooms", label: "Rooms", icon: DoorClosed, badge: vacantDirtyCount > 0 ? `${vacantDirtyCount} dirty` : undefined, badgeColor: "bg-amber-100 text-amber-800" },
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "availability", label: "Availability Matrix", icon: CalendarRange },
    { id: "guests", label: "Guest Directory", icon: Users },
    { id: "staff", label: "Staff & Work Orders", icon: Briefcase, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, badgeColor: "bg-indigo-100 text-indigo-800" },
    { id: "payments", label: "Payments & Billing", icon: CreditCard },
    { id: "analytics", label: "Analytics & KPIs", icon: BarChart3 },
    { id: "ai", label: "AI Copilot & Operations", icon: Sparkles, badge: "Live AI", badgeColor: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" },
  ];

  const handleSelect = (tab: NavigationTab) => {
    setCurrentTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-40 transition-transform duration-200 lg:translate-x-0 flex flex-col justify-between ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden mb-4 pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</span>
            <button
              onClick={onCloseMobile}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white active:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Management
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white active:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Property Status
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Occupancy</span>
                <span className="font-semibold text-white">{occupancyRate}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{occupiedRoomsCount} / {totalRooms} Rooms Booked</span>
                <span className="text-emerald-400 font-medium">Optimal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-slate-200 font-medium text-[11px]">System Protected</span>
              <span className="text-[10px] text-slate-400">Direct Ingress Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
