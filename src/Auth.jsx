import { useState } from 'react'
import { supabase } from './supabase.js'

const TITLES = { login: 'Log in', signup: 'Create account', forgot: 'Send reset link' }

// notice: a message to show on arrival, e.g. an expired email link.
export default function Auth({ notice }) {
  const [mode, setMode] = useState('login') // login | signup | forgot
  const [f, setF] = useState({ email: '', password: '', username: '', sex: '' })
  const [msg, setMsg] = useState(notice ? { bad: true, text: notice } : null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const go = (m) => { setMode(m); setMsg(null) }

  async function submit(e) {
    e.preventDefault()
    setMsg(null); setBusy(true)
    const { email, password, username, sex } = f
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, sex }, emailRedirectTo: location.origin } })
      // The profile row is created by a database trigger; a duplicate or invalid username fails there.
      if (error) setMsg({ bad: true, text: /database error/i.test(error.message) ? 'That username is already taken. Try another.' : error.message })
      else if (!data.session) setMsg({ text: 'Almost there: open the confirmation link we emailed you, then log in.' })
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin })
      // Same message whether or not the email has an account, so the form can't be used to look up who signed up.
      setMsg(error ? { bad: true, text: error.message } : { text: 'If that email has an account, a reset link is on its way.' })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg({ bad: true, text: error.message })
    }
    setBusy(false)
  }

  return (
    <div className="center">
      <form className="card auth" onSubmit={submit}>
        <div className="logo big">Gym<b>Rank</b></div>
        <p className="dim">{mode === 'forgot' ? "Enter your email and we'll send you a link to set a new password." : 'Log your lifts. Earn your rank.'}</p>
        {mode === 'signup' && <>
          <label>Username
            <input value={f.username} onChange={set('username')} required pattern="[A-Za-z0-9_]{3,20}" title="3 to 20 letters, numbers or underscores" autoComplete="username" autoCapitalize="none" />
          </label>
          <fieldset>
            <legend>Rank me against</legend>
            <div className="seg">
              {[['m', 'Men'], ['f', 'Women']].map(([v, label]) => (
                <label key={v} className={f.sex === v ? 'on' : ''}>
                  <input type="radio" name="sex" value={v} checked={f.sex === v} onChange={set('sex')} required />{label}
                </label>
              ))}
            </div>
          </fieldset>
        </>}
        <label>Email
          <input type="email" value={f.email} onChange={set('email')} required autoComplete="email" />
        </label>
        {mode !== 'forgot' && <label>Password
          <input type="password" value={f.password} onChange={set('password')} required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
        </label>}
        {msg && <p className={msg.bad ? 'error' : 'ok'} role="alert">{msg.text}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : TITLES[mode]}</button>
        {mode === 'login' && <button type="button" className="ghost" onClick={() => go('forgot')}>Forgot password?</button>}
        <button type="button" className="ghost" onClick={() => go(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'New here? Create an account' : 'Back to log in'}
        </button>
      </form>
    </div>
  )
}

// Shown after the user opens a password reset link: they are signed in for this one purpose.
export function NewPassword({ done }) {
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setMsg({ bad: true, text: error.message })
    else done()
  }

  return (
    <div className="center">
      <form className="card auth" onSubmit={submit}>
        <div className="logo big">Gym<b>Rank</b></div>
        <p className="dim">Choose a new password.</p>
        <label>New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </label>
        {msg && <p className="error" role="alert">{msg.text}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </div>
  )
}
