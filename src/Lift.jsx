import { useRef, useState } from 'react'
import { supabase } from './supabase.js'
import { EXERCISES, MUSCLES, byId } from './exercises.js'
import { RANKS, bestByExercise, fmtGoal, fmtLogged, fmtMax, rankIndex, toKg, toUnit, topPercent } from './ranks.js'
import Badge from './Badge.jsx'
import Icon from './Icon.jsx'

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time
// "Nov 15", with the year only when it isn't this year.
const short = (d) => {
  const dt = new Date(d + 'T00:00')
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: dt.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' })
}
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
  const asInput = (kg) => String(+toUnit(kg, unit).toFixed(unit === 'lb' ? 1 : 2))
  const last = lifts[0] // newest first: start from what was done last time
  const [weight, setWeight] = useState(last ? asInput(last.weight_kg) : '')
  const [reps, setReps] = useState(last ? String(last.reps) : '')
  const [sets, setSets] = useState(String(last?.sets ?? 1))
  const [date, setDate] = useState(null) // null = today, worked out when needed so it doesn't go stale past midnight
  const [dbs, setDbs] = useState(last?.dumbbells ?? 2) // dumbbell exercises: one or two dumbbells (Total lifted counts both)
  const [editing, setEditing] = useState(null) // the entry being edited, or null when logging a new one
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const form = useRef(null)
  const rank = best ? rankIndex(t, best) : null
  const next = rank != null && rank < 4 ? rank + 1 : null

  function edit(l) {
    setEditing(l); setMsg(null)
    setWeight(asInput(l.weight_kg)); setReps(String(l.reps)); setSets(String(l.sets ?? 1)); setDbs(l.dumbbells ?? 2); setDate(l.performed_on)
    form.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const stopEditing = () => { setEditing(null); setDate(null) }

  async function log(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const row = { weight_kg: +toKg(parseFloat(weight), unit).toFixed(2), reps: +reps, sets: +sets, dumbbells: ex.db ? dbs : 1, performed_on: date ?? today() }
    // The database works out the estimated max; read it back so the message matches the leaderboard exactly.
    const { data, error } = editing
      ? await supabase.from('lifts').update(row).eq('id', editing.id).select('e1rm_kg').single()
      : await supabase.from('lifts').insert({ ...row, exercise_id: ex.id }).select('e1rm_kg').single()
    if (error) setMsg({ bad: true, text: error.message })
    else if (editing) {
      setMsg({ text: 'Saved.' })
      stopEditing()
      await reload()
    } else {
      const est = +data.e1rm_kg
      const up = rankIndex(t, est) > (rank ?? -1) && rankIndex(t, est) > 0
      setMsg({ text: !(best >= est) ? (up ? `New rank: ${RANKS[rankIndex(t, est)].name}!` : 'New personal best!') : 'Logged.' })
      await reload() // the fields stay filled, so the same set again is one tap
    }
    setBusy(false)
  }

  async function remove(id) {
    if (!confirm('Delete this entry?')) return
    if (editing?.id === id) stopEditing()
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

      <form className={`card logform${editing ? ' editing' : ''}`} onSubmit={log} ref={form}>
        {editing && <p className="editnote">Editing the {short(editing.performed_on)} entry
          <button type="button" className="ghost" onClick={stopEditing}>Cancel</button></p>}
        <label>Weight ({unit})
          <input type="number" inputMode="decimal" step="any" min="0.5" max={unit === 'lb' ? 2200 : 1000} value={weight} onChange={(e) => setWeight(e.target.value)} required />
        </label>
        <label>Reps
          <input type="number" inputMode="numeric" step="1" min="1" max="100" value={reps} onChange={(e) => setReps(e.target.value)} required />
        </label>
        <label>Sets
          <input type="number" inputMode="numeric" step="1" min="1" max="20" value={sets} onChange={(e) => setSets(e.target.value)} required />
        </label>
        <label>Date
          <input type="date" value={date ?? today()} max={today()} min="2000-01-01" onChange={(e) => setDate(e.target.value)} required />
        </label>
        {ex.db && <div className="seg dbs" role="group" aria-label="Dumbbells used">
          {[[1, 'One dumbbell'], [2, 'Two dumbbells']].map(([n, label]) => (
            <button type="button" key={n} className={dbs === n ? 'on' : ''} onClick={() => setDbs(n)}>{label}</button>
          ))}
        </div>}
        <button className="primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Log set'}</button>
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
        {next && <p className="dim">{fmtGoal(t[next] - best, unit)} more to reach <b className="rk" style={{ '--c': RANKS[next].color }}>{RANKS[next].name}</b>.</p>}
      </div>

      <div className="card">
        <h2>History</h2>
        {!lifts.length && <p className="dim">Nothing logged yet.</p>}
        <ul className="rows">
          {lifts.map((l) => (
            <li key={l.id} className={editing?.id === l.id ? 'on' : ''}>
              <span className="dim when">{short(l.performed_on)}</span>
              <span>{l.sets > 1 && `${l.sets} × `}{l.reps} · {fmtLogged(l.weight_kg, unit)}{l.dumbbells === 2 && ' ×2'}</span>
              <span className="dim">≈ {fmtMax(l.e1rm_kg, unit)}</span>
              <span className="acts">
                <button className="ghost" onClick={() => edit(l)} aria-label={`Edit entry from ${l.performed_on}`}>Edit</button>
                <button className="ghost" onClick={() => remove(l.id)} aria-label={`Delete entry from ${l.performed_on}`}>✕</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
