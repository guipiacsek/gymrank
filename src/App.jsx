import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { RANKS, e1rm } from './ranks.js'
import Auth from './Auth.jsx'
import Lift from './Lift.jsx'
import Leaderboard from './Leaderboard.jsx'
import Profile from './Profile.jsx'
import { applyTheme } from './theme.js'

export const Badge = ({ rank }) => <span className="badge" style={{ '--c': RANKS[rank].color }}>{RANKS[rank].name}</span>

// Dev-only (localhost/?demo): the real screens with sample data and no login, for checking the design.
const DEMO = import.meta.env.DEV && location.search === '?demo'
const DEMO_PROFILE = { username: 'demo_lifter', sex: 'm' }
const DEMO_LIFTS = !DEMO ? [] : [['bench-press', 100, 5], ['squat', 140, 3], ['deadlift', 180, 2], ['barbell-curl', 30, 8], ['lat-pulldown', 70, 10],
  ['shoulder-press', 45, 6], ['sled-leg-press', 300, 8], ['cable-crunch', 40, 12], ['hip-thrust', 90, 8], ['machine-calf-raise', 60, 10],
  ['tricep-pushdown', 60, 10], ['barbell-shrug', 190, 5]].flatMap(([exercise_id, kg, reps], i) => [0, 9, 23, 40].map((ago, j) => {
  const d = new Date(); d.setDate(d.getDate() - ago - i * 3)
  return { id: i * 10 + j, exercise_id, weight_kg: kg - j * 5, reps, sets: 3, e1rm_kg: e1rm(kg - j * 5, reps), performed_on: d.toLocaleDateString('en-CA') }
}))

const TABS = [['lift', 'Lift'], ['board', 'Leaderboard'], ['profile', 'Profile']]

export default function App() {
  const [session, setSession] = useState(undefined) // undefined while the saved login is being restored
  const [profile, setProfile] = useState(DEMO ? DEMO_PROFILE : null)
  const [lifts, setLifts] = useState(DEMO_LIFTS)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('lift')
  const [unit, setUnitState] = useState(() => {
    try { return localStorage.getItem('unit') === 'kg' ? 'kg' : 'lb' } catch { return 'lb' }
  })
  const setUnit = (u) => { setUnitState(u); try { localStorage.setItem('unit', u) } catch { /* private mode */ } }
  const [theme, setThemeState] = useState(document.documentElement.dataset.theme) // set in main.jsx before first paint
  const setTheme = (t) => { applyTheme(t); setThemeState(t); try { localStorage.setItem('theme', t) } catch { /* private mode */ } }

  useEffect(() => {
    if (DEMO) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const uid = session?.user.id
  // shortcut: loads the newest 1000 lifts (Supabase's page size) and derives maxes and the heatmap in the browser;
  // move those to SQL views once a user can pass 1000 logged sets.
  const loadLifts = useCallback(async () => {
    const { data, error } = await supabase.from('lifts')
      .select('id, exercise_id, weight_kg, reps, sets, e1rm_kg, performed_on')
      .order('performed_on', { ascending: false }).order('id', { ascending: false })
    if (error) setError(error.message)
    else setLifts(data)
  }, [])

  useEffect(() => {
    if (DEMO) return
    setProfile(null); setLifts([]); setError('')
    if (!uid) return
    supabase.from('profiles').select('username, sex').eq('id', uid).single()
      .then(({ data, error }) => (error ? setError(`Could not load your profile: ${error.message}`) : setProfile(data)))
    loadLifts()
  }, [uid, loadLifts])

  if (!DEMO && session === undefined) return <div className="center dim">Loading…</div>
  if (!DEMO && !session) return <Auth />

  return (
    <div className="app">
      <header className="top">
        <div className="logo">Gym<b>Rank</b></div>
        <nav className="tabs">
          {TABS.map(([k, label]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
        </nav>
        <div className="seg small" role="group" aria-label="Weight unit">
          {['lb', 'kg'].map((u) => <button key={u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>{u}</button>)}
        </div>
      </header>
      <main>
        {error && <p className="error" role="alert">{error}</p>}
        {!profile ? !error && <p className="dim">Loading…</p>
          : tab === 'lift' ? <Lift profile={profile} lifts={lifts} unit={unit} reload={loadLifts} />
          : tab === 'board' ? <Leaderboard profile={profile} uid={uid} unit={unit} />
          : <Profile profile={profile} lifts={lifts} unit={unit} theme={theme} setTheme={setTheme} />}
        {!profile && error && <button className="ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>}
        <footer className="foot">
          <p><b>Train safe.</b> Not sure you can lift it? Don't test it. Log a set you can do for reps and GymRank estimates your max, or use a spotter and safety bars.</p>
          <p>GymRank is for fun and motivation, not medical or training advice. Check with a doctor before starting a new program. Maxes are estimates, ranks are adapted from strengthlevel.com community standards, and leaderboard entries are self-reported.</p>
        </footer>
      </main>
    </div>
  )
}

