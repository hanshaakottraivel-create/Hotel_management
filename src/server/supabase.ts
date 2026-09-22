import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Room,
  Booking,
  Guest,
  Staff,
  HotelTask,
  PaymentTransaction,
  HotelActivity,
} from "../types.js";
import {
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_GUESTS,
  INITIAL_STAFF,
  INITIAL_TASKS,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITIES,
} from "../data/mockData.js";

// Lazy initialized Supabase Client
let cachedClient: SupabaseClient | null = null;
let initialized = false;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}

// In-Memory fallback store to maintain 100% operational resilience
// when Supabase credentials are not yet populated or during connection drops
export const localStore = {
  rooms: [...INITIAL_ROOMS],
  bookings: [...INITIAL_BOOKINGS],
  guests: [...INITIAL_GUESTS],
  staff: [...INITIAL_STAFF],
  tasks: [...INITIAL_TASKS],
  payments: [...INITIAL_PAYMENTS],
  activities: [...INITIAL_ACTIVITIES],
};

// ============================================================================
// Entity Mappers: TypeScript camelCase <-> PostgreSQL snake_case
// ============================================================================

export function mapRoomFromDb(row: any): Room {
  return {
    id: row.id,
    roomNumber: row.room_number,
    floor: Number(row.floor),
    type: row.type,
    status: row.status,
    ratePerNight: Number(row.rate_per_night),
    maxGuests: Number(row.max_guests),
    bedConfig: row.bed_config,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    currentBookingId: row.current_booking_id || undefined,
    currentGuestName: row.current_guest_name || undefined,
    housekeepingNotes: row.housekeeping_notes || undefined,
  };
}

export function mapRoomToDb(r: Partial<Room>): Record<string, any> {
  const data: Record<string, any> = {};
  if (r.id !== undefined) data.id = r.id;
  if (r.roomNumber !== undefined) data.room_number = r.roomNumber;
  if (r.floor !== undefined) data.floor = r.floor;
  if (r.type !== undefined) data.type = r.type;
  if (r.status !== undefined) data.status = r.status;
  if (r.ratePerNight !== undefined) data.rate_per_night = r.ratePerNight;
  if (r.maxGuests !== undefined) data.max_guests = r.maxGuests;
  if (r.bedConfig !== undefined) data.bed_config = r.bedConfig;
  if (r.amenities !== undefined) data.amenities = r.amenities;
  if (r.currentBookingId !== undefined) data.current_booking_id = r.currentBookingId;
  if (r.currentGuestName !== undefined) data.current_guest_name = r.currentGuestName;
  if (r.housekeepingNotes !== undefined) data.housekeeping_notes = r.housekeepingNotes;
  return data;
}

export function mapBookingFromDb(row: any): Booking {
  return {
    id: row.id,
    guestId: row.guest_id || "",
    guestName: row.guest_name,
    guestEmail: row.guest_email || "",
    guestPhone: row.guest_phone || "",
    roomId: row.room_id || "",
    roomNumber: row.room_number,
    roomType: row.room_type,
    checkInDate: typeof row.check_in_date === "string" ? row.check_in_date.split("T")[0] : row.check_in_date,
    checkOutDate: typeof row.check_out_date === "string" ? row.check_out_date.split("T")[0] : row.check_out_date,
    nights: Number(row.nights),
    guestsCount: Number(row.guests_count),
    totalAmount: Number(row.total_amount),
    paidAmount: Number(row.paid_amount || 0),
    paymentStatus: row.payment_status,
    status: row.status,
    source: row.source,
    specialRequests: row.special_requests || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapBookingToDb(b: Partial<Booking>): Record<string, any> {
  const data: Record<string, any> = {};
  if (b.id !== undefined) data.id = b.id;
  if (b.guestId !== undefined) data.guest_id = b.guestId;
  if (b.guestName !== undefined) data.guest_name = b.guestName;
  if (b.guestEmail !== undefined) data.guest_email = b.guestEmail;
  if (b.guestPhone !== undefined) data.guest_phone = b.guestPhone;
  if (b.roomId !== undefined) data.room_id = b.roomId;
  if (b.roomNumber !== undefined) data.room_number = b.roomNumber;
  if (b.roomType !== undefined) data.room_type = b.roomType;
  if (b.checkInDate !== undefined) data.check_in_date = b.checkInDate;
  if (b.checkOutDate !== undefined) data.check_out_date = b.checkOutDate;
  if (b.nights !== undefined) data.nights = b.nights;
  if (b.guestsCount !== undefined) data.guests_count = b.guestsCount;
  if (b.totalAmount !== undefined) data.total_amount = b.totalAmount;
  if (b.paidAmount !== undefined) data.paid_amount = b.paidAmount;
  if (b.paymentStatus !== undefined) data.payment_status = b.paymentStatus;
  if (b.status !== undefined) data.status = b.status;
  if (b.source !== undefined) data.source = b.source;
  if (b.specialRequests !== undefined) data.special_requests = b.specialRequests;
  return data;
}

export function mapGuestFromDb(row: any): Guest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    vipTier: row.vip_tier,
    idNumber: row.id_number || "",
    nationality: row.nationality || "",
    totalVisits: Number(row.total_visits || 0),
    totalSpend: Number(row.total_spend || 0),
    preferences: Array.isArray(row.preferences) ? row.preferences : [],
    notes: row.notes || undefined,
    lastVisit: row.last_visit || undefined,
  };
}

