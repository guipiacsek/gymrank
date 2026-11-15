import { useState } from 'react'
import { supabase } from './supabase.js'

export default function Auth() {
  const [signup, setSignup] = useState(false)
  const [f, setF] = useState({ email: '', password: '', username: '', sex: '' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setMsg(''); setBusy(true)
    const { email, password, username, sex } = f
    if (signup) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, sex }, emailRedirectTo: location.origin } })
      // The profile row is created by a database trigger; a duplicate or invalid username fails there.
      if (error) setMsg(/database error/i.test(error.message) ? 'That username is already taken. Try another.' : error.message)
      else if (!data.session) setMsg('Almost there: open the confirmation link we emailed you, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg(error.message)
    }
    setBusy(false)
  }

  return (
    <div className="center">
      <form className="card auth" onSubmit={submit}>
        <div className="logo big">Gym<b>Rank</b></div>
        <p className="dim">Log your lifts. Earn your rank.</p>
        {signup && <>
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
        <label>Password
          <input type="password" value={f.password} onChange={set('password')} required minLength={8} autoComplete={signup ? 'new-password' : 'current-password'} />
        </label>
        {msg && <p className="error" role="alert">{msg}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Log in'}</button>
        <button type="button" className="ghost" onClick={() => { setSignup(!signup); setMsg('') }}>
          {signup ? 'I already have an account' : 'New here? Create an account'}
        </button>
      </form>
    </div>
  )
}
