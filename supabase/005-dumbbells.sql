-- GymRank: record whether a dumbbell set used one or two dumbbells, so Total lifted counts both.
-- Paste into Supabase > SQL Editor and click Run. Run it once. Nothing is dropped.
-- Existing entries count as one dumbbell.
alter table public.lifts add column dumbbells int not null default 1 check (dumbbells in (1, 2));
