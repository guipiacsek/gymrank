// Rank thresholds in kg (estimated one-rep max) for Beginner, Novice, Intermediate, Advanced, Elite.
// Adapted from community strength standards published by strengthlevel.com (Nov 2026),
// rounded to plate-friendly numbers. db: true means the weight is per dumbbell.
export const MUSCLES = ['chest', 'back', 'shoulders', 'traps', 'biceps', 'triceps', 'abs', 'quads', 'hamstrings', 'glutes', 'calves']

export const EXERCISES = [
  { id: 'bench-press', name: 'Bench Press', muscle: 'chest', m: [50, 70, 95, 127.5, 160], f: [19, 32.5, 50, 72.5, 97.5] },
  { id: 'incline-bench-press', name: 'Incline Bench Press', muscle: 'chest', m: [42.5, 62.5, 85, 115, 145], f: [15, 27.5, 42.5, 62.5, 85] },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', muscle: 'chest', db: true, m: [17, 25, 37.5, 52.5, 70], f: [7, 13, 20, 30, 40] },
  { id: 'chest-press', name: 'Chest Press Machine', muscle: 'chest', m: [35, 55, 85, 120, 160], f: [11, 22.5, 37.5, 57.5, 80] },
  { id: 'machine-chest-fly', name: 'Chest Fly Machine', muscle: 'chest', m: [37.5, 57.5, 85, 117.5, 155], f: [13, 25, 40, 60, 80] },
  { id: 'deadlift', name: 'Deadlift', muscle: 'back', m: [80, 112.5, 155, 202.5, 252.5], f: [40, 62.5, 90, 125, 160] },
  { id: 'bent-over-row', name: 'Barbell Row', muscle: 'back', m: [42.5, 62.5, 87.5, 115, 147.5], f: [18, 30, 45, 62.5, 82.5] },
  { id: 'dumbbell-row', name: 'Dumbbell Row', muscle: 'back', db: true, m: [17, 27.5, 42.5, 60, 77.5], f: [9, 14, 22.5, 30, 40] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscle: 'back', m: [42.5, 60, 82.5, 107.5, 135], f: [22.5, 35, 47.5, 62.5, 80] },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscle: 'back', m: [40, 60, 85, 112.5, 142.5], f: [22.5, 32.5, 47.5, 65, 85] },
  { id: 'shoulder-press', name: 'Overhead Press', muscle: 'shoulders', m: [30, 45, 62.5, 85, 107.5], f: [13, 20, 32.5, 45, 60] },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', muscle: 'shoulders', db: true, m: [13, 20, 30, 42.5, 55], f: [6, 10, 15, 20, 27.5] },
  { id: 'dumbbell-lateral-raise', name: 'Lateral Raise', muscle: 'shoulders', db: true, m: [4, 9, 16, 25, 35], f: [3, 6, 9, 13, 18] },
  { id: 'barbell-shrug', name: 'Barbell Shrug', muscle: 'traps', m: [47.5, 80, 125, 182.5, 245], f: [18, 37.5, 67.5, 105, 147.5] },
  { id: 'barbell-curl', name: 'Barbell Curl', muscle: 'biceps', m: [19, 30, 45, 62.5, 82.5], f: [8, 15, 25, 35, 50] },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', muscle: 'biceps', db: true, m: [7, 13, 20, 30, 42.5], f: [4, 7, 12, 18, 25] },
  { id: 'hammer-curl', name: 'Hammer Curl', muscle: 'biceps', db: true, m: [9, 15, 22.5, 32.5, 42.5], f: [5, 8, 12, 18, 22.5] },
  { id: 'preacher-curl', name: 'Preacher Curl', muscle: 'biceps', m: [18, 30, 42.5, 60, 80], f: [9, 16, 25, 37.5, 50] },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscle: 'triceps', m: [19, 35, 55, 80, 107.5], f: [9, 18, 30, 45, 62.5] },
  { id: 'lying-tricep-extension', name: 'Skull Crusher', muscle: 'triceps', m: [17, 27.5, 42.5, 60, 77.5], f: [7, 13, 20, 30, 42.5] },
  { id: 'squat', name: 'Squat', muscle: 'quads', m: [65, 95, 130, 172.5, 220], f: [32.5, 50, 75, 105, 137.5] },
  { id: 'front-squat', name: 'Front Squat', muscle: 'quads', m: [55, 77.5, 105, 137.5, 172.5], f: [30, 45, 62.5, 82.5, 105] },
  { id: 'sled-leg-press', name: 'Leg Press', muscle: 'quads', m: [95, 152.5, 227.5, 315, 415], f: [52.5, 95, 150, 222.5, 302.5] },
  { id: 'leg-extension', name: 'Leg Extension', muscle: 'quads', m: [42.5, 67.5, 100, 137.5, 180], f: [22.5, 40, 60, 87.5, 120] },
  { id: 'dumbbell-bulgarian-split-squat', name: 'Bulgarian Split Squat', muscle: 'quads', db: true, m: [11, 20, 30, 45, 62.5], f: [7, 13, 20, 30, 40] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscle: 'hamstrings', m: [57.5, 87.5, 122.5, 165, 210], f: [30, 47.5, 67.5, 92.5, 120] },
  { id: 'seated-leg-curl', name: 'Leg Curl', muscle: 'hamstrings', m: [35, 55, 80, 110, 142.5], f: [20, 32.5, 50, 70, 92.5] },
  { id: 'hip-thrust', name: 'Hip Thrust', muscle: 'glutes', m: [45, 85, 140, 207.5, 285], f: [35, 65, 102.5, 150, 202.5] },
  { id: 'machine-calf-raise', name: 'Calf Raise Machine', muscle: 'calves', m: [42.5, 82.5, 137.5, 205, 285], f: [22.5, 50, 90, 140, 200] },
  { id: 'cable-crunch', name: 'Cable Crunch', muscle: 'abs', m: [22.5, 40, 65, 95, 127.5], f: [16, 30, 47.5, 72.5, 97.5] },
]

export const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))
