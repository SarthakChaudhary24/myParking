import React, { useState, useEffect } from 'react'
import { ParkVehicle, sortSlots } from '../utils/parkingLogic'

const API = 'http://localhost:3001/api'

function ToggleCard({ checked, onChange, icon, title, description, type }) {
  const activeStyles = { ev: 'border-parking-amber/50 bg-parking-amberDim/40', cover: 'border-parking-purple/50 bg-parking-purpleDim/40' }
  const checkStyles  = { ev: 'border-parking-amber bg-parking-amber',           cover: 'border-parking-purple bg-parking-purple' }
  return (
    <div onClick={() => onChange(!checked)}
      className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 select-none
        ${checked ? activeStyles[type] : 'border-parking-border bg-parking-surface hover:border-parking-muted'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-body font-medium text-parking-text text-sm">{title}</p>
            <p className="text-parking-muted text-xs">{description}</p>
          </div>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${checked ? checkStyles[type] : 'border-parking-border bg-parking-surface'}`}>
          {checked && <span className="text-parking-bg text-xs font-black">✓</span>}
        </div>
      </div>
    </div>
  )
}

export default function GuardParkPanel({ slots, onRemove }) {
  const [needsEV, setNeedsEV]       = useState(false)
  const [needsCover, setNeedsCover] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [residents, setResidents]   = useState([])
  const [selectedResident, setSelectedResident] = useState('GUEST')
  const [selectedSlot, setSelectedSlot]         = useState('')
  const [freeResult, setFreeResult]             = useState(null)

  useEffect(() => {
    fetch(`${API}/users/residents`)
      .then(r => r.json())
      .then(setResidents)
  }, [])

  const handlePark = async () => {
    setLoading(true); setResult(null)
    await new Promise(r => setTimeout(r, 400))
    
    const residentTower = selectedResident === 'GUEST'
      ? null
      : residents.find(r => r.id === selectedResident)?.tower || null
    
    const found = ParkVehicle(sortSlots(slots), needsEV, needsCover, residentTower)
    
    if (found.slot) {
      const occupiedBy = selectedResident === 'GUEST'
        ? { id: 'GUEST', name: 'Guest', phone: null }
        : residents.find(r => r.id === selectedResident) || null

      await fetch(`${API}/slots/${found.slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOccupied: true, occupiedBy }),
      })
      window.dispatchEvent(new Event('parking-updated'))
      setResult({ type: 'success', message: found.message, slot: found.slot, occupiedBy })
    } else {
      setResult({ type: 'error', message: found.message })
    }
    setLoading(false)
  }

  const handleFree = async () => {
    if (!selectedSlot) return
    await fetch(`${API}/slots/${selectedSlot}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOccupied: false, occupiedBy: null }),
    })
    window.dispatchEvent(new Event('parking-updated'))
    setSelectedSlot('')
    setFreeResult('done')
    setTimeout(() => setFreeResult(null), 3000)
  }

  const occupiedSlots = slots.filter(s => s.isOccupied)

  return (
    <div className="px-6 space-y-4 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>

      {/* Park a Vehicle */}
      <div className="glass border border-parking-border rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-parking-accentDim flex items-center justify-center"><span className="text-lg">🚗</span></div>
          <div>
            <h2 className="font-display font-bold text-lg text-parking-text">Park a Vehicle</h2>
            <p className="text-parking-muted text-xs">Tag a resident or mark as guest</p>
          </div>
        </div>

        {/* Resident selector */}
        <div className="mb-4">
          <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Tag Resident / Guest</label>
          <select value={selectedResident} onChange={e => setSelectedResident(e.target.value)}
            className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm focus:outline-none focus:border-parking-accent transition-all appearance-none cursor-pointer">
            <option value="GUEST">👤 Guest (Temporary)</option>
            {residents.map(r => (
              <option key={r.id} value={r.id}>{r.name} (@{r.username})</option>
            ))}
          </select>
        </div>

        <div className="space-y-3 mb-5">
          <ToggleCard checked={needsEV}    onChange={setNeedsEV}    icon="⚡" title="EV Charging Required"  description="Find a slot with EV charger"    type="ev"    />
          <ToggleCard checked={needsCover} onChange={setNeedsCover} icon="🏠" title="Covered Spot Required" description="Find a covered/indoor slot"      type="cover" />
        </div>

        {result && (
          <div className={`rounded-xl p-4 mb-4 border ${result.type === 'success' ? 'bg-parking-greenDim border-parking-green/30' : 'bg-parking-redDim border-parking-red/30'}`}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{result.type === 'success' ? '✅' : '❌'}</span>
              <div>
                <p className={`font-display font-bold text-sm ${result.type === 'success' ? 'text-parking-green' : 'text-parking-red'}`}>{result.message}</p>
                {result.occupiedBy && (
                  <p className="text-xs font-mono text-parking-muted mt-1">
                    Tagged: {result.occupiedBy.name}
                    {result.occupiedBy.phone ? ` · ${result.occupiedBy.phone}` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <button onClick={handlePark} disabled={loading}
          className="w-full py-3.5 rounded-xl font-display font-bold text-base bg-parking-accent text-parking-bg glow-accent hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all duration-200 btn-press">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-parking-bg/40 border-t-parking-bg rounded-full animate-spin" />
              Searching...
            </span>
          ) : '🚗 Park Vehicle'}
        </button>
      </div>

      {/* Free a Slot */}
      <div className="glass border border-parking-border rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-parking-greenDim flex items-center justify-center"><span className="text-lg">🔓</span></div>
          <div>
            <h2 className="font-display font-bold text-lg text-parking-text">Free a Slot</h2>
            <p className="text-parking-muted text-xs">Remove vehicle from occupied slot</p>
          </div>
        </div>

        {occupiedSlots.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-parking-surface border border-parking-border">
            <p className="text-3xl mb-2">🏁</p>
            <p className="text-parking-muted text-sm">No occupied slots right now</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">Select Occupied Slot</label>
              <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}
                className="w-full bg-parking-surface border border-parking-border rounded-xl px-4 py-3 text-parking-text font-mono text-sm focus:outline-none focus:border-parking-accent transition-all appearance-none cursor-pointer">
                <option value="">-- Select a slot --</option>
                {occupiedSlots.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.slotNo} — {s.occupiedBy?.name || 'Unknown'} {s.occupiedBy?.phone ? `(${s.occupiedBy.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {freeResult && (
              <div className="rounded-xl p-3 mb-3 bg-parking-greenDim border border-parking-green/30 flex items-center gap-2">
                <span>✅</span><span className="text-parking-green text-sm font-body">Slot freed successfully!</span>
              </div>
            )}

            <button onClick={handleFree} disabled={!selectedSlot}
              className="w-full py-3.5 rounded-xl font-display font-bold text-base bg-parking-green text-parking-bg glow-green hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all duration-200 btn-press">
              🔓 Free This Slot
            </button>
          </>
        )}
      </div>
    </div>
  )
}
