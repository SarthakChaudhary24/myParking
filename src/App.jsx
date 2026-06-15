import React, { useState, useEffect } from 'react'
import RoleLoginPage from './components/RoleLoginPage'
import GuardApp from './components/GuardApp'
import ResidentApp from './components/ResidentApp'
import AdminApp from './components/AdminApp'

export default function App() {
  // Restore session from sessionStorage so refresh doesn't kick user to login.
  // sessionStorage clears when the tab/browser is closed (unlike localStorage).
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('parking_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [slots, setSlots] = useState([])

  const handleLogin = (userData) => {
    sessionStorage.setItem('parking_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('parking_user')
    setUser(null)
  }

  // Fetch slots just for the login page stats — lightweight, no hook
  useEffect(() => {
    if (!user) {
      fetch(`${import.meta.env.VITE_API_URL}/slots`)
        .then(r => r.json())
        .then(setSlots)
        .catch(() => {})
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-parking-bg grid-bg noise-bg relative">
        <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6ee7f7, transparent)' }} />
        <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <RoleLoginPage slots={slots} onLogin={handleLogin} />
      </div>
    )
  }

  if (user.role === 'admin')    return <AdminApp    user={user} onLogout={handleLogout} />
  if (user.role === 'guard')    return <GuardApp    user={user} onLogout={handleLogout} />
  if (user.role === 'resident') return <ResidentApp user={user} onLogout={handleLogout} />

  return null
}
