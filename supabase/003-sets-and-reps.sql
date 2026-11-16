-- GymRank: sets per entry, and up to 100 reps. Paste into Supabase > SQL Editor and click Run. Run it once.

alter table public.lifts drop constraint lifts_reps_check;
alter table public.lifts add constraint lifts_reps_check check (reps between 1 and 100);
alter table public.lifts add column sets int not null default 1 check (sets between 1 and 20);

-- Recompute the estimated max with reps capped at 20, so high-rep sets don't inflate it.
-- Existing entries (all 20 reps or fewer) keep exactly the same value. Must match e1rm() in src/ranks.js.
drop view public.leaderboard;
alter table public.lifts drop column e1rm_kg;
alter table public.lifts add column e1rm_kg numeric generated always as
  (case when reps = 1 then weight_kg else weight_kg * (1 + least(reps, 20) / 30.0) end) stored;
create index lifts_board_idx on public.lifts (exercise_id, user_id, e1rm_kg desc);

create view public.leaderboard as
select l.exercise_id, p.id as user_id, p.username, p.sex, max(l.e1rm_kg) as e1rm_kg
from public.lifts l
join public.profiles p on p.id = l.user_id
group by l.exercise_id, p.id;

revoke all on public.leaderboard from anon, public;
grant select on public.leaderboard to authenticated;
