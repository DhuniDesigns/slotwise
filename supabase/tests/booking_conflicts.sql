begin;
select plan(1);
select has_constraint('public','appointments','appointments_no_host_overlap','active appointments cannot overlap');
select * from finish();
rollback;

