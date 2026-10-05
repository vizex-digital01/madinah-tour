-- ============================================================
-- MADINAH JOURNEY — SUPABASE DATABASE
-- Jalankan seluruh file ini di Supabase SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- 1. Core jamaah data
create table if not exists public.jamaah (
  id uuid primary key default gen_random_uuid(),
  jamaah_code text unique,
  full_name text not null,
  phone text,
  email text,
  passport_no text,
  passport_status text not null default 'belum' check (passport_status in ('belum','proses','lengkap')),
  vaccine_status text not null default 'belum' check (vaccine_status in ('belum','proses','lengkap')),
  visa_status text not null default 'belum' check (visa_status in ('belum','proses','selesai')),
  manasik_status text not null default 'belum' check (manasik_status in ('belum','proses','selesai')),
  group_name text,
  bus_no text,
  room_no text,
  hotel_name text,
  departure_date date,
  program_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. Profile links Supabase Auth user → app role/jamaah
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'jamaah'
    check (role in ('super_admin','admin_operasional','tour_leader','jamaah')),
  jamaah_id uuid references public.jamaah(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Auto-create basic profile for new auth users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id,full_name,role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,new.phone,'Jamaah'),'@',1)),
    coalesce(new.raw_user_meta_data->>'role','jamaah')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 3. Location history
