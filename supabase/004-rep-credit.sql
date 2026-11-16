-- GymRank: reps 21-30 now count at half value toward the estimated max (was: nothing past 20).
-- Paste into Supabase > SQL Editor and click Run. Run it once.
-- Supabase will warn about destructive operations: the dropped view and column are both
-- recreated below, and e1rm_kg is computed from weight and reps, so no logged data is lost.

drop view public.leaderboard;
alter table public.lifts drop column e1rm_kg;
-- Must match e1rm() in src/ranks.js.
alter table public.lifts add column e1rm_kg numeric generated always as
  (case when reps = 1 then weight_kg
   else weight_kg * (1 + (least(reps, 20) + greatest(least(reps, 30) - 20, 0) / 2.0) / 30.0) end) stored;
create index lifts_board_idx on public.lifts (exercise_id, user_id, e1rm_kg desc);

create view public.leaderboard as
select l.exercise_id, p.id as user_id, p.username, p.sex, max(l.e1rm_kg) as e1rm_kg
from public.lifts l
join public.profiles p on p.id = l.user_id
group by l.exercise_id, p.id;

revoke all on public.leaderboard from anon, public;
grant select on public.leaderboard to authenticated;
