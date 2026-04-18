import React, { useState } from 'react'

// ToggleCard — uses type-specific hardcoded classes (Tailwind purge-safe)
function ToggleCard({ checked, onChange, icon, title, description, type }) {
  // type: 'ev' | 'cover'
  const activeStyles = {
    ev:    'border-parking-amber/50 bg-parking-amberDim/40',
    cover: 'border-parking-purple/50 bg-parking-purpleDim/40',
  }
  const checkStyles = {
    ev:    'border-parking-amber bg-parking-amber',
    cover: 'border-parking-purple bg-parking-purple',
  }

  return (
    <div
      onClick={() => onChange(!checked)}
      className={`
        cursor-pointer rounded-2xl border p-4 transition-all duration-200 select-none
        ${checked
          ? activeStyles[type]
          : 'border-parking-border bg-parking-surface hover:border-parking-muted'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-body font-medium text-parking-text text-sm">{title}</p>
            <p className="text-parking-muted text-xs">{description}</p>
          </div>
        </div>
        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${checked ? checkStyles[type] : 'border-parking-border bg-parking-surface'}
        `}>
          {checked && <span className="text-parking-bg text-xs font-black">✓</span>}
        </div>
      </div>
    </div>
  )
}

export default function ParkVehiclePanel({ slots, parkVehicle, removeVehicle, lastResult, clearResult, onViewSlot }) {
  const [needsEV, setNeedsEV] = useState(false)
  const [needsCover, setNeedsCover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [freeResult, setFreeResult] = useState(null)

  const occupiedSlots = slots.filter((s) => s.isOccupied)

  const handlePark = async () => {
    setLoading(true)
    clearResult()
    await new Promise((r) => setTimeout(r, 400))
    parkVehicle(needsEV, needsCover)
    setLoading(false)
  }

  const handleFree = () => {
    if (!selectedSlot) return
    removeVehicle(selectedSlot)
    setSelectedSlot('')
    setFreeResult('done')
    setTimeout(() => setFreeResult(null), 3000)
  }

  return (
    <div className="px-6 space-y-4 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>

      {/* ── Park a Vehicle ── */}
      <div className="glass border border-parking-border rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-parking-accentDim flex items-center justify-center">
            <span className="text-lg">🚗</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-parking-text">Park a Vehicle</h2>
            <p className="text-parking-muted text-xs">Choose requirements & find best slot</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <ToggleCard
            checked={needsEV}
            onChange={setNeedsEV}
            icon="⚡"
            title="EV Charging Required"
            description="Find a slot with isEVCharging = true"
            type="ev"
          />
          <ToggleCard
            checked={needsCover}
            onChange={setNeedsCover}
            icon="🏠"
            title="Covered Spot Required"
            description="Find a slot with isCovered = true"
            type="cover"
          />
        </div>

        {/* Requirements summary */}
        <div className="rounded-xl bg-parking-surface border border-parking-border p-3 mb-5">
          <p className="text-xs text-parking-muted font-mono mb-1.5">FINDING SLOT WITH:</p>
          <div className="flex gap-2 flex-wrap">
            {!needsEV && !needsCover && (
              <span className="px-2 py-0.5 rounded-full bg-parking-accentDim text-parking-accent text-xs font-mono">
                Any Available Slot
              </span>
            )}
            {needsEV && (
              <span className="px-2 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">
                ⚡ EV Charging
              </span>
            )}
            {needsCover && (
              <span className="px-2 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">
                🏠 Covered
              </span>
            )}
          </div>
        </div>

        {/* Result box */}
        {lastResult && (
          <div className={`
            rounded-xl p-4 mb-4 animate-pop opacity-0 border
            ${lastResult.type === 'success'
              ? 'bg-parking-greenDim border-parking-green/30'
              : lastResult.type === 'error'
              ? 'bg-parking-redDim border-parking-red/30'
              : 'bg-parking-accentDim border-parking-accent/30'
            }
          `}>
            <div className="flex items-start gap-2">
              <span className="text-xl">
                {lastResult.type === 'success' ? '✅' : lastResult.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <div>
                <p className={`font-display font-bold text-sm ${
                  lastResult.type === 'success' ? 'text-parking-green' :
                  lastResult.type === 'error' ? 'text-parking-red' : 'text-parking-accent'
                }`}>
                  {lastResult.message}
                </p>
                {lastResult.slot && lastResult.type === 'success' && (
                  <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                    <span className="px-2 py-0.5 rounded-full bg-parking-green/20 text-parking-green text-xs font-mono">
                      Slot: {lastResult.slot.slotNo}
                    </span>
                    {lastResult.slot.isCovered && (
                      <span className="px-2 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">
                        🏠 Covered
                      </span>
                    )}
                    {lastResult.slot.isEVCharging && (
                      <span className="px-2 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">
                        ⚡ EV
                      </span>
                    )}
                    {onViewSlot && (
                      <button
                        onClick={() => {
                          // find the latest slot object from slots array
                          const fresh = slots.find(s => s.id === lastResult.slot.id)
                          if (fresh) onViewSlot(fresh)
                        }}
                        className="px-2 py-0.5 rounded-full bg-parking-accentDim text-parking-accent text-xs font-mono border border-parking-accent/20 hover:brightness-110 transition-all"
                      >
                        📋 View Model
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handlePark}
          disabled={loading}
          className="
            w-full py-3.5 rounded-xl font-display font-bold text-base
            bg-parking-accent text-parking-bg glow-accent
            hover:brightness-110 active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 btn-press
          "
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-parking-bg/40 border-t-parking-bg rounded-full animate-spin" />
              Searching best slot...
            </span>
          ) : (
            '🚗 Park Vehicle'
          )}
        </button>
      </div>

      {/* ── Free a Slot ── */}
      <div className="glass border border-parking-border rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-parking-greenDim flex items-center justify-center">
            <span className="text-lg">🔓</span>
          </div>
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
              <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">
                Select Occupied Slot
              </label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="
                  w-full bg-parking-surface border border-parking-border rounded-xl
                  px-4 py-3 text-parking-text font-mono text-sm
                  focus:outline-none focus:border-parking-accent focus:ring-1 focus:ring-parking-accent/30
                  transition-all duration-200 appearance-none cursor-pointer
                "
              >
                <option value="">-- Select a slot --</option>
                {occupiedSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.slotNo} {s.isCovered ? '🏠' : '☁️'} {s.isEVCharging ? '⚡' : ''}
                  </option>
                ))}
              </select>
            </div>

            {freeResult && (
              <div className="rounded-xl p-3 mb-3 bg-parking-greenDim border border-parking-green/30 flex items-center gap-2 animate-pop opacity-0">
                <span>✅</span>
                <span className="text-parking-green text-sm font-body">Slot freed successfully!</span>
              </div>
            )}

            <button
              onClick={handleFree}
              disabled={!selectedSlot}
              className="
                w-full py-3.5 rounded-xl font-display font-bold text-base
                bg-parking-green text-parking-bg glow-green
                hover:brightness-110 active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 btn-press
              "
            >
              🔓 Free This Slot
            </button>
          </>
        )}
      </div>
    </div>
  )
}