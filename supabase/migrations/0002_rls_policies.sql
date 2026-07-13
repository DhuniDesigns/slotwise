alter table public.profiles enable row level security;
alter table public.appointment_types enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_overrides enable row level security;
alter table public.appointments enable row level security;
alter table public.email_events enable row level security;

create policy "hosts read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "hosts update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "hosts insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);

create policy "hosts manage own appointment types" on public.appointment_types for all to authenticated using ((select auth.uid()) = host_id) with check ((select auth.uid()) = host_id);
create policy "hosts manage own rules" on public.availability_rules for all to authenticated using ((select auth.uid()) = host_id) with check ((select auth.uid()) = host_id);
create policy "hosts manage own overrides" on public.availability_overrides for all to authenticated using ((select auth.uid()) = host_id) with check ((select auth.uid()) = host_id);
create policy "hosts read own appointments" on public.appointments for select to authenticated using ((select auth.uid()) = host_id);
create policy "hosts read own email events" on public.email_events for select to authenticated using (exists (select 1 from public.appointments a where a.id = appointment_id and a.host_id = (select auth.uid())));

revoke all on public.profiles, public.appointment_types, public.availability_rules, public.availability_overrides, public.appointments, public.email_events from anon;

