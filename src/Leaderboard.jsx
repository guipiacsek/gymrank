import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { EXERCISES, byId } from './exercises.js'
import { fmtMax, rankIndex } from './ranks.js'
import Badge from './Badge.jsx'
import Icon from './Icon.jsx'

export default function Leaderboard({ profile, uid, unit }) {
  const [ex, setEx] = useState('bench-press')
  const [sex, setSex] = useState(profile.sex)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let current = true
    setRows(null); setError('')
    supabase.from('leaderboard').select('user_id, username, e1rm_kg')
      .eq('exercise_id', ex).eq('sex', sex).order('e1rm_kg', { ascending: false }).limit(50)
      .then(({ data, error }) => { if (current) error ? setError(error.message) : setRows(data) })
    return () => { current = false }
  }, [ex, sex])

  return (
    <>
      <div className="card boardhead">
        <Icon id={ex} size={56} />
        <select value={ex} onChange={(e) => setEx(e.target.value)} aria-label="Exercise">
          {EXERCISES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div className="seg" role="group" aria-label="Division">
          {[['m', 'Men'], ['f', 'Women']].map(([v, label]) => <button key={v} className={sex === v ? 'on' : ''} onClick={() => setSex(v)}>{label}</button>)}
        </div>
      </div>
      <div className="card">
        {error && <p className="error" role="alert">{error}</p>}
        {!rows && !error && <p className="dim">Loading…</p>}
        {rows && !rows.length && <p className="dim">Nobody has logged this lift yet. Be the first.</p>}
        <ol className="rows board">
          {rows?.map((r, i) => (
            <li key={r.user_id} className={r.user_id === uid ? 'me' : ''}>
              <span className="pos">{i + 1}</span>
              <span className="name">{r.username}</span>
              <Badge rank={rankIndex(byId[ex][sex], r.e1rm_kg)} />
              <b>{fmtMax(r.e1rm_kg, unit)}</b>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
