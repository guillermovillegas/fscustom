-- ============================================================================
-- QR Appointment Booking App - Initial Schema
-- ============================================================================

-- ============================================================================
-- 1. APPOINTMENTS TABLE
-- ============================================================================
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  project_type text not null check (project_type in ('kitchen', 'bathroom', 'flooring')),
  property_type text not null check (property_type in ('residential', 'commercial')),
  appointment_date date not null,
  appointment_time text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),

  -- Prevent double-bookings: only one appointment per date+time combination
  constraint appointments_no_double_booking unique (appointment_date, appointment_time)
);

comment on table public.appointments is 'Customer appointment bookings created via QR code landing page.';
comment on constraint appointments_no_double_booking on public.appointments is 'Ensures no two appointments share the same date and time slot.';

-- ============================================================================
-- 2. PORTFOLIO PHOTOS TABLE
-- ============================================================================
create table public.portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('kitchen', 'bathroom', 'flooring')),
  image_url text not null,
  caption text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.portfolio_photos is 'Portfolio images displayed on the QR code landing page gallery.';

-- ============================================================================
-- 3. TIME SLOTS TABLE
-- ============================================================================
create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time text not null,
  end_time text not null,
  is_active boolean not null default true,

  -- Prevent duplicate slot definitions for the same day and start time
  constraint time_slots_unique_per_day unique (day_of_week, start_time)
);

comment on table public.time_slots is 'Template of available appointment time slots by day of week (0=Sunday, 6=Saturday).';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookups for appointments on a specific date
create index idx_appointments_date on public.appointments (appointment_date);

-- Filter appointments by status (e.g. admin viewing pending appointments)
create index idx_appointments_status on public.appointments (status);

-- Portfolio gallery ordering by category
create index idx_portfolio_photos_category_order on public.portfolio_photos (category, display_order);

-- Time slot lookups by active status and day
create index idx_time_slots_active_day on public.time_slots (is_active, day_of_week);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
alter table public.appointments enable row level security;
alter table public.portfolio_photos enable row level security;
alter table public.time_slots enable row level security;

-- ---------------------------------------------------------------------------
-- APPOINTMENTS POLICIES
-- ---------------------------------------------------------------------------

-- Anonymous users can create appointments (booking form)
create policy "appointments_anon_insert"
  on public.appointments
  for insert
  to anon
  with check (true);

-- Authenticated users (admin) can read all appointments
create policy "appointments_auth_select"
  on public.appointments
  for select
  to authenticated
  using (true);

-- Authenticated users (admin) can update appointments (e.g. change status)
create policy "appointments_auth_update"
  on public.appointments
  for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated users (admin) can delete appointments
create policy "appointments_auth_delete"
  on public.appointments
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- PORTFOLIO PHOTOS POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can view portfolio photos (public landing page)
create policy "portfolio_photos_anon_select"
  on public.portfolio_photos
  for select
  to anon
  using (true);

-- Authenticated users also need select access
create policy "portfolio_photos_auth_select"
  on public.portfolio_photos
  for select
  to authenticated
  using (true);

-- Authenticated users (admin) can insert new photos
create policy "portfolio_photos_auth_insert"
  on public.portfolio_photos
  for insert
  to authenticated
  with check (true);

-- Authenticated users (admin) can update photos
create policy "portfolio_photos_auth_update"
  on public.portfolio_photos
  for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated users (admin) can delete photos
create policy "portfolio_photos_auth_delete"
  on public.portfolio_photos
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- TIME SLOTS POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can read time slots (needed for the booking form)
create policy "time_slots_anon_select"
  on public.time_slots
  for select
  to anon
  using (true);

-- Authenticated users also need select access
create policy "time_slots_auth_select"
  on public.time_slots
  for select
  to authenticated
  using (true);

-- Authenticated users (admin) can insert time slots
create policy "time_slots_auth_insert"
  on public.time_slots
  for insert
  to authenticated
  with check (true);

-- Authenticated users (admin) can update time slots
create policy "time_slots_auth_update"
  on public.time_slots
  for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated users (admin) can delete time slots
create policy "time_slots_auth_delete"
  on public.time_slots
  for delete
  to authenticated
  using (true);

