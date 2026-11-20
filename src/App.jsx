import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { e1rm } from './ranks.js'
import { fetchAll } from './fetchAll.js'
import Auth, { NewPassword } from './Auth.jsx'
import Lift from './Lift.jsx'
import Leaderboard from './Leaderboard.jsx'
import Profile from './Profile.jsx'
import Privacy from './Privacy.jsx'
import { applyTheme } from './theme.js'

// Dev-only (localhost/?demo): the real screens with sample data and no login, for checking the design.
const DEMO = import.meta.env.DEV && location.search === '?demo'
const DEMO_PROFILE = { username: 'demo_lifter', sex: 'm' }
const DEMO_LIFTS = !DEMO ? [] : [['bench-press', 100, 5], ['squat', 140, 3], ['deadlift', 180, 2], ['barbell-curl', 30, 8], ['lat-pulldown', 70, 10],
  ['shoulder-press', 45, 6], ['sled-leg-press', 300, 8], ['cable-crunch', 40, 12], ['hip-thrust', 90, 8], ['machine-calf-raise', 60, 10],
  ['tricep-pushdown', 60, 10], ['barbell-shrug', 190, 5]].flatMap(([exercise_id, kg, reps], i) => [0, 9, 23, 40].map((ago, j) => {
  const d = new Date(); d.setDate(d.getDate() - ago - i * 3)
  return { id: i * 10 + j, exercise_id, weight_kg: kg - j * 5, reps, sets: 3, e1rm_kg: e1rm(kg - j * 5, reps), performed_on: d.toLocaleDateString('en-CA') }
}))

// Supabase reports a failed email link (used, expired) in the address: #error=...&error_description=...
// Read it once, then clean the address so a refresh doesn't show it again.
function linkError() {
  const p = new URLSearchParams(location.hash.slice(1))
  if (!p.get('error')) return ''
  history.replaceState(null, '', location.pathname + location.search)
  const why = p.get('error_description') || 'That email link did not work.'
  return p.get('error_code') === 'otp_expired' ? `${why}. If you already confirmed your email, just log in.` : why
}

const TABS = [['lift', 'Lift'], ['board', 'Leaderboard'], ['profile', 'Profile']]

export default function App() {
  const [session, setSession] = useState(undefined) // undefined while the saved login is being restored
  const [notice] = useState(linkError)
  const [recovery, setRecovery] = useState(false) // arrived from a password reset link
  const [profile, setProfile] = useState(DEMO ? DEMO_PROFILE : null)
  const [lifts, setLifts] = useState(DEMO_LIFTS)
  const [error, setError] = useState('')
  // The page lives in the address (#board, #lift/bench-press, #privacy), so the browser's back button works.
  const [path, setPath] = useState(() => location.hash.slice(1))
  const [page, sub] = path.split('/')
  const tab = TABS.some(([k]) => k === page) ? page : 'lift'
  const go = (to) => { location.hash = to }
  useEffect(() => {
    const onHash = () => { setPath(location.hash.slice(1)); scrollTo(0, 0) }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  const [unit, setUnitState] = useState(() => {
    try { return localStorage.getItem('unit') === 'kg' ? 'kg' : 'lb' } catch { return 'lb' }
  })
  const setUnit = (u) => { setUnitState(u); try { localStorage.setItem('unit', u) } catch { /* private mode */ } }
  const [theme, setThemeState] = useState(document.documentElement.dataset.theme) // set in main.jsx before first paint
  const setTheme = (t) => { applyTheme(t); setThemeState(t); try { localStorage.setItem('theme', t) } catch { /* private mode */ } }

  useEffect(() => {
    if (DEMO) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setSession(s)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const uid = session?.user.id
  // All of the user's entries; maxes, totals, charts and the heatmap are worked out from them in the browser.
  const loadLifts = useCallback(async () => {
    const { data, error } = await fetchAll((from, to) => supabase.from('lifts')
      .select('id, exercise_id, weight_kg, reps, sets, dumbbells, e1rm_kg, performed_on')
      .order('performed_on', { ascending: false }).order('id', { ascending: false }).range(from, to))
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

  if (page === 'privacy') return <Privacy />
  if (!DEMO && session === undefined) return <div className="center dim">Loading…</div>
  if (!DEMO && !session) return <Auth notice={notice} />
  if (recovery) return <NewPassword done={() => setRecovery(false)} />

  return (
    <div className="app">
      <header className="top">
        <div className="logo">Gym<b>Rank</b></div>
        <nav className="tabs">
          {TABS.map(([k, label]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)}>{label}</button>)}
        </nav>
        <div className="seg small" role="group" aria-label="Weight unit">
          {['lb', 'kg'].map((u) => <button key={u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>{u}</button>)}
        </div>
      </header>
      <main>
        {error && <p className="error" role="alert">{error}</p>}
        {!profile ? !error && <p className="dim">Loading…</p>
          : tab === 'lift' ? <Lift profile={profile} lifts={lifts} unit={unit} reload={loadLifts} sel={sub} open={(id) => go(id ? `lift/${id}` : 'lift')} />
          : tab === 'board' ? <Leaderboard profile={profile} uid={uid} unit={unit} />
          : <Profile profile={profile} lifts={lifts} unit={unit} theme={theme} setTheme={setTheme} />}
        {!profile && error && <button className="ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>}
        <footer className="foot">
          <p><b>Train safe.</b> Not sure you can lift it? Don't test it. Log a set you can do for reps and GymRank estimates your max, or use a spotter and safety bars.</p>
          <p>GymRank is for fun and motivation, not medical or training advice. Check with a doctor before starting a new program. Maxes are estimates, ranks are adapted from strengthlevel.com community standards, and leaderboard entries are self-reported.</p>
          <p><a href="#privacy">Privacy Policy</a></p>
        </footer>
      </main>
    </div>
  )
}

