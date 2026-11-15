import { useEffect, useRef } from 'react'
import { supabase } from './supabase.js'
import { EXERCISES } from './exercises.js'
import { RANKS, bestByExercise, fmtMax, rankIndex, topPercent } from './ranks.js'
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
