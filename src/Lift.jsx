import { useState } from 'react'
import { supabase } from './supabase.js'
import { EXERCISES, MUSCLES, byId } from './exercises.js'
import { RANKS, bestByExercise, e1rm, fmtGoal, fmtLogged, fmtMax, rankIndex, toKg, topPercent } from './ranks.js'
import { Badge } from './App.jsx'
import Icon from './Icon.jsx'

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time
const TOP = [0, 80, 50, 20, 5] // share of lifters at or above each tier

export default function Lift({ profile, lifts, unit, reload }) {
  const [sel, setSel] = useState(null)
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState('all')
  const best = bestByExercise(lifts)

  if (sel) return <Detail ex={byId[sel]} sex={profile.sex} lifts={lifts.filter((l) => l.exercise_id === sel)} best={best[sel]} unit={unit} reload={reload} back={() => setSel(null)} />

  const shown = EXERCISES.filter((e) => (muscle === 'all' || e.muscle === muscle) && e.name.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <>
      <input className="search" type="search" placeholder="Search exercises" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search exercises" />
      <div className="chips">
        {['all', ...MUSCLES].map((m) => <button key={m} className={muscle === m ? 'on' : ''} onClick={() => setMuscle(m)}>{m}</button>)}
      </div>
      <div className="grid">
        {shown.map((e) => (
          <button key={e.id} className="card ex" onClick={() => setSel(e.id)}>
            <Icon id={e.id} />
            <span>{e.name}</span>
            {best[e.id] && <Badge rank={rankIndex(e[profile.sex], best[e.id])} />}
          </button>
        ))}
        {!shown.length && <p className="dim">No exercises match.</p>}
      </div>
    </>
  )
}

function Detail({ ex, sex, lifts, best, unit, reload, back }) {
  const t = ex[sex]
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [date, setDate] = useState(today)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const rank = best ? rankIndex(t, best) : null
  const next = rank != null && rank < 4 ? rank + 1 : null

  async function log(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const kg = +toKg(parseFloat(weight), unit).toFixed(2)
    const { error } = await supabase.from('lifts').insert({ exercise_id: ex.id, weight_kg: kg, reps: +reps, performed_on: date })
    if (error) setMsg({ bad: true, text: error.message })
    else {
      const est = e1rm(kg, +reps)
      const up = rankIndex(t, est) > (rank ?? -1) && rankIndex(t, est) > 0
      setMsg({ text: !(best >= est) ? (up ? `New rank: ${RANKS[rankIndex(t, est)].name}!` : 'New personal best!') : 'Logged.' })
      setWeight(''); setReps('')
      await reload()
    }
    setBusy(false)
  }

  async function remove(id) {
    if (!confirm('Delete this entry?')) return
    const { error } = await supabase.from('lifts').delete().eq('id', id)
    if (error) setMsg({ bad: true, text: error.message })
    await reload()
  }

  return (
    <>
      <button className="ghost back" onClick={back}>← All exercises</button>
      <div className="card hero">
        <Icon id={ex.id} size={88} />
        <div>
          <p className="label">{ex.muscle}{ex.db && ' · per dumbbell'}</p>
          <h1>{ex.name}</h1>
          {best ? <>
            <div className="max">{fmtMax(best, unit)} <Badge rank={rank} /></div>
            <p className="dim">Top <b>{topPercent(t, best)}%</b> of {sex === 'm' ? 'male' : 'female'} lifters</p>
          </> : <p className="dim">Log a set to get your rank.</p>}
        </div>
      </div>

      <form className="card logform" onSubmit={log}>
        <label>Weight ({unit})
          <input type="number" inputMode="decimal" step="any" min="0.5" max={unit === 'lb' ? 2200 : 1000} value={weight} onChange={(e) => setWeight(e.target.value)} required />
        </label>
        <label>Reps
          <input type="number" inputMode="numeric" step="1" min="1" max="20" value={reps} onChange={(e) => setReps(e.target.value)} required />
        </label>
        <label>Date
          <input type="date" value={date} max={today()} min="2000-01-01" onChange={(e) => setDate(e.target.value)} required />
        </label>
        <button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Log set'}</button>
        {msg && <p className={msg.bad ? 'error' : 'ok'} role="status">{msg.text}</p>}
      </form>

      <div className="card">
        <h2>Rank scale</h2>
        <ul className="scale">
          {RANKS.map((r, i) => (
            <li key={r.name} className={rank === i ? 'on' : ''} style={{ '--c': r.color }}>
              <i /> <span>{r.name}</span>
              <span className="dim">{i ? `top ${TOP[i]}%` : "any lift"}</span>
              <b>{i ? fmtGoal(t[i], unit) : '—'}</b>
            </li>
          ))}
        </ul>
        {next && <p className="dim">{fmtGoal(t[next] - best, unit)} more to reach <b style={{ color: RANKS[next].color }}>{RANKS[next].name}</b>.</p>}
      </div>

      <div className="card">
        <h2>History</h2>
        {!lifts.length && <p className="dim">Nothing logged yet.</p>}
        <ul className="rows">
          {lifts.map((l) => (
            <li key={l.id}>
              <span className="dim">{l.performed_on}</span>
              <span>{fmtLogged(l.weight_kg, unit)} × {l.reps}</span>
              <span className="dim">≈ {fmtMax(l.e1rm_kg, unit)}</span>
              <button className="ghost" onClick={() => remove(l.id)} aria-label={`Delete entry from ${l.performed_on}`}>✕</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