-- ============================================================================
-- SEED DATA: DEFAULT TIME SLOTS (Mon-Fri, 9 AM - 4 PM, one-hour slots)
-- ============================================================================
-- day_of_week: 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday

insert into public.time_slots (day_of_week, start_time, end_time) values
  -- Monday
  (1, '9:00 AM',  '10:00 AM'),
  (1, '10:00 AM', '11:00 AM'),
  (1, '11:00 AM', '12:00 PM'),
  (1, '12:00 PM', '1:00 PM'),
  (1, '1:00 PM',  '2:00 PM'),
  (1, '2:00 PM',  '3:00 PM'),
  (1, '3:00 PM',  '4:00 PM'),
  -- Tuesday
  (2, '9:00 AM',  '10:00 AM'),
  (2, '10:00 AM', '11:00 AM'),
  (2, '11:00 AM', '12:00 PM'),
  (2, '12:00 PM', '1:00 PM'),
  (2, '1:00 PM',  '2:00 PM'),
  (2, '2:00 PM',  '3:00 PM'),
  (2, '3:00 PM',  '4:00 PM'),
  -- Wednesday
  (3, '9:00 AM',  '10:00 AM'),
  (3, '10:00 AM', '11:00 AM'),
  (3, '11:00 AM', '12:00 PM'),
  (3, '12:00 PM', '1:00 PM'),
  (3, '1:00 PM',  '2:00 PM'),
  (3, '2:00 PM',  '3:00 PM'),
  (3, '3:00 PM',  '4:00 PM'),
  -- Thursday
  (4, '9:00 AM',  '10:00 AM'),
  (4, '10:00 AM', '11:00 AM'),
  (4, '11:00 AM', '12:00 PM'),
  (4, '12:00 PM', '1:00 PM'),
  (4, '1:00 PM',  '2:00 PM'),
  (4, '2:00 PM',  '3:00 PM'),
  (4, '3:00 PM',  '4:00 PM'),
  -- Friday
  (5, '9:00 AM',  '10:00 AM'),
  (5, '10:00 AM', '11:00 AM'),
  (5, '11:00 AM', '12:00 PM'),
  (5, '12:00 PM', '1:00 PM'),
  (5, '1:00 PM',  '2:00 PM'),
  (5, '2:00 PM',  '3:00 PM'),
  (5, '3:00 PM',  '4:00 PM');

-- ============================================================================
-- SEED DATA: EXAMPLE PORTFOLIO PHOTOS
-- ============================================================================

insert into public.portfolio_photos (category, image_url, caption, display_order) values
  -- Kitchen photos
  ('kitchen', 'https://picsum.photos/seed/kitchen1/800/600', 'Modern kitchen remodel with quartz countertops', 1),
  ('kitchen', 'https://picsum.photos/seed/kitchen2/800/600', 'Open-concept kitchen with custom cabinetry', 2),
  ('kitchen', 'https://picsum.photos/seed/kitchen3/800/600', 'Kitchen island with waterfall edge countertop', 3),
  ('kitchen', 'https://picsum.photos/seed/kitchen4/800/600', 'Farmhouse-style kitchen renovation', 4),
  -- Bathroom photos
  ('bathroom', 'https://picsum.photos/seed/bath1/800/600', 'Luxury master bathroom with walk-in shower', 1),
  ('bathroom', 'https://picsum.photos/seed/bath2/800/600', 'Guest bathroom tile and vanity update', 2),
  ('bathroom', 'https://picsum.photos/seed/bath3/800/600', 'Spa-inspired bathroom with freestanding tub', 3),
  ('bathroom', 'https://picsum.photos/seed/bath4/800/600', 'Small bathroom remodel with space-saving fixtures', 4),
  -- Flooring photos
  ('flooring', 'https://picsum.photos/seed/floor1/800/600', 'Hardwood flooring installation throughout living area', 1),
  ('flooring', 'https://picsum.photos/seed/floor2/800/600', 'Luxury vinyl plank in open floor plan', 2),
  ('flooring', 'https://picsum.photos/seed/floor3/800/600', 'Herringbone pattern tile flooring', 3),
  ('flooring', 'https://picsum.photos/seed/floor4/800/600', 'Commercial-grade epoxy flooring for garage', 4);
