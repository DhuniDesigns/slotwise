begin;
select plan(2);
select is((select relrowsecurity from pg_class where oid='public.appointments'::regclass),true,'appointments RLS enabled');
select is((select relrowsecurity from pg_class where oid='public.email_events'::regclass),true,'email events RLS enabled');
select * from finish();
rollback;

