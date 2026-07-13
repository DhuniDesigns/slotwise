create extension if not exists btree_gist;

create type public.appointment_status as enum ('confirmed', 'cancelled');
create type public.email_event_status as enum ('pending', 'sending', 'sent', 'failed');
create type public.email_message_type as enum ('booking_host', 'booking_invitee', 'cancellation_host', 'cancellation_invitee');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'UTC',
  locale text not null default 'en',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointment_types (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '',
  duration_minutes integer not null check (duration_minutes between 15 and 480),
  location text not null default '',
  minimum_notice_minutes integer not null default 60 check (minimum_notice_minutes >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  effective_from date,
  effective_until date,
  check (starts_at < ends_at),
  check (effective_until is null or effective_from is null or effective_from <= effective_until)
);

create table public.availability_overrides (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  local_date date not null,
  unavailable boolean not null default false,
  starts_at time,
  ends_at time,
  check ((unavailable and starts_at is null and ends_at is null) or
         (not unavailable and starts_at is not null and ends_at is not null and starts_at < ends_at))
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete restrict,
  appointment_type_id uuid references public.appointment_types(id) on delete set null,
  appointment_name text not null,
  duration_minutes integer not null,
  location text not null default '',
  invitee_name text not null,
  invitee_email text not null,
  invitee_note text,
  invitee_timezone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'confirmed',
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check ((status = 'confirmed' and cancelled_at is null) or status = 'cancelled')
);

create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  message_type public.email_message_type not null,
  recipient text not null,
  provider_id text,
  idempotency_key text not null unique,
  status public.email_event_status not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_host_starts_idx on public.appointments(host_id, starts_at);
create index appointment_types_host_idx on public.appointment_types(host_id);
create index availability_rules_host_idx on public.availability_rules(host_id, weekday);
create index availability_overrides_host_date_idx on public.availability_overrides(host_id, local_date);
create index email_events_delivery_idx on public.email_events(status, next_attempt_at) where status in ('pending','failed');

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger appointment_types_touch before update on public.appointment_types for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments for each row execute function public.touch_updated_at();
create trigger email_events_touch before update on public.email_events for each row execute function public.touch_updated_at();

