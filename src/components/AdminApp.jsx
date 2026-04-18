import React, { useState, useEffect } from 'react'
import { useParking } from '../hooks/useParking'
import Header from './Header'
import AddSlotForm from './AddSlotForm'

const API = 'http://localhost:3001/api'

export default function AdminApp({ user, onLogout }) {
  const { slots, addSlot, deleteSlot, updateSlot } = useParking()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [createRole, setCreateRole] = useState('resident')
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '', tower: '' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const loadUsers = () => {
    fetch(`${API}/users`)
      .then(r => r.json())
      .then(setUsers)
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(''); setFormSuccess(''); setLoading(true)
    
    if (editingUser) {
      // Update existing user
      const res = await fetch(`${API}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: editingUser.role }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) { setFormError(data.error); return }
      setFormSuccess(`${editingUser.role === 'resident' ? 'Resident' : 'Guard'} "${data.name}" updated!`)
      setForm({ username: '', password: '', name: '', phone: '', tower: '' })
      setEditingUser(null)
      setShowCreateForm(false)
      loadUsers()
    } else {
      // Create new user
      const res = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: createRole }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) { setFormError(data.error); return }
      setFormSuccess(`${createRole === 'resident' ? 'Resident' : 'Guard'} "${data.name}" created!`)
      setForm({ username: '', password: '', name: '', phone: '', tower: '' })
      loadUsers()
    }
  }

  const handleEdit = (u) => {
    setEditingUser(u)
    setForm({ username: u.username, password: '', name: u.name, phone: u.phone || '', tower: u.tower || '' })
    setShowCreateForm(true)
    setFormError('')
    setFormSuccess('')
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setForm({ username: '', password: '', name: '', phone: '', tower: '' })
    setShowCreateForm(false)
    setFormError('')
    setFormSuccess('')
  }

  const handleDelete = async (id) => {
    await fetch(`${API}/users/${id}`, { method: 'DELETE' })
    loadUsers()
  }

  const handleDeleteSlot = async (slotId) => {
    if (confirm('Are you sure you want to delete this parking slot? This action cannot be undone.')) {
      await deleteSlot(slotId)
    }
  }

  const TABS = [
    { id: 'users', label: 'Manage Users', icon: '👥' },
    { id: 'slots', label: 'Manage Slots', icon: '🅿️' },
  ]

  return (
    <div className="min-h-screen bg-parking-bg grid-bg noise-bg relative">
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fbbf24, transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

      <div className="max-w-6xl mx-auto pb-12 relative z-10">
        <Header slots={slots} onLogout={onLogout} userName={user.name} userRole="Admin" />

        {/* Tab nav */}
        <nav className="px-6 mb-6">
          <div className="flex gap-1 p-1 bg-parking-surface border border-parking-border rounded-2xl">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-body font-medium text-xs transition-all duration-200 btn-press
                  ${activeTab === tab.id ? 'bg-parking-amber text-parking-bg shadow-lg' : 'text-parking-muted hover:text-parking-text hover:bg-parking-card'}`}>
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden sm:inline truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div key={activeTab}>
          {activeTab === 'users' && (
            <div className="px-6 space-y-5 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>

              {/* Create/Edit account */}
              <div className="glass border border-parking-border rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-parking-amberDim flex items-center justify-center">
                      <span className="text-lg">{editingUser ? '✏️' : '➕'}</span>
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-parking-text">
                        {editingUser ? 'Edit Account' : 'Create Account'}
                      </h2>
                      <p className="text-parking-muted text-xs">
                        {editingUser ? 'Update user information' : 'Add a new resident or guard'}
                      </p>
                    </div>
                  </div>
                  {!editingUser && (
                    <button onClick={() => setShowCreateForm(v => !v)}
                      className="px-3 py-1.5 rounded-xl bg-parking-amberDim text-parking-amber text-xs font-mono border border-parking-amber/20 hover:brightness-110 transition-all">
                      {showCreateForm ? 'Cancel' : '+ New Account'}
                    </button>
                  )}
                  {editingUser && (
                    <button type="button" onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-xl bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border hover:border-parking-red/50 hover:text-parking-red transition-all">
                      Cancel Edit
                    </button>
                  )}
                </div>

                {(showCreateForm || editingUser) && (
                  <form onSubmit={handleCreate} className="space-y-4">
                    {/* Role selector - only show when creating new user */}
                    {!editingUser && (
                      <div className="flex gap-2">
                        {['resident', 'guard'].map(r => (
                          <button key={r} type="button" onClick={() => setCreateRole(r)}
                            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all border
                              ${createRole === r ? 'bg-parking-amber text-parking-bg border-parking-amber' : 'bg-parking-surface text-parking-muted border-parking-border hover:border-parking-amber/50'}`}>
                            {r === 'resident' ? '🏠 Resident' : '🛡️ Guard'}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Show role badge when editing */}
                    {editingUser && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-parking-surface border border-parking-border">
                        <span className="text-xs text-parking-muted font-mono uppercase tracking-widest">Role:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold
                          ${editingUser.role === 'guard' ? 'bg-parking-accentDim text-parking-accent' : 'bg-parking-greenDim text-parking-green'}`}>
                          {editingUser.role === 'guard' ? '🛡️ Guard' : '🏠 Resident'}
                        </span>
                      </div>
                    )}

                  <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Full Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Priya Sharma" required
                          className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm placeholder:text-parking-muted focus:outline-none focus:border-parking-accent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Phone</label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210"
                          className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm placeholder:text-parking-muted focus:outline-none focus:border-parking-accent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Username *</label>
                        <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. priya123" required
                          className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm placeholder:text-parking-muted focus:outline-none focus:border-parking-accent transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">
                          Password {editingUser ? '(leave blank to keep current)' : '*'}
                        </label>
                        <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                          placeholder={editingUser ? "Leave blank to keep current password" : "Set a password"} 
                          required={!editingUser}
                          className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm placeholder:text-parking-muted focus:outline-none focus:border-parking-accent transition-all" />
                      </div>
                      {(editingUser ? editingUser.role === 'resident' : createRole === 'resident') && (
                        <div>
                          <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Tower *</label>
                          <select value={form.tower || ''} onChange={e => setForm(f => ({ ...f, tower: e.target.value }))} required
                            className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm focus:outline-none focus:border-parking-accent transition-all appearance-none cursor-pointer">
                            <option value="">Select Tower</option>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(t => (
                              <option key={t} value={t}>Tower {t}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {formError && <div className="rounded-xl p-3 bg-parking-redDim border border-parking-red/30 text-parking-red text-xs font-mono">❌ {formError}</div>}
                    {formSuccess && <div className="rounded-xl p-3 bg-parking-greenDim border border-parking-green/30 text-parking-green text-xs font-mono">✅ {formSuccess}</div>}

                    <button type="submit" disabled={loading}
                      className="w-full py-3 rounded-xl font-display font-bold text-sm bg-parking-amber text-parking-bg hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all">
                      {loading ? (editingUser ? 'Updating...' : 'Creating...') : 
                        editingUser ? `Update ${editingUser.role === 'resident' ? 'Resident' : 'Guard'}` :
                        `Create ${createRole === 'resident' ? 'Resident' : 'Guard'} Account`}
                    </button>
                  </form>
                )}
              </div>

              {/* Users list */}
              <div className="glass border border-parking-border rounded-3xl p-6">
                <h2 className="font-display font-bold text-lg text-parking-text mb-4">All Accounts</h2>
                {users.length === 0 ? (
                  <p className="text-parking-muted text-sm text-center py-8">No accounts yet.</p>
                ) : (
                  <div className="space-y-2">
                    {users.map(u => (
                      <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-parking-surface border border-parking-border">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                            ${u.role === 'guard' ? 'bg-parking-accentDim text-parking-accent' : 'bg-parking-greenDim text-parking-green'}`}>
                            {u.role === 'guard' ? '🛡️' : '🏠'}
                          </div>
                          <div>
                            <p className="font-display font-bold text-parking-text text-sm">{u.name}</p>
                            <p className="text-xs font-mono text-parking-muted">
                              @{u.username} · {u.phone || 'No phone'}
                              {u.tower && ` · Tower ${u.tower}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-mono
                            ${u.role === 'guard' ? 'bg-parking-accentDim text-parking-accent' : 'bg-parking-greenDim text-parking-green'}`}>
                            {u.role}
                          </span>
                          <button onClick={() => handleEdit(u)}
                            className="px-2 py-1 rounded-lg bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border hover:border-parking-accent/50 hover:text-parking-accent transition-all">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(u.id)}
                            className="px-2 py-1 rounded-lg bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border hover:border-parking-red/50 hover:text-parking-red transition-all">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'slots' && (
            <div className="px-6 space-y-5 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>
              <AddSlotForm addSlot={addSlot} />
              
              {/* Slots list */}
              <div className="glass border border-parking-border rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg text-parking-text">All Parking Slots</h2>
                  <span className="px-3 py-1 rounded-full bg-parking-accentDim text-parking-accent text-xs font-mono font-bold">
                    {slots.length} slots
                  </span>
                </div>
                {slots.length === 0 ? (
                  <p className="text-parking-muted text-sm text-center py-8">No parking slots yet.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {slots.map(slot => (
                      <div key={slot.id} className={`rounded-2xl border p-4 transition-all
                        ${slot.isOccupied ? 'bg-parking-redDim/20 border-parking-red/40' : 'bg-parking-surface border-parking-border'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                              ${slot.isOccupied ? 'bg-parking-redDim text-parking-red' : 'bg-parking-greenDim text-parking-green'}`}>
                              {slot.isOccupied ? '🚗' : '🅿️'}
                            </div>
                            <div>
                              <p className="font-display font-black text-base text-parking-text">{slot.slotNo}</p>
                              <p className={`text-xs font-mono ${slot.isOccupied ? 'text-parking-red' : 'text-parking-green'}`}>
                                {slot.isOccupied ? '● Occupied' : '● Available'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {slot.isCovered && (
                            <span className="px-2 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">🏠 Covered</span>
                          )}
                          {slot.isEVCharging && (
                            <span className="px-2 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">⚡ EV</span>
                          )}
                          {slot.nearTowers && slot.nearTowers.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border">
                              📍 {slot.nearTowers.join(', ')}
                            </span>
                          )}
                        </div>

                        {slot.isOccupied && slot.occupiedBy && (
                          <div className="mb-3 p-2 rounded-lg bg-parking-surface border border-parking-border">
                            <p className="text-xs text-parking-muted font-mono">Occupied by:</p>
                            <p className="text-xs font-display font-bold text-parking-text">{slot.occupiedBy.name}</p>
                          </div>
                        )}

                        <button onClick={() => handleDeleteSlot(slot.id)}
                          className="w-full py-2 rounded-lg bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border hover:border-parking-red/50 hover:text-parking-red hover:bg-parking-redDim/20 active:scale-[0.98] transition-all">
                          🗑️ Delete Slot
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-10 px-6">
          <p className="text-parking-muted text-xs font-mono">myParking v1.0 — Logged in as Admin</p>
          <p className="text-parking-border text-xs font-mono mt-3">Built with ❤️ by Sarthak</p>
        </footer>
      </div>
    </div>
  )
}