create table if not exists public.locations (
  id bigint generated always as identity primary key,
  jamaah_id uuid not null references public.jamaah(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  created_at timestamptz not null default now()
);
create index if not exists locations_jamaah_time_idx on public.locations(jamaah_id,created_at desc);

-- 4. SOS
create table if not exists public.sos_alerts (
  id bigint generated always as identity primary key,
  jamaah_id uuid not null references public.jamaah(id) on delete cascade,
  latitude double precision,
  longitude double precision,
  status text not null default 'active' check (status in ('active','handled','closed')),
  notes text,
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

-- 5. Attendance / bus / hotel
create table if not exists public.attendance (
  id bigint generated always as identity primary key,
  jamaah_id uuid not null references public.jamaah(id) on delete cascade,
  activity_type text not null,
  activity_name text,
  status text not null default 'present' check (status in ('present','absent','late')),
  checked_at timestamptz not null default now()
);

-- 6. Incidents
create table if not exists public.incidents (
  id bigint generated always as identity primary key,
  jamaah_id uuid references public.jamaah(id) on delete set null,
  incident_type text not null,
  description text,
  status text not null default 'open' check (status in ('open','progress','closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Documents (metadata only; actual files can later use Supabase Storage)
create table if not exists public.documents (
  id bigint generated always as identity primary key,
  jamaah_id uuid not null references public.jamaah(id) on delete cascade,
  document_type text not null,
  file_path text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  notes text,
  created_at timestamptz not null default now()
);

-- 8. Global settings
create table if not exists public.app_settings (
  key text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings(key,settings)
values ('global','{
  "travelName":"Madinah Tour",
  "portalName":"Madinah Journey",
  "safeRadius":1000,
  "locationInterval":"60",
  "geofenceAlert":true,
  "locationHistory":true,
  "sosEnabled":true
}'::jsonb)
on conflict (key) do nothing;

-- Latest location view for Command Center
create or replace view public.latest_jamaah_locations
with (security_invoker=true)
as
select distinct on (l.jamaah_id)
  l.jamaah_id,
  j.full_name,
  j.group_name,
  j.bus_no,
  l.latitude,
  l.longitude,
  l.accuracy,
  l.created_at
from public.locations l
join public.jamaah j on j.id=l.jamaah_id
order by l.jamaah_id,l.created_at desc;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path=public
as $$
  select role from public.profiles where id=auth.uid();
$$;

create or replace function public.current_jamaah_id()
returns uuid
language sql
stable
security definer
set search_path=public
as $$
  select jamaah_id from public.profiles where id=auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select coalesce(public.current_profile_role() in ('super_admin','admin_operasional','tour_leader'),false);
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.jamaah enable row level security;
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.sos_alerts enable row level security;
alter table public.attendance enable row level security;
alter table public.incidents enable row level security;
alter table public.documents enable row level security;
alter table public.app_settings enable row level security;

-- Profiles: user sees own; admin sees all.
drop policy if exists profiles_own_or_admin_select on public.profiles;
create policy profiles_own_or_admin_select on public.profiles
for select to authenticated
using (id=auth.uid() or public.is_admin());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Jamaah: jamaah sees own row; admin sees all.
drop policy if exists jamaah_own_or_admin_select on public.jamaah;
create policy jamaah_own_or_admin_select on public.jamaah
for select to authenticated
using (id=public.current_jamaah_id() or public.is_admin());

drop policy if exists jamaah_admin_write on public.jamaah;
create policy jamaah_admin_write on public.jamaah
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Locations: jamaah inserts own only; sees own; admin sees all.
drop policy if exists locations_select on public.locations;
create policy locations_select on public.locations
for select to authenticated
using (jamaah_id=public.current_jamaah_id() or public.is_admin());

drop policy if exists locations_insert_own on public.locations;
create policy locations_insert_own on public.locations
for insert to authenticated
with check (jamaah_id=public.current_jamaah_id());

-- SOS: jamaah creates own; admin sees/updates all.
drop policy if exists sos_select on public.sos_alerts;
create policy sos_select on public.sos_alerts
for select to authenticated
using (jamaah_id=public.current_jamaah_id() or public.is_admin());

drop policy if exists sos_insert_own on public.sos_alerts;
create policy sos_insert_own on public.sos_alerts
for insert to authenticated
with check (jamaah_id=public.current_jamaah_id());

drop policy if exists sos_admin_update on public.sos_alerts;
create policy sos_admin_update on public.sos_alerts
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Attendance: jamaah sees own; admin manages.
drop policy if exists attendance_select on public.attendance;
create policy attendance_select on public.attendance
for select to authenticated
using (jamaah_id=public.current_jamaah_id() or public.is_admin());

drop policy if exists attendance_admin_write on public.attendance;
create policy attendance_admin_write on public.attendance
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Incidents
drop policy if exists incidents_select on public.incidents;
create policy incidents_select on public.incidents
for select to authenticated
using (
  jamaah_id=public.current_jamaah_id()
  or public.is_admin()
);

drop policy if exists incidents_admin_write on public.incidents;
create policy incidents_admin_write on public.incidents
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Documents
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
for select to authenticated
using (jamaah_id=public.current_jamaah_id() or public.is_admin());

drop policy if exists documents_admin_write on public.documents;
create policy documents_admin_write on public.documents
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Settings: authenticated can read; admins update.
drop policy if exists settings_read on public.app_settings;
create policy settings_read on public.app_settings
for select to authenticated
using (true);

drop policy if exists settings_admin_write on public.app_settings;
create policy settings_admin_write on public.app_settings
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Grants required for Data API
grant usage on schema public to authenticated;
grant select on public.profiles,public.jamaah,public.locations,public.sos_alerts,public.attendance,public.incidents,public.documents,public.app_settings,public.latest_jamaah_locations to authenticated;
grant insert on public.locations,public.sos_alerts to authenticated;
grant insert,update,delete on public.jamaah,public.attendance,public.incidents,public.documents,public.app_settings to authenticated;
grant update on public.profiles,public.sos_alerts to authenticated;

-- Add realtime tables to publication (safe if publication already exists).
do $$
begin
  alter publication supabase_realtime add table public.locations;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.sos_alerts;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.attendance;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- AFTER CREATING AUTH USERS:
-- Set admin role:
-- update public.profiles
-- set role='super_admin', full_name='Admin Madinah Tour'
-- where id='AUTH_USER_UUID';
--
-- Link a jamaah account:
-- update public.profiles
-- set role='jamaah', jamaah_id='JAMAAH_UUID', full_name='Nama Jamaah'
-- where id='AUTH_USER_UUID';
-- ============================================================
