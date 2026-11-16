-- GymRank database setup (fresh projects: run this, then 002 and 003 in order). Paste the whole file into Supabase > SQL Editor and click Run. Run it once.

-- One row per user, created automatically at sign-up.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  sex text not null check (sex in ('m', 'f')),
  created_at timestamptz not null default now()
);
create unique index profiles_username_key on public.profiles (lower(username));

-- One row per logged set. Weights are stored in kg; the app converts lbs.
create table public.lifts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles on delete cascade,
  exercise_id text not null check (exercise_id ~ '^[a-z-]{3,40}$'),
  weight_kg numeric(6, 2) not null check (weight_kg > 0 and weight_kg <= 1000),
  reps int not null check (reps between 1 and 20),
  -- Estimated one-rep max (Epley). Must match e1rm() in src/ranks.js.
  e1rm_kg numeric generated always as (case when reps = 1 then weight_kg else weight_kg * (1 + reps / 30.0) end) stored,
  performed_on date not null default current_date check (performed_on >= '2000-01-01' and performed_on <= current_date + 1),
  created_at timestamptz not null default now()
);
create index lifts_user_idx on public.lifts (user_id, performed_on desc);
create index lifts_board_idx on public.lifts (exercise_id, user_id, e1rm_kg desc);

-- Row level security: users can only read and change their own rows.
alter table public.profiles enable row level security;
alter table public.lifts enable row level security;

create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "read own lifts" on public.lifts for select to authenticated using (user_id = (select auth.uid()));
create policy "log own lifts" on public.lifts for insert to authenticated with check (user_id = (select auth.uid()));
create policy "delete own lifts" on public.lifts for delete to authenticated using (user_id = (select auth.uid()));

-- Leaderboard: each user's best estimated max per exercise.
-- Deliberately runs with the owner's rights so it can read across users, and exposes only username, sex and the max.
-- shortcut: aggregates on every read; switch to a materialized table when the lifts table gets large.
create view public.leaderboard as
select l.exercise_id, p.id as user_id, p.username, p.sex, max(l.e1rm_kg) as e1rm_kg
from public.lifts l
join public.profiles p on p.id = l.user_id
group by l.exercise_id, p.id;

revoke all on public.leaderboard from anon, public;
grant select on public.leaderboard to authenticated;

-- Create the profile from the username and division chosen on the sign-up form.
-- The checks on profiles reject bad values, which cancels the sign-up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, sex)
  values (new.id, new.raw_user_meta_data ->> 'username', new.raw_user_meta_data ->> 'sex');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
