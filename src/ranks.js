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
const toUnit = (kg, unit) => (unit === 'lb' ? kg * LB : kg)
// Maxes round down and thresholds round up, so the screen never shows a tier as reached when it isn't.
export const fmtMax = (kg, unit) => `${Math.floor(toUnit(kg, unit) + 1e-6)} ${unit}`
export const fmtGoal = (kg, unit) => `${Math.ceil(toUnit(kg, unit) - 1e-6)} ${unit}`
export const fmtLogged = (kg, unit) => `${+toUnit(kg, unit).toFixed(1)} ${unit}`

// Epley estimate; a single rep is the lift itself.
export const e1rm = (kg, reps) => (reps === 1 ? kg : kg * (1 + reps / 30))

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
