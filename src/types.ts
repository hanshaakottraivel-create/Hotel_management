export type RoomType =
  | "Standard Queen"
  | "Deluxe King"
  | "Executive Suite"
  | "Presidential Suite"
  | "Oceanfront Villa";

export type RoomStatus =
  | "Vacant Clean"
  | "Vacant Dirty"
  | "Occupied"
  | "Maintenance";

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  ratePerNight: number;
  maxGuests: number;
  bedConfig: string;
  amenities: string[];
  currentBookingId?: string;
  currentGuestName?: string;
  housekeepingNotes?: string;
}

export type BookingStatus =
  | "Confirmed"
  | "Checked-In"
  | "Checked-Out"
  | "Cancelled";

export type PaymentStatus = "Paid" | "Pending" | "Partial" | "Refunded";

export type BookingSource =
  | "Direct"
  | "Booking.com"
  | "Expedia"
  | "Corporate"
  | "Walk-In";

export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  guestsCount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  source: BookingSource;
  specialRequests?: string;
  createdAt: string;
}

export type VipTier = "Standard" | "Silver" | "Gold" | "Platinum";

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  vipTier: VipTier;
  idNumber: string;
  nationality: string;
  totalVisits: number;
  totalSpend: number;
  preferences: string[];
  notes?: string;
  lastVisit?: string;
}

export type StaffDepartment =
  | "Front Desk"
  | "Housekeeping"
  | "Maintenance"
  | "Concierge"
  | "Management";

export type ShiftType = "Morning" | "Evening" | "Night";

export interface Staff {
  id: string;
  name: string;
  role: string;
  department: StaffDepartment;
  shift: ShiftType;
  status: "On Duty" | "On Break" | "Off Duty";
  phone: string;
  activeTasks: number;
  rating: number;
}

export type TaskPriority = "Urgent" | "High" | "Medium" | "Low";
export type TaskCategory =
  | "Housekeeping"
  | "Maintenance"
  | "Concierge"
  | "Front Desk";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface HotelTask {
  id: string;
  title: string;
  roomNumber?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string; // staff name
  dueTime: string;
  aiPriorityScore?: number;
  aiRationale?: string;
}

export interface PaymentTransaction {
  id: string;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  amount: number;
  type: "Room Charge" | "Deposit" | "Incidentals" | "Restaurant" | "Spa" | "Refund";
  method: "Credit Card" | "Apple Pay" | "Bank Transfer" | "Cash";
  date: string;
  status: "Completed" | "Pending" | "Refunded";
}

export type PaymentRecord = {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  description: string;
};

export interface HotelActivity {
  id: string;
  timestamp: string;
  type: "check-in" | "check-out" | "room-status" | "payment" | "task" | "booking";
  message: string;
  badgeColor?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: {
    label: string;
    actionType: "mark-clean" | "view-booking" | "prioritize-tasks" | "navigate";
    payload?: any;
  }[];
}

export interface DbStatus {
  connected: boolean;
  provider: "supabase_postgresql" | "local_memory" | "local_resilient_store";
  loading: boolean;
  message?: string;
  supabaseUrl?: string;
  counts?: {
    rooms?: number;
    bookings?: number;
    guests?: number;
    staff?: number;
    tasks?: number;
    payments?: number;
    activities?: number;
  };
}

export type ReportType = "executive-daily" | "revenue-yield" | "housekeeping-turnover" | "guest-vip";

export interface ReportActionItem {
  department: string;
  action: string;
  priority: "High" | "Medium" | "Low";
  timeline?: string;
}

export interface AiGeneratedReport {
  id?: string;
  title: string;
  reportType: ReportType;
  timeframe: "today" | "week" | "month";
  generatedAt: string;
  source: "gemini" | "fallback";
  model: string;
  summary: string;
  keyFindings: string[];
  actionItems: ReportActionItem[];
  strategicAdvice: string;
}