export function mapGuestToDb(g: Partial<Guest>): Record<string, any> {
  const data: Record<string, any> = {};
  if (g.id !== undefined) data.id = g.id;
  if (g.name !== undefined) data.name = g.name;
  if (g.email !== undefined) data.email = g.email;
  if (g.phone !== undefined) data.phone = g.phone;
  if (g.vipTier !== undefined) data.vip_tier = g.vipTier;
  if (g.idNumber !== undefined) data.id_number = g.idNumber;
  if (g.nationality !== undefined) data.nationality = g.nationality;
  if (g.totalVisits !== undefined) data.total_visits = g.totalVisits;
  if (g.totalSpend !== undefined) data.total_spend = g.totalSpend;
  if (g.preferences !== undefined) data.preferences = g.preferences;
  if (g.notes !== undefined) data.notes = g.notes;
  if (g.lastVisit !== undefined) data.last_visit = g.lastVisit;
  return data;
}

export function mapStaffFromDb(row: any): Staff {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    shift: row.shift,
    status: row.status,
    phone: row.phone,
    activeTasks: Number(row.active_tasks || 0),
    rating: Number(row.rating || 5.0),
  };
}

export function mapStaffToDb(s: Partial<Staff>): Record<string, any> {
  const data: Record<string, any> = {};
  if (s.id !== undefined) data.id = s.id;
  if (s.name !== undefined) data.name = s.name;
  if (s.role !== undefined) data.role = s.role;
  if (s.department !== undefined) data.department = s.department;
  if (s.shift !== undefined) data.shift = s.shift;
  if (s.status !== undefined) data.status = s.status;
  if (s.phone !== undefined) data.phone = s.phone;
  if (s.activeTasks !== undefined) data.active_tasks = s.activeTasks;
  if (s.rating !== undefined) data.rating = s.rating;
  return data;
}

export function mapTaskFromDb(row: any): HotelTask {
  return {
    id: row.id,
    title: row.title,
    roomNumber: row.room_number || undefined,
    category: row.category,
    priority: row.priority,
    status: row.status,
    assignedTo: row.assigned_to || undefined,
    dueTime: row.due_time,
    aiPriorityScore: row.ai_priority_score ? Number(row.ai_priority_score) : undefined,
    aiRationale: row.ai_rationale || undefined,
  };
}

export function mapTaskToDb(t: Partial<HotelTask>): Record<string, any> {
  const data: Record<string, any> = {};
  if (t.id !== undefined) data.id = t.id;
  if (t.title !== undefined) data.title = t.title;
  if (t.roomNumber !== undefined) data.room_number = t.roomNumber;
  if (t.category !== undefined) data.category = t.category;
  if (t.priority !== undefined) data.priority = t.priority;
  if (t.status !== undefined) data.status = t.status;
  if (t.assignedTo !== undefined) data.assigned_to = t.assignedTo;
  if (t.dueTime !== undefined) data.due_time = t.dueTime;
  if (t.aiPriorityScore !== undefined) data.ai_priority_score = t.aiPriorityScore;
  if (t.aiRationale !== undefined) data.ai_rationale = t.aiRationale;
  return data;
}

export function mapPaymentFromDb(row: any): PaymentTransaction {
  return {
    id: row.id,
    reservationId: row.reservation_id || "",
    guestName: row.guest_name,
    roomNumber: row.room_number || "",
    amount: Number(row.amount),
    type: row.type,
    method: row.method,
    date: typeof row.date === "string" ? row.date.split("T")[0] : row.date,
    status: row.status,
  };
}

