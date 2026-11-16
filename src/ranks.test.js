import test from 'node:test'
import assert from 'node:assert/strict'
import { fmtCompact, milestone, THINGS, massCompare, totalVolume, e1rm, rankIndex, percentile, topPercent, bestByExercise, fmtMax, fmtGoal, toKg } from './ranks.js'
import { EXERCISES, MUSCLES } from './exercises.js'

const bench = EXERCISES.find((e) => e.id === 'bench-press').m // [50, 70, 95, 127.5, 160]

test('e1rm', () => {
  assert.equal(e1rm(100, 1), 100)
  assert.equal(e1rm(90, 10), 120)
  assert.equal(e1rm(100, 20), 100 * (1 + 20 / 30)) // full credit up to 20
  assert.equal(e1rm(100, 26), 100 * (1 + 23 / 30)) // half credit for reps 21-30
  assert.equal(e1rm(100, 60), e1rm(100, 30)) // nothing past 30
})

test('totalVolume and massCompare', () => {
  // 5 sets of 10 at 100 kg, plus an old row with no sets column
  assert.equal(totalVolume([{ weight_kg: 100, reps: 10, sets: 5 }, { weight_kg: '20', reps: 3 }]), 5060)
  assert.equal(massCompare(10), null)
  assert.equal(massCompare(30), 'a golden retriever')
  assert.equal(massCompare(4600), '3 cars')
  assert.equal(massCompare(6000), 'an African elephant')
  assert.equal(massCompare(80000000), 'the Titanic')
  assert.equal(massCompare(250000000), '2 Nimitz aircraft carriers')
})

test('milestone', () => {
  assert.equal(fmtCompact(2970000, 'kg'), '3M kg')
  assert.equal(fmtCompact(450, 'kg'), '450 kg')
  assert.equal(fmtCompact(450, 'lb'), '992 lb')
  assert.deepEqual(milestone(0), { i: -1, next: THINGS[0], pct: 0, mark: 0 })
  const m = milestone(750) // past the grand piano (450), half of a car (1,500)
  assert.equal(m.i, 3); assert.equal(m.next.label, 'Car'); assert.equal(m.pct, 50); assert.equal(m.mark, 30)
  assert.equal(Math.round(milestone(27000 / 2.20462).pct), 34) // 27k lb is a third of a loaded semi
  assert.deepEqual(milestone(1e12), { i: THINGS.length - 1, next: null, pct: 100, mark: 100 })
  for (let k = 1; k < THINGS.length; k++) assert.ok(THINGS[k].kg > THINGS[k - 1].kg, THINGS[k].label)
})

test('rankIndex', () => {
  assert.equal(rankIndex(bench, 10), 0)
  assert.equal(rankIndex(bench, 69.9), 0)
  assert.equal(rankIndex(bench, 70), 1)
  assert.equal(rankIndex(bench, 500), 4)
})

test('percentile hits the tier boundaries and stays in range', () => {
  assert.equal(percentile(bench, 0), 0)
  assert.equal(percentile(bench, 50), 5)
  assert.equal(percentile(bench, 95), 50)
  assert.equal(percentile(bench, 160), 95)
  assert.equal(percentile(bench, 9999), 99.9)
  assert.equal(topPercent(bench, 95), 50)
  assert.equal(topPercent(bench, 9999), 0.1)
})

test('a lift logged at the displayed lb goal reaches that tier', () => {
  for (const e of EXERCISES) for (const t of [e.m, e.f]) t.forEach((kg, i) => {
    const shownLb = parseInt(fmtGoal(kg, 'lb'))
    assert.ok(rankIndex(t, toKg(shownLb, 'lb')) >= i, `${e.id} tier ${i}`)
  })
  assert.equal(fmtMax(toKg(154, 'lb'), 'lb'), '154 lb')
})

test('bestByExercise', () => {
  assert.deepEqual(bestByExercise([{ exercise_id: 'a', e1rm_kg: '50' }, { exercise_id: 'a', e1rm_kg: '80.5' }, { exercise_id: 'b', e1rm_kg: 3 }]), { a: 80.5, b: 3 })
})

test('exercise data is sane', () => {
  assert.equal(new Set(EXERCISES.map((e) => e.id)).size, EXERCISES.length)
  for (const e of EXERCISES) {
    assert.ok(MUSCLES.includes(e.muscle), e.id)
    assert.match(e.id, /^[a-z-]{3,40}$/) // must match the database check
    for (const t of [e.m, e.f]) assert.deepEqual(t, [...t].sort((a, b) => a - b))
  }
})
