-- GymRank: body weight tracking. Paste into Supabase > SQL Editor and click Run. Run it once, after setup.sql.

-- One entry per user per day; saving again on the same day replaces it. Private to the user.
create table public.bodyweights (
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  measured_on date not null default current_date check (measured_on >= '2000-01-01' and measured_on <= current_date + 1),
  weight_kg numeric(5, 2) not null check (weight_kg between 20 and 400),
  primary key (user_id, measured_on)
);

alter table public.bodyweights enable row level security;

create policy "read own bodyweight" on public.bodyweights for select to authenticated using (user_id = (select auth.uid()));
create policy "add own bodyweight" on public.bodyweights for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own bodyweight" on public.bodyweights for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