export function mapPaymentToDb(p: Partial<PaymentTransaction>): Record<string, any> {
  const data: Record<string, any> = {};
  if (p.id !== undefined) data.id = p.id;
  if (p.reservationId !== undefined) data.reservation_id = p.reservationId;
  if (p.guestName !== undefined) data.guest_name = p.guestName;
  if (p.roomNumber !== undefined) data.room_number = p.roomNumber;
  if (p.amount !== undefined) data.amount = p.amount;
  if (p.type !== undefined) data.type = p.type;
  if (p.method !== undefined) data.method = p.method;
  if (p.date !== undefined) data.date = p.date;
  if (p.status !== undefined) data.status = p.status;
  return data;
}

export function mapActivityFromDb(row: any): HotelActivity {
  return {
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    message: row.message,
    badgeColor: row.badge_color || "blue",
  };
}

export function mapActivityToDb(a: Partial<HotelActivity>): Record<string, any> {
  const data: Record<string, any> = {};
  if (a.id !== undefined) data.id = a.id;
  if (a.timestamp !== undefined) data.timestamp = a.timestamp;
  if (a.type !== undefined) data.type = a.type;
  if (a.message !== undefined) data.message = a.message;
  if (a.badgeColor !== undefined) data.badge_color = a.badgeColor;
  return data;
}

// ============================================================================
// Auto-seed and Database Health
// ============================================================================

export async function ensureDatabaseSeeded(): Promise<{ seeded: boolean; source: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { seeded: false, source: "local_memory" };
  }

  try {
    const { count, error } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.warn("Supabase query error (table might need migration):", error.message);
      return { seeded: false, source: "supabase_error", error: error.message };
    }

    if (count === 0) {
      console.log("Supabase rooms table is empty. Auto-seeding initial hotel dataset...");

      // 1. Rooms
      const dbRooms = INITIAL_ROOMS.map(mapRoomToDb);
      await supabase.from("rooms").upsert(dbRooms);

      // 2. Guests
      const dbGuests = INITIAL_GUESTS.map(mapGuestToDb);
      await supabase.from("guests").upsert(dbGuests);

      // 3. Bookings
      const dbBookings = INITIAL_BOOKINGS.map(mapBookingToDb);
      await supabase.from("bookings").upsert(dbBookings);

      // 4. Staff
      const dbStaff = INITIAL_STAFF.map(mapStaffToDb);
      await supabase.from("staff").upsert(dbStaff);

      // 5. Tasks
      const dbTasks = INITIAL_TASKS.map(mapTaskToDb);
      await supabase.from("hotel_tasks").upsert(dbTasks);

      // 6. Payments
      const dbPayments = INITIAL_PAYMENTS.map(mapPaymentToDb);
      await supabase.from("payments").upsert(dbPayments);

      // 7. Activities
      const dbActivities = INITIAL_ACTIVITIES.map(mapActivityToDb);
      await supabase.from("activities").upsert(dbActivities);

      console.log("Successfully seeded Supabase PostgreSQL with initial hotel data.");
      return { seeded: true, source: "supabase" };
    }

    return { seeded: false, source: "supabase_already_populated" };
  } catch (err: any) {
    console.error("Failed to seed Supabase:", err);
    return { seeded: false, source: "supabase_exception", error: err?.message };
  }
}

// ============================================================================
// Data Access Methods (Supabase with Local Fallback)
// ============================================================================

export async function fetchRooms(): Promise<Room[]> {
  const supabase = getSupabase();
  if (!supabase) return localStore.rooms;

  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number", { ascending: true });

    if (error || !data || data.length === 0) {
      return localStore.rooms;
    }
    const rooms = data.map(mapRoomFromDb);
    localStore.rooms = rooms;
    return rooms;
  } catch (err) {
    console.error("fetchRooms error:", err);
    return localStore.rooms;
  }
}

export async function upsertRoom(room: Partial<Room> & { id: string }): Promise<Room> {
  const supabase = getSupabase();
  // Update local cache
  const existingIdx = localStore.rooms.findIndex((r) => r.id === room.id);
  let updatedRoom: Room;
  if (existingIdx >= 0) {
    updatedRoom = { ...localStore.rooms[existingIdx], ...room };
    localStore.rooms[existingIdx] = updatedRoom;
  } else {
    updatedRoom = room as Room;
    localStore.rooms.push(updatedRoom);
  }

  if (supabase) {
    try {
      const dbData = mapRoomToDb(room);
      await supabase.from("rooms").upsert(dbData);
    } catch (err) {
      console.error("upsertRoom supabase error:", err);
    }
  }

  return updatedRoom;
}

