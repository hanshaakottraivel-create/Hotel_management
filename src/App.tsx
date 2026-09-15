/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HotelProvider, useHotel } from "./context/HotelContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { RoomsView } from "./components/RoomsView";
import { BookingsView } from "./components/BookingsView";
import { AvailabilityView } from "./components/AvailabilityView";
import { GuestsView } from "./components/GuestsView";
import { StaffTasksView } from "./components/StaffTasksView";
import { PaymentsView } from "./components/PaymentsView";
import { AnalyticsView } from "./components/AnalyticsView";
import { AiAssistantDrawer } from "./components/AiAssistantDrawer";
import { GlobalSearchModal } from "./components/GlobalSearchModal";
import { NewBookingModal } from "./components/NewBookingModal";
import { BookingDetailsModal } from "./components/BookingDetailsModal";
import { RoomDetailsModal } from "./components/RoomDetailsModal";
import { GuestDetailsModal } from "./components/GuestDetailsModal";
import { ToastContainer } from "./components/ToastContainer";

const MainLayout: React.FC = () => {
  const { currentTab } = useHotel();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardView />;
      case "rooms":
        return <RoomsView />;
      case "bookings":
        return <BookingsView />;
      case "availability":
        return <AvailabilityView />;
      case "guests":
        return <GuestsView />;
      case "staff":
        return <StaffTasksView />;
      case "payments":
        return <PaymentsView />;
      case "analytics":
        return <AnalyticsView />;
      case "ai":
        return (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Operations Intelligence Copilot
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Full-screen conversational interface with live hotel context. Manage bookings, organize room allocations, optimize turnover schedules, and synthesize management briefings.
              </p>
            </div>
            <AiAssistantDrawer mode="embedded" />
          </div>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />

      {/* Main Container */}
      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 lg:pl-64 transition-all">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Slide-out AI Assistant Drawer (accessible across any tab) */}
      <AiAssistantDrawer mode="drawer" />

      {/* Global Modals */}
      <GlobalSearchModal />
      <NewBookingModal />
      <BookingDetailsModal />
      <RoomDetailsModal />
      <GuestDetailsModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <MainLayout />
    </HotelProvider>
  );
}
