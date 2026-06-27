-- Atomic serial-number allocator.
--
-- Returns the next counter value for the given year. Using INSERT ... ON
-- CONFLICT DO UPDATE makes the increment atomic, so two concurrent approvals
-- can never receive the same serial number.
create or replace function next_serial(p_year int)
returns int
language plpgsql
as $$
declare
  v int;
begin
  insert into app_settings(key, value)
  values ('serial_counter_' || p_year, '1')
  on conflict (key) do update
    set value = (app_settings.value::int + 1)::text
  returning value::int into v;
  return v;
end;
$$;
