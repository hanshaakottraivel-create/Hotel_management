import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Room,
  Booking,
  Guest,
  Staff,
  HotelTask,
  PaymentTransaction,
  HotelActivity,
  RoomStatus,
  TaskStatus,
  DbStatus,
} from "../types";
import {
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_GUESTS,
  INITIAL_STAFF,
  INITIAL_TASKS,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITIES,
} from "../data/mockData";

export type NavigationTab =
  | "dashboard"
  | "rooms"
  | "bookings"
  | "availability"
  | "guests"
  | "staff"
  | "payments"
  | "analytics"
  | "ai";

interface ToastNotification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
}

interface HotelContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNewBookingOpen: boolean;
  setIsNewBookingOpen: (open: boolean) => void;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  selectedGuestId: string | null;
  setSelectedGuestId: (id: string | null) => void;

  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  staff: Staff[];
  tasks: HotelTask[];
  payments: PaymentTransaction[];
  activities: HotelActivity[];

  // Metric computations
  occupancyRate: number;
  totalRooms: number;
  occupiedRoomsCount: number;
  vacantCleanCount: number;
  vacantDirtyCount: number;
  maintenanceCount: number;
  adr: number;
  revPar: number;
  todayRevenue: number;
  todayArrivalsCount: number;
  todayDeparturesCount: number;
  inHouseCount: number;

  // Actions
  updateRoomStatus: (roomId: string, status: RoomStatus, notes?: string) => void;
  updateRoomRate: (roomId: string, newRate: number) => void;
  addRoom: (room: Omit<Room, "id">) => void;
  editRoom: (roomId: string, updates: Partial<Room>) => void;
  checkInBooking: (bookingId: string) => void;
  checkOutBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => Booking;
  addGuest: (guest: Omit<Guest, "id">) => Guest;
  updateGuest: (guestId: string, updates: Partial<Guest>) => void;
  addTask: (task: Omit<HotelTask, "id">) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  applyAiPrioritizedTasks: (newTasks: HotelTask[]) => void;
  addPayment: (payment: Omit<PaymentTransaction, "id" | "date">) => void;
  recordPayment: (payment: any) => void;
  resetToDemo: () => void;
  dbStatus: DbStatus;
  syncDatabase: () => Promise<void>;

  toasts: ToastNotification[];
  showToast: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  removeToast: (id: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROOMS: "hms_rooms_v1",
  BOOKINGS: "hms_bookings_v1",
  GUESTS: "hms_guests_v1",
  STAFF: "hms_staff_v1",
  TASKS: "hms_tasks_v1",
  PAYMENTS: "hms_payments_v1",
  ACTIVITIES: "hms_activities_v1",
};

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>("dashboard");
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent States
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GUESTS);
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [tasks, setTasks] = useState<HotelTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [activities, setActivities] = useState<HotelActivity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [dbStatus, setDbStatus] = useState<DbStatus>({
    connected: false,
    provider: "local_memory",
    loading: true,
  });

  // Synchronize state with backend API / Supabase PostgreSQL
  const syncDatabase = async () => {
    try {
      setDbStatus((prev) => ({ ...prev, loading: true }));
      const [
        statusRes,
        roomsRes,
        bookingsRes,
        guestsRes,
        staffRes,
        tasksRes,
        paymentsRes,
        activitiesRes,
      ] = await Promise.allSettled([
        fetch("/api/db/status").then((r) => r.json()),
        fetch("/api/rooms").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
        fetch("/api/guests").then((r) => r.json()),
        fetch("/api/staff").then((r) => r.json()),
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/payments").then((r) => r.json()),
        fetch("/api/activities").then((r) => r.json()),
      ]);

      if (statusRes.status === "fulfilled" && statusRes.value) {
        setDbStatus({
          connected: Boolean(statusRes.value.connected),
          provider: statusRes.value.provider || "local_memory",
          loading: false,
          supabaseUrl: statusRes.value.supabaseUrl,
          message: statusRes.value.message,
          counts: statusRes.value.counts,
        });
      } else {
        setDbStatus((prev) => ({ ...prev, loading: false }));
      }

      if (roomsRes.status === "fulfilled" && Array.isArray(roomsRes.value) && roomsRes.value.length > 0) {
        setRooms(roomsRes.value);
      }
      if (bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value) && bookingsRes.value.length > 0) {
        setBookings(bookingsRes.value);
      }
      if (guestsRes.status === "fulfilled" && Array.isArray(guestsRes.value) && guestsRes.value.length > 0) {
        setGuests(guestsRes.value);
      }
      if (staffRes.status === "fulfilled" && Array.isArray(staffRes.value) && staffRes.value.length > 0) {
        setStaff(staffRes.value);
      }
      if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value) && tasksRes.value.length > 0) {
        setTasks(tasksRes.value);
      }
      if (paymentsRes.status === "fulfilled" && Array.isArray(paymentsRes.value) && paymentsRes.value.length > 0) {
        setPayments(paymentsRes.value);
      }
      if (activitiesRes.status === "fulfilled" && Array.isArray(activitiesRes.value) && activitiesRes.value.length > 0) {
        setActivities(activitiesRes.value);
      }
    } catch (err) {
      console.error("Database sync error:", err);
      setDbStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // Initial fetch from backend / Supabase
  useEffect(() => {
    syncDatabase();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  }, [guests]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  const showToast = (message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addActivity = (type: HotelActivity["type"], message: string, badgeColor: string = "blue") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newAct: HotelActivity = {
      id: "act-" + Date.now(),
      timestamp: timeStr,
      type,
      message,
      badgeColor,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 29)]);

    fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAct),
    }).catch((err) => console.warn("Activity sync error:", err));
  };

  // Metrics
  const totalRooms = rooms.length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === "Occupied").length;
  const vacantCleanCount = rooms.filter((r) => r.status === "Vacant Clean").length;
  const vacantDirtyCount = rooms.filter((r) => r.status === "Vacant Dirty").length;
  const maintenanceCount = rooms.filter((r) => r.status === "Maintenance").length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRoomsCount / totalRooms) * 100) : 0;

  const activeInHouseBookings = bookings.filter((b) => b.status === "Checked-In");
  const inHouseCount = activeInHouseBookings.reduce((sum, b) => sum + b.guestsCount, 0);

  const totalOccupiedRateSum = rooms
    .filter((r) => r.status === "Occupied")
    .reduce((sum, r) => sum + r.ratePerNight, 0);
  const adr = occupiedRoomsCount > 0 ? Math.round(totalOccupiedRateSum / occupiedRoomsCount) : 0;
  const revPar = totalRooms > 0 ? Math.round(totalOccupiedRateSum / totalRooms) : 0;

  // Payments for 2026-09-15
  const todayRevenue = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const todayArrivalsCount = bookings.filter(
    (b) => b.checkInDate === "2026-09-15" && (b.status === "Confirmed" || b.status === "Checked-In")
  ).length;

  const todayDeparturesCount = bookings.filter(
    (b) => b.checkOutDate === "2026-09-15"
  ).length;

  // Handlers
  const updateRoomStatus = (roomId: string, status: RoomStatus, notes?: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status,
            housekeepingNotes: notes !== undefined ? notes : r.housekeepingNotes,
            // Clear guest name if vacant
            currentGuestName: status.startsWith("Vacant") || status === "Maintenance" ? undefined : r.currentGuestName,
            currentBookingId: status.startsWith("Vacant") || status === "Maintenance" ? undefined : r.currentBookingId,
          };
        }
        return r;
      })
    );
    const targetRoom = rooms.find((r) => r.id === roomId);
    const badge = status === "Vacant Clean" ? "emerald" : status === "Occupied" ? "blue" : status === "Vacant Dirty" ? "amber" : "rose";
    addActivity("room-status", `Room ${targetRoom?.roomNumber || roomId} status set to ${status}`, badge);
    showToast(`Room ${targetRoom?.roomNumber || roomId} marked as ${status}`);

    // Sync to backend / Supabase
    fetch(`/api/rooms/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        housekeepingNotes: notes !== undefined ? notes : targetRoom?.housekeepingNotes,
      }),
    }).catch((err) => console.warn("Sync room status error:", err));
  };

  const updateRoomRate = (roomId: string, newRate: number) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, ratePerNight: newRate } : r))
    );
    const targetRoom = rooms.find((r) => r.id === roomId);
    showToast(`Room ${targetRoom?.roomNumber} rate updated to $${newRate}/night`);

    // Sync to backend / Supabase
    fetch(`/api/rooms/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratePerNight: newRate }),
    }).catch((err) => console.warn("Sync room rate error:", err));
  };

  const addRoom = (newRoomData: Omit<Room, "id">) => {
    const id = "room-" + Date.now();
    const newRoom: Room = { ...newRoomData, id };
    setRooms((prev) => [...prev, newRoom]);
    showToast(`Room ${newRoom.roomNumber} added successfully`);

    // Sync to backend / Supabase
    fetch(`/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoom),
    }).catch((err) => console.warn("Sync add room error:", err));
  };

  const editRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, ...updates } : r)));
    showToast("Room updated successfully");

    // Sync to backend / Supabase
    fetch(`/api/rooms/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch((err) => console.warn("Sync edit room error:", err));
  };

  const checkInBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Checked-In" } : b))
    );

    // Update Room to Occupied
    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.roomId || r.roomNumber === booking.roomNumber
          ? {
              ...r,
              status: "Occupied",
              currentBookingId: booking.id,
              currentGuestName: booking.guestName,
            }
          : r
      )
    );

    addActivity("check-in", `Guest ${booking.guestName} checked in to Room ${booking.roomNumber}`, "emerald");
    showToast(`${booking.guestName} checked in to Room ${booking.roomNumber}`);

    // Sync to backend / Supabase
    fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Checked-In" }),
    }).catch((err) => console.warn("Sync booking check-in error:", err));

    const targetRoom = rooms.find((r) => r.id === booking.roomId || r.roomNumber === booking.roomNumber);
    if (targetRoom) {
      fetch(`/api/rooms/${targetRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Occupied",
          currentBookingId: booking.id,
          currentGuestName: booking.guestName,
        }),
      }).catch((err) => console.warn("Sync room check-in error:", err));
    }
  };

  const checkOutBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Checked-Out" } : b))
    );

    // Room becomes Vacant Dirty
    setRooms((prev) =>
      prev.map((r) =>
        r.id === booking.roomId || r.roomNumber === booking.roomNumber
          ? {
              ...r,
              status: "Vacant Dirty",
              currentBookingId: undefined,
              currentGuestName: undefined,
              housekeepingNotes: `Checkout today. Requires full turnover.`,
            }
          : r
      )
    );

    // Add turnover task
    const taskId = "tsk-" + Date.now();
    const newTask: HotelTask = {
      id: taskId,
      title: `Turnover Room ${booking.roomNumber} after checkout`,
      roomNumber: booking.roomNumber,
      category: "Housekeeping",
      priority: "High",
      status: "Pending",
      dueTime: "15:00",
      aiPriorityScore: 89,
      aiRationale: `Fresh departure on ${booking.roomNumber}. Clean before afternoon check-ins.`,
    };
    setTasks((prev) => [newTask, ...prev]);

    addActivity("check-out", `Guest ${booking.guestName} checked out from Room ${booking.roomNumber}`, "blue");
    showToast(`${booking.guestName} checked out. Room ${booking.roomNumber} queued for housekeeping.`);

    // Sync to backend / Supabase
    fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Checked-Out" }),
    }).catch((err) => console.warn("Sync booking checkout error:", err));

    const targetRoom = rooms.find((r) => r.id === booking.roomId || r.roomNumber === booking.roomNumber);
    if (targetRoom) {
      fetch(`/api/rooms/${targetRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Vacant Dirty",
          currentBookingId: null,
          currentGuestName: null,
          housekeepingNotes: "Checkout today. Requires full turnover.",
        }),
      }).catch((err) => console.warn("Sync room checkout error:", err));
    }

    fetch(`/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    }).catch((err) => console.warn("Sync checkout task error:", err));
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" } : b))
    );

    if (booking.status === "Checked-In") {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === booking.roomId
            ? { ...r, status: "Vacant Clean", currentBookingId: undefined, currentGuestName: undefined }
            : r
        )
      );
      fetch(`/api/rooms/${booking.roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Vacant Clean", currentBookingId: null, currentGuestName: null }),
      }).catch((err) => console.warn("Sync cancel room error:", err));
    }

    addActivity("booking", `Reservation ${booking.id} cancelled for ${booking.guestName}`, "rose");
    showToast(`Reservation ${booking.id} cancelled`, "info");

    fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" }),
    }).catch((err) => console.warn("Sync cancel booking error:", err));
  };

  const createBooking = (bookingData: Omit<Booking, "id" | "createdAt">): Booking => {
    const id = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setBookings((prev) => [newBooking, ...prev]);

    // If starts today and checked in immediately
    if (newBooking.status === "Checked-In") {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === newBooking.roomId || r.roomNumber === newBooking.roomNumber
            ? {
                ...r,
                status: "Occupied",
                currentBookingId: id,
                currentGuestName: newBooking.guestName,
              }
            : r
        )
      );
    }

    // Add payment transaction
    if (newBooking.paidAmount > 0) {
      const paymentId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPayment: PaymentTransaction = {
        id: paymentId,
        reservationId: id,
        guestName: newBooking.guestName,
        roomNumber: newBooking.roomNumber,
        amount: newBooking.paidAmount,
        type: "Room Charge",
        method: "Credit Card",
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "Completed",
      };
      setPayments((prev) => [newPayment, ...prev]);

      fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPayment),
      }).catch((err) => console.warn("Sync payment error:", err));
    }

    addActivity("booking", `New reservation ${id} for ${newBooking.guestName} (${newBooking.roomType})`, "blue");
    showToast(`Booking ${id} confirmed for ${newBooking.guestName}`);

    // Sync to backend / Supabase
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking),
    }).catch((err) => console.warn("Sync create booking error:", err));

    if (newBooking.status === "Checked-In") {
      const targetRoom = rooms.find((r) => r.id === newBooking.roomId || r.roomNumber === newBooking.roomNumber);
      if (targetRoom) {
        fetch(`/api/rooms/${targetRoom.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Occupied",
            currentBookingId: id,
            currentGuestName: newBooking.guestName,
          }),
        }).catch((err) => console.warn("Sync room checkin error:", err));
      }
    }

    return newBooking;
  };

  const addGuest = (guestData: Omit<Guest, "id">): Guest => {
    const id = "gst-" + Date.now();
    const newGuest: Guest = { ...guestData, id };
    setGuests((prev) => [...prev, newGuest]);
    showToast(`Guest profile created for ${newGuest.name}`);

    // Sync to backend / Supabase
    fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGuest),
    }).catch((err) => console.warn("Sync guest error:", err));

    return newGuest;
  };

  const updateGuest = (guestId: string, updates: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, ...updates } : g)));
    showToast("Guest profile updated");

    // Sync to backend / Supabase
    fetch(`/api/guests/${guestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch((err) => console.warn("Sync update guest error:", err));
  };

  const addTask = (taskData: Omit<HotelTask, "id">) => {
    const id = "tsk-" + Date.now();
    const newTask: HotelTask = { ...taskData, id };
    setTasks((prev) => [newTask, ...prev]);
    addActivity("task", `New task added: ${newTask.title}`, "amber");
    showToast(`Task assigned: ${newTask.title}`);

    // Sync to backend / Supabase
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    }).catch((err) => console.warn("Sync task error:", err));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    const target = tasks.find((t) => t.id === taskId);
    if (status === "Completed") {
      // If task was housekeeping turnover, offer to mark room clean
      if (target?.category === "Housekeeping" && target.roomNumber) {
        setRooms((prev) =>
          prev.map((r) =>
            r.roomNumber === target.roomNumber && r.status === "Vacant Dirty"
              ? { ...r, status: "Vacant Clean", housekeepingNotes: "Cleaned and sanitized" }
              : r
          )
        );
        const targetRoom = rooms.find((r) => r.roomNumber === target.roomNumber);
        if (targetRoom) {
          fetch(`/api/rooms/${targetRoom.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Vacant Clean", housekeepingNotes: "Cleaned and sanitized" }),
          }).catch((err) => console.warn("Sync room clean error:", err));
        }
      }
      showToast(`Task completed: ${target?.title || "Work order"}`);
    }

    // Sync to backend / Supabase
    fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch((err) => console.warn("Sync task status error:", err));
  };

  const applyAiPrioritizedTasks = (newTasks: HotelTask[]) => {
    setTasks(newTasks);
    showToast("Tasks prioritized using AI Operations Assistant", "info");

    // Sync batch to backend / Supabase
    fetch("/api/tasks/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: newTasks }),
    }).catch((err) => console.warn("Sync batch tasks error:", err));
  };

  const addPayment = (paymentData: Omit<PaymentTransaction, "id" | "date">) => {
    const id = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: PaymentTransaction = {
      ...paymentData,
      id,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setPayments((prev) => [newTx, ...prev]);
    addActivity("payment", `Payment $${newTx.amount} processed for ${newTx.guestName}`, "emerald");
    showToast(`Payment of $${newTx.amount} processed`);

    // Sync to backend / Supabase
    fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTx),
    }).catch((err) => console.warn("Sync payment error:", err));
  };

  const resetToDemo = () => {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.GUESTS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    setRooms(INITIAL_ROOMS);
    setBookings(INITIAL_BOOKINGS);
    setGuests(INITIAL_GUESTS);
    setStaff(INITIAL_STAFF);
    setTasks(INITIAL_TASKS);
    setPayments(INITIAL_PAYMENTS);
    setActivities(INITIAL_ACTIVITIES);
    showToast("Reset to initial demo data", "info");

    // Sync reset to backend / Supabase
    fetch("/api/db/reset", { method: "POST" })
      .then(() => syncDatabase())
      .catch((err) => console.warn("Reset backend DB error:", err));
  };

  return (
    <HotelContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        isSearchOpen,
        setIsSearchOpen,
        isNewBookingOpen,
        setIsNewBookingOpen,
        selectedBookingId,
        setSelectedBookingId,
        selectedRoomId,
        setSelectedRoomId,
        selectedGuestId,
        setSelectedGuestId,

        rooms,
        bookings,
        guests,
        staff,
        tasks,
        payments,
        activities,

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

        updateRoomStatus,
        updateRoomRate,
        addRoom,
        editRoom,
        checkInBooking,
        checkOutBooking,
        cancelBooking,
        createBooking,
        addGuest,
        updateGuest,
        addTask,
        updateTaskStatus,
        applyAiPrioritizedTasks,
        addPayment,
        recordPayment: addPayment,
        resetToDemo,
        dbStatus,
        syncDatabase,

        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error("useHotel must be used within a HotelProvider");
  }
  return context;
};