export async function fetchBookings(): Promise<Booking[]> {
  const supabase = getSupabase();
  if (!supabase) return localStore.bookings;

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("check_in_date", { ascending: false });

    if (error || !data || data.length === 0) {
      return localStore.bookings;
    }
    const bookings = data.map(mapBookingFromDb);
    localStore.bookings = bookings;
    return bookings;
  } catch (err) {
    console.error("fetchBookings error:", err);
    return localStore.bookings;
  }
}

export async function upsertBooking(booking: Partial<Booking> & { id: string }): Promise<Booking> {
  const supabase = getSupabase();
  const existingIdx = localStore.bookings.findIndex((b) => b.id === booking.id);
  let updated: Booking;
  if (existingIdx >= 0) {
    updated = { ...localStore.bookings[existingIdx], ...booking };
    localStore.bookings[existingIdx] = updated;
  } else {
    updated = booking as Booking;
    localStore.bookings.unshift(updated);
  }

  if (supabase) {
    try {
      const dbData = mapBookingToDb(booking);
      await supabase.from("bookings").upsert(dbData);
    } catch (err) {
      console.error("upsertBooking supabase error:", err);
    }
  }

  return updated;
}

export async function deleteBooking(bookingId: string): Promise<boolean> {
  const supabase = getSupabase();
  localStore.bookings = localStore.bookings.filter((b) => b.id !== bookingId);

  if (supabase) {
    try {
      await supabase.from("bookings").delete().eq("id", bookingId);
    } catch (err) {
      console.error("deleteBooking supabase error:", err);
    }
  }

  return true;
}

export async function fetchGuests(): Promise<Guest[]> {
  const supabase = getSupabase();
  if (!supabase) return localStore.guests;

  try {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return localStore.guests;
    }
    const guests = data.map(mapGuestFromDb);
    localStore.guests = guests;
    return guests;
  } catch (err) {
    console.error("fetchGuests error:", err);
    return localStore.guests;
  }
}

export async function upsertGuest(guest: Partial<Guest> & { id: string }): Promise<Guest> {
  const supabase = getSupabase();
  const existingIdx = localStore.guests.findIndex((g) => g.id === guest.id);
  let updated: Guest;
  if (existingIdx >= 0) {
    updated = { ...localStore.guests[existingIdx], ...guest };
    localStore.guests[existingIdx] = updated;
  } else {
    updated = guest as Guest;
    localStore.guests.push(updated);
  }

  if (supabase) {
    try {
      const dbData = mapGuestToDb(guest);
      await supabase.from("guests").upsert(dbData);
    } catch (err) {
      console.error("upsertGuest supabase error:", err);
    }
  }

  return updated;
}

export async function fetchStaff(): Promise<Staff[]> {
  const supabase = getSupabase();
  if (!supabase) return localStore.staff;

  try {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return localStore.staff;
    }
    const staff = data.map(mapStaffFromDb);
    localStore.staff = staff;
    return staff;
  } catch (err) {
    console.error("fetchStaff error:", err);
    return localStore.staff;
  }
}

export async function upsertStaff(staffMember: Partial<Staff> & { id: string }): Promise<Staff> {
  const supabase = getSupabase();
  const existingIdx = localStore.staff.findIndex((s) => s.id === staffMember.id);
  let updated: Staff;
  if (existingIdx >= 0) {
    updated = { ...localStore.staff[existingIdx], ...staffMember };
    localStore.staff[existingIdx] = updated;
  } else {
    updated = staffMember as Staff;
    localStore.staff.push(updated);
  }

  if (supabase) {
    try {
      const dbData = mapStaffToDb(staffMember);
      await supabase.from("staff").upsert(dbData);
    } catch (err) {
      console.error("upsertStaff supabase error:", err);
    }
  }

  return updated;
}

export async function fetchTasks(): Promise<HotelTask[]> {
  const supabase = getSupabase();
  if (!supabase) return localStore.tasks;

  try {
    const { data, error } = await supabase
      .from("hotel_tasks")
      .select("*")
      .order("due_time", { ascending: true });

    if (error || !data || data.length === 0) {
      return localStore.tasks;
    }
    const tasks = data.map(mapTaskFromDb);
    localStore.tasks = tasks;
    return tasks;
  } catch (err) {
    console.error("fetchTasks error:", err);
    return localStore.tasks;
  }
}

