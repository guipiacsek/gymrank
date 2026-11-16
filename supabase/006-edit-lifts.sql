-- Lets people edit their own logged lifts. They can't move a lift to someone else.
create policy "edit own lifts" on public.lifts for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
