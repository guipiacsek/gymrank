// Tiers map to community percentiles: each threshold means "stronger than N% of lifters".
export const RANKS = [
  { name: 'Beginner', color: '#9aa0a6' },
  { name: 'Novice', color: '#3fcf5e' },
  { name: 'Intermediate', color: '#3b9dff' },
  { name: 'Advanced', color: '#b65cff' },
  { name: 'Elite', color: '#ffc531' },
]
const PCT = [0, 5, 20, 50, 80, 95, 99.9]

const LB = 2.20462
export const toKg = (v, unit) => (unit === 'lb' ? v / LB : v)
export const toUnit = (kg, unit) => (unit === 'lb' ? kg * LB : kg)
// Maxes round down and thresholds round up, so the screen never shows a tier as reached when it isn't.
export const fmtMax = (kg, unit) => `${Math.floor(toUnit(kg, unit) + 1e-6)} ${unit}`
export const fmtGoal = (kg, unit) => `${Math.ceil(toUnit(kg, unit) - 1e-6)} ${unit}`
export const fmtLogged = (kg, unit) => `${+toUnit(kg, unit).toFixed(1)} ${unit}`

// Epley estimate; a single rep is the lift itself. Epley stops tracking strength at high reps, so reps
// 1-20 count fully, 21-30 count half, and anything past 30 adds nothing. Must match 004-rep-credit.sql.
export const effectiveReps = (reps) => Math.min(reps, 20) + Math.max(Math.min(reps, 30) - 20, 0) / 2
export const e1rm = (kg, reps) => (reps === 1 ? kg : kg * (1 + effectiveReps(reps) / 30))

export const fmtTotal = (kg, unit) => `${Math.round(toUnit(kg, unit)).toLocaleString('en-US')} ${unit}`

// Total mass moved: weight × reps × sets over every logged entry.
export const totalVolume = (lifts) => lifts.reduce((sum, l) => sum + l.weight_kg * l.reps * (l.sets ?? 1), 0)

// Rough real-world masses in kg, lightest first. These are the Total lifted milestones.
export const THINGS = [
  [30, 'Golden retriever', 'a golden retriever', 'golden retrievers'],
  [90, 'Fridge', 'a fridge', 'fridges'],
  [200, 'Motorcycle', 'a motorcycle', 'motorcycles'],
  [450, 'Grand piano', 'a grand piano', 'grand pianos'],
  [1500, 'Car', 'a car', 'cars'],
  [6000, 'African elephant', 'an African elephant', 'African elephants'],
  [11000, 'School bus', 'a school bus', 'school buses'],
  [36000, 'Loaded semi truck', 'a loaded semi truck', 'loaded semi trucks'],
  [150000, 'Blue whale', 'a blue whale', 'blue whales'],
  [420000, 'Space Station', 'the International Space Station', 'International Space Stations'],
  [10100000, 'Eiffel Tower', 'the Eiffel Tower', 'Eiffel Towers'],
  [52000000, 'Titanic', 'the Titanic', 'Titanics'],
].map(([kg, label, one, many]) => ({ kg, label, one, many }))

// "3 cars" for 4,600 kg: the heaviest thing the total covers, and how many of it. null below the lightest.
export function massCompare(kg) {
  const t = THINGS.findLast((t) => kg >= t.kg)
  if (!t) return null
  const n = Math.floor(kg / t.kg)
  return n === 1 ? t.one : `${n.toLocaleString('en-US')} ${t.many}`
}

// Where a total sits on the milestone ladder: index of the last one reached (-1 for none),
// the next one (null past the last), and the percentage of the way between them.
export function milestone(kg) {
  const i = THINGS.findLastIndex((t) => kg >= t.kg)
  const from = i < 0 ? 0 : THINGS[i].kg
  const next = THINGS[i + 1] ?? null
  return { i, next, pct: next ? ((kg - from) / (next.kg - from)) * 100 : 100 }
}

// t = the exercise's 5 thresholds for the user's sex. Anything below Novice is Beginner.
export function rankIndex(t, kg) {
  let i = 0
  for (let k = 1; k < 5; k++) if (kg >= t[k]) i = k
  return i
}

// "Stronger than X% of lifters", interpolated between thresholds; capped at 99.9.
export function percentile(t, kg) {
  const xs = [0, ...t, t[4] * 1.4]
  if (!(kg > 0)) return 0
  if (kg >= xs[6]) return 99.9
  const i = xs.findIndex((x) => kg < x)
  return PCT[i - 1] + ((kg - xs[i - 1]) / (xs[i] - xs[i - 1])) * (PCT[i] - PCT[i - 1])
}

export const topPercent = (t, kg) => {
  const top = 100 - percentile(t, kg)
  return top < 10 ? +top.toFixed(1) : Math.round(top)
}

// lifts: rows with exercise_id and e1rm_kg. Returns { exerciseId: best e1rm in kg }.
export function bestByExercise(lifts) {
  const best = {}
  for (const l of lifts) if (!(best[l.exercise_id] >= l.e1rm_kg)) best[l.exercise_id] = +l.e1rm_kg
  return best
}
