import React, { useState } from 'react'
import { getParkingStats } from '../utils/parkingLogic'

export default function RoleLoginPage({ slots, onLogin }) {
  const stats = getParkingStats(slots)
  const [mode, setMode] = useState('select') // 'select' | 'resident' | 'guard' | 'admin'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const summary = [
    { label: 'Total Slots', value: stats.total,     tone: 'text-parking-accent' },
    { label: 'Available',   value: stats.available, tone: 'text-parking-green'  },
    { label: 'Occupied',    value: stats.occupied,  tone: 'text-parking-red'    },
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      // Validate role matches selected mode
      if (mode !== 'admin' && data.role !== mode) {
        setError(`This account is not a ${mode}. Please use the correct login.`)
        setLoading(false)
        return
      }
      if (mode === 'admin' && data.role !== 'admin') {
        setError('This account does not have admin access.')
        setLoading(false)
        return
      }
      onLogin(data)
    } catch {
      setError('Cannot connect to server. Is it running?')
    }
    setLoading(false)
  }

  if (mode === 'select') {
    return (
      <div className="relative z-1 max-w-6xl mx-auto px-6 py-12 sm:py-16">
        {/* Stats banner */}
        <section className="glass border border-parking-border rounded-[2rem] p-6 sm:p-8 mb-6">
          <div className="max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-parking-accent mb-4">
              myParking — Login
            </p>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-gradient leading-tight">
              Choose who is entering the parking system.
            </h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 mt-8">
            {summary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-parking-border bg-parking-surface px-4 py-4">
                <p className="text-xs font-mono uppercase tracking-wider text-parking-muted">{item.label}</p>
                <p className={`font-display font-black text-3xl mt-2 ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Role cards */}
        <section className="grid gap-5 lg:grid-cols-2 mb-5">
          {/* Guard */}
          <article className="glass border border-parking-accent/30 rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-parking-muted">Guard Access</p>
            <h2 className="font-display font-black text-3xl mt-3 text-parking-accent">GUARD</h2>
            <p className="text-sm text-parking-muted leading-7 mt-4">Occupy and free parking slots, tag residents or guests.</p>
            <div className="space-y-2 mt-6">
              {['View all parking slots', 'Park vehicle & tag resident/guest', 'Free occupied slots'].map(f => (
                <div key={f} className="rounded-xl border border-parking-border bg-parking-surface px-4 py-3 text-sm text-parking-text">{f}</div>
              ))}
            </div>
            <button onClick={() => setMode('guard')}
              className="mt-6 w-full rounded-2xl px-4 py-3.5 font-display font-bold text-base bg-parking-accent text-parking-bg glow-accent transition-all duration-200 active:scale-[0.98] btn-press">
              Login as Guard
            </button>
          </article>

          {/* Resident */}
          <article className="glass border border-parking-green/30 rounded-[2rem] p-6 sm:p-7">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-parking-muted">Resident Access</p>
            <h2 className="font-display font-black text-3xl mt-3 text-parking-green">RESIDENT</h2>
            <p className="text-sm text-parking-muted leading-7 mt-4">View parking status and free your own occupied slot.</p>
            <div className="space-y-2 mt-6">
              {['View available parking slots', 'See your occupied slot', 'Free your own slot'].map(f => (
                <div key={f} className="rounded-xl border border-parking-border bg-parking-surface px-4 py-3 text-sm text-parking-text">{f}</div>
              ))}
            </div>
            <button onClick={() => setMode('resident')}
              className="mt-6 w-full rounded-2xl px-4 py-3.5 font-display font-bold text-base bg-parking-green text-parking-bg glow-green transition-all duration-200 active:scale-[0.98] btn-press">
              Login as Resident
            </button>
            <p className="text-center text-xs text-parking-muted font-mono mt-3">
              No account? Contact admin to create one.
            </p>
          </article>
        </section>

        {/* Admin link */}
        <div className="text-center">
          <button onClick={() => setMode('admin')}
            className="text-xs font-mono text-parking-muted hover:text-parking-accent transition-colors underline underline-offset-2">
            Admin Login
          </button>
        </div>
      </div>
    )
  }

  // Login form for guard / resident / admin
  const config = {
    guard:    { title: 'Guard Login',    color: 'text-parking-accent', btn: 'bg-parking-accent' },
    resident: { title: 'Resident Login', color: 'text-parking-green',  btn: 'bg-parking-green'  },
    admin:    { title: 'Admin Login',    color: 'text-parking-amber',  btn: 'bg-parking-amber'  },
  }[mode]

  return (
    <div className="relative z-1 max-w-md mx-auto px-6 py-16">
      <div className="glass border border-parking-border rounded-[2rem] p-8">
        <button onClick={() => { setMode('select'); setError(''); setUsername(''); setPassword('') }}
          className="text-xs font-mono text-parking-muted hover:text-parking-text mb-6 flex items-center gap-1 transition-colors">
          ← Back
        </button>
        <p className="text-xs font-mono uppercase tracking-[0.35em] text-parking-muted mb-2">myParking</p>
        <h2 className={`font-display font-black text-3xl mb-8 ${config.color}`}>{config.title}</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Enter username" autoComplete="username"
              className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm placeholder:text-parking-muted focus:outline-none focus:border-parking-accent focus:ring-1 focus:ring-parking-accent/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" autoComplete="current-password"
              className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm placeholder:text-parking-muted focus:outline-none focus:border-parking-accent focus:ring-1 focus:ring-parking-accent/30 transition-all"
            />
          </div>

          {error && (
            <div className="rounded-xl p-3 bg-parking-redDim border border-parking-red/30 text-parking-red text-xs font-mono">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading || !username || !password}
            className={`w-full py-3.5 rounded-xl font-display font-bold text-base ${config.btn} text-parking-bg hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 btn-press`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-parking-bg/40 border-t-parking-bg rounded-full animate-spin" />
                Logging in...
              </span>
            ) : 'Login'}
          </button>
        </form>

        {mode === 'resident' && (
          <p className="text-center text-xs text-parking-muted font-mono mt-6">
            No account? Contact admin to create one.
          </p>
        )}
      </div>
    </div>
  )
}
