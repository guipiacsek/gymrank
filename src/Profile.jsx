import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase.js'
import { EXERCISES } from './exercises.js'
import { RANKS, bestByExercise, fmtLogged, fmtMax, rankIndex, toKg, topPercent } from './ranks.js'
import Chart from './Chart.jsx'
import BodyMap from './BodyMap.jsx'
import Icon from './Icon.jsx'

const iso = (d) => d.toLocaleDateString('en-CA')

function Heatmap({ lifts }) {
  const box = useRef(null)
  useEffect(() => { box.current.scrollLeft = box.current.scrollWidth }, []) // start at the most recent weeks

  const counts = {}
  for (const l of lifts) counts[l.performed_on] = (counts[l.performed_on] || 0) + 1
  const end = new Date()
  const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 52 * 7 - end.getDay()) // a Sunday, 52 weeks back
  const days = []
  for (; d <= end; d.setDate(d.getDate() + 1)) days.push(iso(d))
  const active = days.filter((k) => counts[k])

  return (
    <>
      <div className="heat" ref={box}>
        {days.map((k) => {
          const n = counts[k] || 0
          return <i key={k} data-l={n > 7 ? 4 : n > 4 ? 3 : n > 2 ? 2 : n ? 1 : 0} title={`${k}: ${n} set${n === 1 ? '' : 's'}`} />
        })}
      </div>
      <p className="dim">{active.length} active day{active.length === 1 ? '' : 's'} in the last year</p>
    </>
  )
}

// One chart card: latest value, change since the first entry, and the line.
function Trend({ title, points, fmt, unit }) {
  const first = points[0].kg, latest = points[points.length - 1].kg
  return (
    <div className="card trend">
      <p className="label">{title}</p>
      <div className="trendval">{fmt(latest)}
        {points.length > 1 && <small className="dim">{latest >= first ? '+' : '−'}{fmtLogged(Math.abs(latest - first), unit)} since first entry</small>}
      </div>
      <Chart points={points} fmt={fmt} />
    </div>
  )
}

function Progress({ lifts, unit }) {
  // Best estimated max per exercise per day.
  const byEx = {}
  for (const l of lifts) {
    const days = (byEx[l.exercise_id] ??= {})
    if (!(days[l.performed_on] >= l.e1rm_kg)) days[l.performed_on] = +l.e1rm_kg
  }
  const shown = EXERCISES.filter((e) => byEx[e.id])
  return (
    <>
      <h2 className="section">Progress</h2>
      {!shown.length && <div className="card"><p className="dim">Log a lift and its chart appears here.</p></div>}
      <div className="charts">
        {shown.map((e) => <Trend key={e.id} title={e.name} unit={unit} fmt={(kg) => fmtMax(kg, unit)}
          points={Object.entries(byEx[e.id]).sort(([a], [b]) => a.localeCompare(b)).map(([date, kg]) => ({ date, kg }))} />)}
      </div>
    </>
  )
}

function BodyWeight({ unit }) {
  const [rows, setRows] = useState([])
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('bodyweights').select('measured_on, weight_kg').order('measured_on')
    if (error) setError(error.message)
    else setRows(data)
  }, [])
  useEffect(() => { load() }, [load])

  async function save(e) {
    e.preventDefault()
    setError('')
    // One entry per day: saving again today replaces today's value.
    const { error } = await supabase.from('bodyweights')
      .upsert({ measured_on: iso(new Date()), weight_kg: +toKg(parseFloat(value), unit).toFixed(2) }, { onConflict: 'user_id,measured_on' })
    if (error) return setError(error.message)
    setValue('')
    load()
  }

  const fmt = (kg) => fmtLogged(kg, unit)
  return (
    <div className="card">
      <h2>Body weight</h2>
      <form className="bwform" onSubmit={save}>
        <input type="number" inputMode="decimal" step="any" min={unit === 'lb' ? 45 : 20} max={unit === 'lb' ? 880 : 400}
          placeholder={`Today's weight (${unit})`} aria-label={`Today's body weight in ${unit}`} value={value} onChange={(e) => setValue(e.target.value)} required />
        <button className="primary">Save</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {rows.length > 0 && <div className="trend bw">
        <div className="trendval">{fmt(rows[rows.length - 1].weight_kg)}</div>
        <Chart points={rows.map((r) => ({ date: r.measured_on, kg: +r.weight_kg }))} fmt={fmt} />
      </div>}
    </div>
  )
}

export default function Profile({ profile, lifts, unit }) {
  const best = bestByExercise(lifts)
  const logged = EXERCISES.filter((e) => best[e.id]).map((e) => ({ ...e, rank: rankIndex(e[profile.sex], best[e.id]) }))
  // A muscle takes the colour of its best-ranked lift.
  const muscles = {}
  for (const e of logged) muscles[e.muscle] = Math.max(muscles[e.muscle] ?? 0, e.rank)

  return (
    <>
      <div className="card profhead">
        <div>
          <h1>{profile.username}</h1>
          <p className="dim">{profile.sex === 'm' ? 'Men' : 'Women'}'s division · {logged.length} of {EXERCISES.length} lifts ranked</p>
        </div>
        <button className="ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>

      <div className="card">
        <h2>Muscle ranks</h2>
        <BodyMap ranks={muscles} />
        <div className="legend">{RANKS.map((r) => <span key={r.name} style={{ '--c': r.color }}><i />{r.name}</span>)}</div>
      </div>

      <div className="card">
        <h2>Activity</h2>
        <Heatmap lifts={lifts} />
      </div>

      <BodyWeight unit={unit} />

      <Progress lifts={lifts} unit={unit} />

      <div className="card">
        <h2>Personal bests</h2>
        {!logged.length && <p className="dim">Log a lift to see your bests here.</p>}
        <ul className="rows">
          {logged.sort((a, b) => b.rank - a.rank).map((e) => (
            <li key={e.id}>
              <Icon id={e.id} size={36} />
              <span className="name">
                <span>{e.name}</span>
                <small className="dim"><span style={{ color: RANKS[e.rank].color }}>{RANKS[e.rank].name}</span> · Top {topPercent(e[profile.sex], best[e.id])}%</small>
              </span>
              <b>{fmtMax(best[e.id], unit)}</b>
            </li>
          ))}
        </ul>
      </div>
      <p className="dim credit">Rank thresholds adapted from community strength standards by strengthlevel.com. Maxes are estimated one-rep maxes.</p>
    </>
  )
}
