drop policy if exists "authenticated can listen to office presence" on realtime.messages;
drop policy if exists "authenticated can track office presence" on realtime.messages;

create policy "authenticated can listen to office presence"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.topic() = 'office:soloshift-commons:presence'
    and realtime.messages.extension = 'presence'
  );

create policy "authenticated can track office presence"
  on realtime.messages
  for insert
  to authenticated
  with check (
    realtime.topic() = 'office:soloshift-commons:presence'
    and realtime.messages.extension = 'presence'
  );
