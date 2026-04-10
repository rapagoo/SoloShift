drop policy if exists "authenticated can listen to office presence" on realtime.messages;
drop policy if exists "authenticated can track office presence" on realtime.messages;

create policy "authenticated can listen to office presence"
  on realtime.messages
  for select
  to authenticated
  using (
    (select realtime.topic()) = 'office:soloshift-commons:presence'
    and realtime.messages.extension in ('presence', 'broadcast')
  );

create policy "authenticated can track office presence"
  on realtime.messages
  for insert
  to authenticated
  with check (
    (select realtime.topic()) = 'office:soloshift-commons:presence'
    and realtime.messages.extension in ('presence', 'broadcast')
  );
