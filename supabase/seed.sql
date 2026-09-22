-- Supabase Seed Data for Grand Horizon Hotel Management System
-- Generated: 2026-09-22

-- 1. Insert Initial Rooms
INSERT INTO public.rooms (id, room_number, floor, type, status, rate_per_night, max_guests, bed_config, amenities, current_booking_id, current_guest_name, housekeeping_notes)
VALUES
  ('room-101', '101', 1, 'Standard Queen', 'Occupied', 149.00, 2, '1 Queen Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Coffee Maker', 'Work Desk'], 'res-101', 'Marcus Brody', NULL),
  ('room-102', '102', 1, 'Standard Queen', 'Vacant Clean', 149.00, 2, '1 Queen Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Coffee Maker', 'Garden View'], NULL, NULL, 'Inspected by Lead Maria at 09:15 AM'),
  ('room-103', '103', 1, 'Deluxe King', 'Vacant Dirty', 199.00, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Mini Fridge', 'Espresso Bar', 'Garden View'], NULL, NULL, 'Guest checked out at 11:00 AM. Requires full linen reset.'),
  ('room-104', '104', 1, 'Deluxe King', 'Occupied', 199.00, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Mini Fridge', 'Espresso Bar'], 'res-104', 'Elena Rostova', NULL),
  ('room-201', '201', 2, 'Standard Queen', 'Vacant Clean', 159.00, 2, '1 Queen Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Balcony', 'Work Desk'], NULL, NULL, NULL),
  ('room-202', '202', 2, 'Deluxe King', 'Maintenance', 219.00, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Balcony', 'Rain Shower'], NULL, NULL, 'AC coolant valve repair in progress by David K. ETA 15:30.'),
  ('room-203', '203', 2, 'Deluxe King', 'Occupied', 219.00, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Balcony', 'Rain Shower'], 'res-203', 'David Chen', NULL),
  ('room-204', '204', 2, 'Executive Suite', 'Vacant Dirty', 329.00, 4, '1 King Bed + Sofa Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Mini Fridge', 'Espresso Bar', 'Ocean View', 'Balcony', 'Soaking Tub'], NULL, NULL, 'Departed 10:30. Fast-track for incoming Platinum VIP arrival at 14:00.'),
  ('room-301', '301', 3, 'Deluxe King', 'Occupied', 239.00, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Balcony', 'Panoramic View'], 'res-301', 'Sophia Al-Mansoor', NULL),
  ('room-302', '302', 3, 'Executive Suite', 'Occupied', 349.00, 4, '1 King Bed + Sofa Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Espresso Bar', 'Ocean View', 'Balcony', 'Soaking Tub'], 'res-302', 'Dr. Julian Hayes', NULL),
  ('room-303', '303', 3, 'Deluxe King', 'Vacant Clean', 239.00, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Balcony', 'Panoramic View'], NULL, NULL, 'Linen refreshed, mini-bar restocked.'),
  ('room-304', '304', 3, 'Deluxe King', 'Vacant Dirty', 239.00, 2, '1 King Bed', ARRAY['Free Wi-Fi', 'Smart TV', 'Balcony'], NULL, NULL, 'Priority turnover assigned to Maria S.'),
  ('room-401', '401', 4, 'Executive Suite', 'Occupied', 389.00, 4, '1 King Bed + Living Area', ARRAY['Ocean View', 'Balcony', 'Soaking Tub', 'Complimentary Champagne', 'VIP Lounge Access'], 'res-401', 'Eleanor Vance', NULL),
  ('room-402', '402', 4, 'Executive Suite', 'Vacant Clean', 389.00, 4, '1 King Bed + Living Area', ARRAY['Ocean View', 'Balcony', 'Soaking Tub', 'VIP Lounge Access'], NULL, NULL, 'VIP arrival inspection cleared.'),
  ('room-501', '501', 5, 'Presidential Suite', 'Occupied', 749.00, 6, '2 King Bedrooms + Grand Living', ARRAY['Panoramic Ocean View', 'Private Terrace', 'Jacuzzi', 'Butler Pantry', 'Grand Piano', 'VIP Lounge Access'], 'res-501', 'Sir Arthur Sterling', NULL),
  ('room-502', '502', 5, 'Presidential Suite', 'Vacant Clean', 749.00, 6, '2 King Bedrooms + Grand Living', ARRAY['Panoramic Ocean View', 'Private Terrace', 'Jacuzzi', 'Butler Pantry', 'VIP Lounge Access'], NULL, NULL, 'High-profile staging completed.'),
  ('room-v1', 'Villa 1', 1, 'Oceanfront Villa', 'Occupied', 1199.00, 8, '3 King Bedrooms + Private Pool', ARRAY['Direct Beach Access', 'Private Infinity Pool', 'Outdoor Kitchen', 'Personal Butler', 'Golf Cart'], 'res-v1', 'Camilla Dupont', NULL),
  ('room-v2', 'Villa 2', 1, 'Oceanfront Villa', 'Vacant Clean', 1199.00, 8, '3 King Bedrooms + Private Pool', ARRAY['Direct Beach Access', 'Private Infinity Pool', 'Outdoor Kitchen', 'Personal Butler', 'Golf Cart'], NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  rate_per_night = EXCLUDED.rate_per_night,
  current_booking_id = EXCLUDED.current_booking_id,
  current_guest_name = EXCLUDED.current_guest_name,
  housekeeping_notes = EXCLUDED.housekeeping_notes;

-- 2. Insert Initial Guests
INSERT INTO public.guests (id, name, email, phone, vip_tier, id_number, nationality, total_visits, total_spend, preferences, notes, last_visit)
VALUES
  ('gst-01', 'Marcus Brody', 'marcus.brody@venturecap.com', '+1 (415) 882-9011', 'Silver', 'P8920194A', 'United States', 4, 2450.00, ARRAY['Quiet Room', 'Extra Foam Pillows', 'Daily Wall Street Journal'], 'Prefers ground floor or close to elevator.', '2026-06-12'),
  ('gst-02', 'Elena Rostova', 'e.rostova@designhaus.de', '+49 30 901820', 'Gold', 'DE7739102', 'Germany', 7, 6180.00, ARRAY['Ocean View', 'Oat Milk for Coffee Bar', 'Late Check-out 13:00'], 'Frequent corporate designer guest.', '2026-08-01'),
  ('gst-03', 'Dr. Julian Hayes', 'jhayes@oxfordbiotech.org', '+44 20 7946 0922', 'Platinum', 'GB44901920', 'United Kingdom', 12, 14200.00, ARRAY['High Floor', 'Feather-free bedding', 'Sparkling water stocked', 'Early breakfast'], 'Requires quiet work environment for evening seminars.', '2026-07-22'),
  ('gst-04', 'Sir Arthur Sterling', 'sterling@capitaltrust.co.uk', '+44 7700 900381', 'Platinum', 'GB99019283', 'United Kingdom', 15, 34500.00, ARRAY['Presidential Suite Only', 'Private Airport Chauffeur', '2015 Bordeaux Wine'], 'VIP Founder Circle. Always greet by name at private check-in.', '2026-05-19'),
  ('gst-05', 'Camilla Dupont', 'camilla.dupont@artlux.fr', '+33 6 12 34 56 78', 'Platinum', 'FR1829038', 'France', 6, 18900.00, ARRAY['Villa Only', 'Spa Massage Booking', 'Fresh White Lilies Daily'], 'Hosting gallery art curator gathering.', '2026-04-10'),
  ('gst-06', 'Eleanor Vance', 'evance@vanceholdings.com', '+1 (212) 555-0199', 'Platinum', 'US9821039', 'United States', 9, 11800.00, ARRAY['Ocean View Suite', 'Allergy Friendly', 'Valet Parking'], 'Arriving via private towncar at 14:00.', '2026-07-04')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial Bookings
INSERT INTO public.bookings (id, guest_id, guest_name, guest_email, guest_phone, room_id, room_number, room_type, check_in_date, check_out_date, nights, guests_count, total_amount, paid_amount, payment_status, status, source, special_requests)
VALUES
  ('res-101', 'gst-01', 'Marcus Brody', 'marcus.brody@venturecap.com', '+1 (415) 882-9011', 'room-101', '101', 'Standard Queen', '2026-09-14', '2026-09-18', 4, 1, 596.00, 596.00, 'Paid', 'Checked-In', 'Corporate', 'Quiet room away from elevator'),
  ('res-104', 'gst-02', 'Elena Rostova', 'e.rostova@designhaus.de', '+49 30 901820', 'room-104', '104', 'Deluxe King', '2026-09-13', '2026-09-17', 4, 1, 796.00, 796.00, 'Paid', 'Checked-In', 'Direct', 'Late check-out requested'),
  ('res-203', 'gst-03', 'David Chen', 'david.chen@techventures.io', '+1 (650) 412-8890', 'room-203', '203', 'Deluxe King', '2026-09-15', '2026-09-19', 4, 2, 876.00, 438.00, 'Partial', 'Checked-In', 'Booking.com', 'High speed internet connection required'),
  ('res-302', 'gst-03', 'Dr. Julian Hayes', 'jhayes@oxfordbiotech.org', '+44 20 7946 0922', 'room-302', '302', 'Executive Suite', '2026-09-15', '2026-09-20', 5, 1, 1745.00, 1745.00, 'Paid', 'Checked-In', 'Direct', 'Allergy-free synthetic bedding'),
  ('res-401', 'gst-06', 'Eleanor Vance', 'evance@vanceholdings.com', '+1 (212) 555-0199', 'room-401', '401', 'Executive Suite', '2026-09-15', '2026-09-22', 7, 2, 2723.00, 2723.00, 'Paid', 'Confirmed', 'Direct', 'VIP welcome champagne in room upon arrival'),
  ('res-501', 'gst-04', 'Sir Arthur Sterling', 'sterling@capitaltrust.co.uk', '+44 7700 900381', 'room-501', '501', 'Presidential Suite', '2026-09-12', '2026-09-19', 7, 3, 5243.00, 5243.00, 'Paid', 'Checked-In', 'Direct', 'Butler service, private airport transfer'),
  ('res-v1', 'gst-05', 'Camilla Dupont', 'camilla.dupont@artlux.fr', '+33 6 12 34 56 78', 'room-v1', 'Villa 1', 'Oceanfront Villa', '2026-09-10', '2026-09-17', 7, 4, 8393.00, 8393.00, 'Paid', 'Checked-In', 'Direct', 'Chef dinner booking for 4 guests')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Staff
INSERT INTO public.staff (id, name, role, department, shift, status, phone, active_tasks, rating)
VALUES
  ('stf-01', 'Maria Santos', 'Housekeeping Supervisor', 'Housekeeping', 'Morning', 'On Duty', '+1 (555) 201-9921', 3, 4.9),
  ('stf-02', 'David Kim', 'Chief Maintenance Engineer', 'Maintenance', 'Morning', 'On Duty', '+1 (555) 201-8842', 2, 4.8),
  ('stf-03', 'Liam O Connor', 'Head Concierge', 'Concierge', 'Morning', 'On Duty', '+1 (555) 201-7711', 1, 5.0),
  ('stf-04', 'Amara Okafor', 'Front Desk Lead', 'Front Desk', 'Morning', 'On Duty', '+1 (555) 201-6632', 2, 4.9),
  ('stf-05', 'Kenji Sato', 'Operations Manager', 'Management', 'Morning', 'On Duty', '+1 (555) 201-1100', 0, 4.9)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Initial Hotel Tasks
INSERT INTO public.hotel_tasks (id, title, room_number, category, priority, status, assigned_to, due_time, ai_priority_score, ai_rationale)
VALUES
  ('tsk-01', 'Turnover Suite 204 for VIP Arrival', '204', 'Housekeeping', 'Urgent', 'In Progress', 'Maria Santos', '13:45', 96, 'Fast-track turnover needed: VIP Platinum member checking in early.'),
  ('tsk-02', 'AC Coolant Valve Replacement', '202', 'Maintenance', 'High', 'In Progress', 'David Kim', '15:30', 88, 'Fixing cooling sensor to return room to inventory by evening.'),
  ('tsk-03', 'Turnover Deluxe King 304', '304', 'Housekeeping', 'High', 'Pending', 'Maria Santos', '14:30', 82, 'Scheduled check-in at 15:00.'),
  ('tsk-04', 'Deliver Welcome Champagne & Macarons', '401', 'Concierge', 'High', 'Pending', 'Liam O Connor', '13:50', 79, 'VIP arrival amenity package for Ms. Vance.'),
  ('tsk-05', 'Full Linen & Bedding Reset', '103', 'Housekeeping', 'Medium', 'Pending', 'Maria Santos', '16:00', 65, 'Routine turnover for tomorrow morning reservation.')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Initial Payments
INSERT INTO public.payments (id, reservation_id, guest_name, room_number, amount, type, method, date, status)
VALUES
  ('pay-01', 'res-501', 'Sir Arthur Sterling', '501', 5243.00, 'Room Charge', 'Credit Card', '2026-09-12', 'Completed'),
  ('pay-02', 'res-v1', 'Camilla Dupont', 'Villa 1', 8393.00, 'Room Charge', 'Bank Transfer', '2026-09-10', 'Completed'),
  ('pay-03', 'res-401', 'Eleanor Vance', '401', 2723.00, 'Deposit', 'Credit Card', '2026-09-14', 'Completed'),
  ('pay-04', 'res-101', 'Marcus Brody', '101', 596.00, 'Room Charge', 'Apple Pay', '2026-09-14', 'Completed'),
  ('pay-05', 'res-203', 'David Chen', '203', 438.00, 'Deposit', 'Credit Card', '2026-09-15', 'Completed')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Initial Activities
INSERT INTO public.activities (id, timestamp, type, message, badge_color)
VALUES
  ('act-01', '10:45 AM', 'room-status', 'Room 204 status changed to Vacant Dirty following checkout.', 'orange'),
  ('act-02', '10:30 AM', 'check-out', 'Guest in Room 204 completed express check-out.', 'slate'),
  ('act-03', '09:15 AM', 'task', 'Turnover assigned for Room 204 to Maria Santos.', 'blue'),
  ('act-04', '08:50 AM', 'payment', 'Payment of $438.00 recorded for Reservation #res-203.', 'emerald'),
  ('act-05', '08:15 AM', 'check-in', 'Dr. Julian Hayes checked in to Executive Suite 302.', 'indigo')
ON CONFLICT (id) DO NOTHING;
