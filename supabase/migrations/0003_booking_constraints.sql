alter table public.appointments add constraint appointments_no_host_overlap
  exclude using gist (
    host_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status = 'confirmed');

create or replace function public.create_booking(
  p_host_slug text,
  p_appointment_type_id uuid,
  p_starts_at timestamptz,
  p_invitee_name text,
  p_invitee_email text,
  p_invitee_note text,
  p_invitee_timezone text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_host public.profiles%rowtype;
  v_type public.appointment_types%rowtype;
  v_id uuid;
  v_ends_at timestamptz;
  v_local_start timestamp;
  v_local_end timestamp;
  v_has_override boolean;
  v_is_available boolean;
begin
  select * into v_host from public.profiles where slug = p_host_slug;
  if not found then raise exception 'host_not_found' using errcode = 'P0002'; end if;

  select * into v_type from public.appointment_types
    where id = p_appointment_type_id and host_id = v_host.id and is_active
    for share;
  if not found then raise exception 'appointment_type_not_found' using errcode = 'P0002'; end if;
  if p_starts_at < now() + make_interval(mins => v_type.minimum_notice_minutes) then
    raise exception 'minimum_notice_not_met' using errcode = '22023';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_type.duration_minutes);
  v_local_start := p_starts_at at time zone v_host.timezone;
  v_local_end := v_ends_at at time zone v_host.timezone;
  if v_local_start::date <> v_local_end::date then raise exception 'overnight_booking_rejected' using errcode = '22023'; end if;

  select exists(select 1 from public.availability_overrides o where o.host_id=v_host.id and o.local_date=v_local_start::date) into v_has_override;
  if v_has_override then
    select exists(
      select 1 from public.availability_overrides o
      where o.host_id=v_host.id and o.local_date=v_local_start::date and not o.unavailable
        and v_local_start::time >= o.starts_at and v_local_end::time <= o.ends_at
    ) and not exists(
      select 1 from public.availability_overrides o
      where o.host_id=v_host.id and o.local_date=v_local_start::date and o.unavailable
    ) into v_is_available;
  else
    select exists(
      select 1 from public.availability_rules r
      where r.host_id=v_host.id and r.weekday=extract(dow from v_local_start)::smallint
        and (r.effective_from is null or r.effective_from <= v_local_start::date)
        and (r.effective_until is null or r.effective_until >= v_local_start::date)
        and v_local_start::time >= r.starts_at and v_local_end::time <= r.ends_at
    ) into v_is_available;
  end if;
  if not v_is_available then raise exception 'slot_unavailable' using errcode = '22023'; end if;

  insert into public.appointments(host_id,appointment_type_id,appointment_name,duration_minutes,location,invitee_name,invitee_email,invitee_note,invitee_timezone,starts_at,ends_at)
  values(v_host.id,v_type.id,v_type.name,v_type.duration_minutes,v_type.location,trim(p_invitee_name),lower(trim(p_invitee_email)),nullif(trim(p_invitee_note),''),p_invitee_timezone,p_starts_at,v_ends_at)
  returning id into v_id;

  insert into public.email_events(appointment_id,message_type,recipient,idempotency_key)
  values
    (v_id,'booking_invitee',lower(trim(p_invitee_email)),v_id||':booking:invitee'),
    (v_id,'booking_host',(select email from auth.users where id=v_host.id),v_id||':booking:host');
  return v_id;
end $$;

create or replace function public.cancel_appointment(p_appointment_id uuid, p_reason text)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_appointment public.appointments%rowtype; v_host_email text;
begin
  select * into v_appointment from public.appointments where id=p_appointment_id for update;
  if not found or v_appointment.host_id <> auth.uid() then raise exception 'not_found' using errcode='P0002'; end if;
  if v_appointment.status <> 'confirmed' or v_appointment.starts_at <= now() then raise exception 'not_cancellable' using errcode='22023'; end if;
  update public.appointments set status='cancelled',cancelled_at=now(),cancellation_reason=trim(p_reason) where id=p_appointment_id;
  select email into v_host_email from auth.users where id=v_appointment.host_id;
  insert into public.email_events(appointment_id,message_type,recipient,idempotency_key)
  values
    (p_appointment_id,'cancellation_invitee',v_appointment.invitee_email,p_appointment_id||':cancellation:invitee'),
    (p_appointment_id,'cancellation_host',v_host_email,p_appointment_id||':cancellation:host');
end $$;

revoke all on function public.create_booking(text,uuid,timestamptz,text,text,text,text) from public;
grant execute on function public.create_booking(text,uuid,timestamptz,text,text,text,text) to anon, authenticated;
revoke all on function public.cancel_appointment(uuid,text) from public;
grant execute on function public.cancel_appointment(uuid,text) to authenticated;