export async function upsertTask(task: Partial<HotelTask> & { id: string }): Promise<HotelTask> {
  const supabase = getSupabase();
  const existingIdx = localStore.tasks.findIndex((t) => t.id === task.id);
  let updated: HotelTask;
  if (existingIdx >= 0) {
    updated = { ...localStore.tasks[existingIdx], ...task };
    localStore.tasks[existingIdx] = updated;
  } else {
    updated = task as HotelTask;
    localStore.tasks.unshift(updated);
  }

  if (supabase) {
    try {
      const dbData = mapTaskToDb(task);
      await supabase.from("hotel_tasks").upsert(dbData);
    } catch (err) {
      console.error("upsertTask supabase error:", err);
    }
  }

  return updated;
}

export async function batchUpsertTasks(tasks: HotelTask[]): Promise<HotelTask[]> {
  const supabase = getSupabase();
  localStore.tasks = [...tasks];

  if (supabase) {
    try {
      const dbData = tasks.map(mapTaskToDb);
      await supabase.from("hotel_tasks").upsert(dbData);
    } catch (err) {
      console.error("batchUpsertTasks error:", err);
    }
  }

  return tasks;
}

export async function fetchPayments(): Promise<PaymentTransaction[]> {
  const supabase = getSupabase();
  if (!supabase) return localStore.payments;

  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("date", { ascending: false });

    if (error || !data || data.length === 0) {
      return localStore.payments;
    }
    const payments = data.map(mapPaymentFromDb);
    localStore.payments = payments;
    return payments;
  } catch (err) {
    console.error("fetchPayments error:", err);
    return localStore.payments;
  }
}

export async function insertPayment(payment: PaymentTransaction): Promise<PaymentTransaction> {
  const supabase = getSupabase();
  localStore.payments.unshift(payment);

  if (supabase) {
    try {
      const dbData = mapPaymentToDb(payment);
      await supabase.from("payments").insert(dbData);
    } catch (err) {
      console.error("insertPayment supabase error:", err);
    }
  }

  return payment;
}

export async function fetchActivities(): Promise<HotelActivity[]> {
  const supabase = getSupabase();
  if (!supabase) return localStore.activities;

  try {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      return localStore.activities;
    }
    const activities = data.map(mapActivityFromDb);
    localStore.activities = activities;
    return activities;
  } catch (err) {
    console.error("fetchActivities error:", err);
    return localStore.activities;
  }
}

export async function insertActivity(activity: HotelActivity): Promise<HotelActivity> {
  const supabase = getSupabase();
  localStore.activities.unshift(activity);
  if (localStore.activities.length > 50) {
    localStore.activities.pop();
  }

  if (supabase) {
    try {
      const dbData = mapActivityToDb(activity);
      await supabase.from("activities").insert(dbData);
    } catch (err) {
      console.error("insertActivity supabase error:", err);
    }
  }

  return activity;
}

export async function resetDatabaseToDemo(): Promise<void> {
  const supabase = getSupabase();
  localStore.rooms = [...INITIAL_ROOMS];
  localStore.bookings = [...INITIAL_BOOKINGS];
  localStore.guests = [...INITIAL_GUESTS];
  localStore.staff = [...INITIAL_STAFF];
  localStore.tasks = [...INITIAL_TASKS];
  localStore.payments = [...INITIAL_PAYMENTS];
  localStore.activities = [...INITIAL_ACTIVITIES];

  if (supabase) {
    try {
      await supabase.from("rooms").upsert(INITIAL_ROOMS.map(mapRoomToDb));
      await supabase.from("guests").upsert(INITIAL_GUESTS.map(mapGuestToDb));
      await supabase.from("bookings").upsert(INITIAL_BOOKINGS.map(mapBookingToDb));
      await supabase.from("staff").upsert(INITIAL_STAFF.map(mapStaffToDb));
      await supabase.from("hotel_tasks").upsert(INITIAL_TASKS.map(mapTaskToDb));
      await supabase.from("payments").upsert(INITIAL_PAYMENTS.map(mapPaymentToDb));
      await supabase.from("activities").upsert(INITIAL_ACTIVITIES.map(mapActivityToDb));
    } catch (err) {
      console.error("resetDatabaseToDemo error:", err);
    }
  }
}
