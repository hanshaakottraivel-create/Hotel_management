import React, { useState, useMemo } from "react";
import { useHotel } from "../context/HotelContext";
import { Room, RoomStatus, RoomType } from "../types";
import {
  DoorClosed,
  Plus,
  Filter,
  Search,
  Check,
  Wrench,
  Sparkles,
  Layers,
  LayoutGrid,
  List,
  Edit2,
  DollarSign,
  User,
} from "lucide-react";

export const RoomsView: React.FC = () => {
  const {
    rooms,
    updateRoomStatus,
    updateRoomRate,
    setSelectedRoomId,
    addRoom,
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Add Room Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomType, setNewRoomType] = useState<RoomType>("Deluxe King");
  const [newRoomRate, setNewRoomRate] = useState(199);
  const [newBedConfig, setNewBedConfig] = useState("1 King Bed");

  // Editing rate inline
  const [editingRateRoomId, setEditingRateRoomId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(0);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = r.roomNumber.toLowerCase().includes(q);
        const matchesType = r.type.toLowerCase().includes(q);
        const matchesGuest = r.currentGuestName?.toLowerCase().includes(q);
        if (!matchesNumber && !matchesType && !matchesGuest) return false;
      }

      if (selectedFloor !== "All" && r.floor !== Number(selectedFloor)) {
        return false;
      }

      if (selectedStatus !== "All" && r.status !== selectedStatus) {
        return false;
      }

      if (selectedType !== "All" && r.type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [rooms, searchQuery, selectedFloor, selectedStatus, selectedType]);

  const handleSaveRate = (roomId: string) => {
    if (tempRate > 0) {
      updateRoomRate(roomId, tempRate);
    }
    setEditingRateRoomId(null);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    addRoom({
      roomNumber: newRoomNumber.trim(),
      floor: Number(newRoomFloor),
      type: newRoomType,
      status: "Vacant Clean",
      ratePerNight: Number(newRoomRate),
      maxGuests: newRoomType.includes("Suite") || newRoomType.includes("Villa") ? 4 : 2,
      bedConfig: newBedConfig,
      amenities: ["Free Wi-Fi", "Smart TV", "Air Conditioning", "Coffee Maker"],
      housekeepingNotes: "Newly added room. Inspected and ready.",
    });

    setIsAddModalOpen(false);
    setNewRoomNumber("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-indigo-600" />
            Room Management & Housekeeping
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {rooms.length} rooms inventory. Manage statuses, daily rates, and maintenance orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-add-room"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room number, type, or guest..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Vacant Clean">Vacant Clean</option>
              <option value="Vacant Dirty">Vacant Dirty</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Floor:</span>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Floors</option>
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
              <option value="4">Floor 4</option>
              <option value="5">Floor 5</option>
            </select>
          </div>

          {/* Room Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Types</option>
              <option value="Standard Queen">Standard Queen</option>
              <option value="Deluxe King">Deluxe King</option>
              <option value="Executive Suite">Executive Suite</option>
              <option value="Presidential Suite">Presidential Suite</option>
              <option value="Oceanfront Villa">Oceanfront Villa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const isClean = room.status === "Vacant Clean";
            const isDirty = room.status === "Vacant Dirty";
            const isOccupied = room.status === "Occupied";
            const isMaintenance = room.status === "Maintenance";

            return (
              <div
                key={room.id}
                id={`room-card-${room.roomNumber}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Room # and Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 tracking-tight">
                      Room {room.roomNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isClean
                          ? "bg-emerald-100 text-emerald-800"
                          : isOccupied
                          ? "bg-blue-100 text-blue-800"
                          : isDirty
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>

                  {/* Room Type & Details */}
                  <div className="text-xs font-medium text-slate-600 mt-1">
                    {room.type} • Floor {room.floor}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {room.bedConfig} • Max {room.maxGuests} guests
                  </div>

                  {/* Occupant / Notes */}
                  {isOccupied && room.currentGuestName ? (
                    <div className="mt-2.5 p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-blue-900">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold truncate">{room.currentGuestName}</span>
                    </div>
                  ) : room.housekeepingNotes ? (
                    <div className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg line-clamp-2">
                      {room.housekeepingNotes}
                    </div>
                  ) : null}

                  {/* Rate inline edit */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-700">
                    <span className="text-slate-400">Nightly Rate:</span>
                    {editingRateRoomId === room.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">$</span>
                        <input
                          type="number"
                          value={tempRate}
                          onChange={(e) => setTempRate(Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 text-xs rounded border border-indigo-400 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRate(room.id)}
                          className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-[10px]"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingRateRoomId(room.id);
                          setTempRate(room.ratePerNight);
                        }}
                        className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 group"
                        title="Click to edit rate"
                      >
                        ${room.ratePerNight}
                        <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-indigo-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Status Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  {isDirty && (
                    <button
                      onClick={() => updateRoomStatus(room.id, "Vacant Clean", "Inspected and ready")}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-colors text-center"
                    >
                      Mark Clean
                    </button>
                  )}

                  {isClean && (
                    <button
                      onClick={() => updateRoomStatus(room.id, "Vacant Dirty")}
                      className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors text-center"
                    >
                      Mark Dirty
                    </button>
                  )}

                  {isOccupied && (
                    <span className="text-[11px] text-blue-600 font-medium">In-House</span>
                  )}

                  {isMaintenance ? (
                    <button
                      onClick={() => updateRoomStatus(room.id, "Vacant Clean", "Repairs cleared")}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors text-center"
                    >
                      Clear Maintenance
                    </button>
                  ) : (
                    <button
                      onClick={() => updateRoomStatus(room.id, "Maintenance", "Reported maintenance required")}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Set Out of Order / Maintenance"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedRoomId(room.id)}
                    className="py-1 px-2 rounded-lg text-indigo-600 hover:bg-indigo-50 text-[11px] font-semibold transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Type & Bed</th>
                  <th className="py-3 px-4">Floor</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Current Guest</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{room.roomNumber}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{room.type}</div>
                      <div className="text-[11px] text-slate-400">{room.bedConfig}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">Floor {room.floor}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">${room.ratePerNight}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {room.currentGuestName || "-"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {room.status === "Vacant Dirty" && (
                        <button
                          onClick={() => updateRoomStatus(room.id, "Vacant Clean")}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]"
                        >
                          Clean
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedRoomId(room.id)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
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
              <h3 className="font-bold text-sm text-slate-900">Add New Hotel Room</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Number or Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="e.g. 305 or Villa 3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rate / Night ($)
                  </label>
                  <input
                    type="number"
                    min={50}
                    value={newRoomRate}
                    onChange={(e) => setNewRoomRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Type
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
                >
                  <option value="Standard Queen">Standard Queen</option>
                  <option value="Deluxe King">Deluxe King</option>
                  <option value="Executive Suite">Executive Suite</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                  <option value="Oceanfront Villa">Oceanfront Villa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bed Configuration
                </label>
                <input
                  type="text"
                  value={newBedConfig}
                  onChange={(e) => setNewBedConfig(e.target.value)}
                  placeholder="e.g. 1 King Bed or 2 Queen Beds"
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
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
