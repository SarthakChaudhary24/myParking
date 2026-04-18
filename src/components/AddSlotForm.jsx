import React, { useState } from 'react'

function Toggle({ checked, onChange, label, icon }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <span className="text-parking-text font-body text-sm">{label}</span>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          className="toggle-input sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          onClick={() => onChange(!checked)}
          className={`
            relative w-11 h-6 rounded-full cursor-pointer transition-all duration-200
            ${checked ? 'bg-parking-accent' : 'bg-parking-border'}
          `}
        >
          <div
            className={`
              absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200
              ${checked ? 'left-6' : 'left-1'}
            `}
          />
        </div>
      </div>
    </label>
  )
}

export default function AddSlotForm({ addSlot }) {
  const [slotNo, setSlotNo] = useState('')
  const [isCovered, setIsCovered] = useState(false)
  const [isEVCharging, setIsEVCharging] = useState(false)
  const [feedback, setFeedback] = useState(null) // { ok, message }
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    // Tiny delay for UX feel
    await new Promise((r) => setTimeout(r, 300))

    const result = await addSlot(slotNo, isCovered, isEVCharging)
    setFeedback(result)

    if (result.ok) {
      setSlotNo('')
      setIsCovered(false)
      setIsEVCharging(false)
    }

    setLoading(false)
  }

  return (
    <div className="px-6 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>
      <div className="glass border border-parking-border rounded-3xl p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-parking-accentDim flex items-center justify-center">
            <span className="text-parking-accent text-lg">➕</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-parking-text">Add New Slot</h2>
            <p className="text-parking-muted text-xs">Define a parking slot for the lot</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Slot number input */}
          <div>
            <label className="block text-xs text-parking-muted uppercase tracking-widest mb-2 font-mono">
              Slot Number *
            </label>
            <div className="relative">
              <input
                type="text"
                value={slotNo}
                onChange={(e) => setSlotNo(e.target.value.toUpperCase())}
                placeholder="e.g. A1, B3, 101"
                maxLength={6}
                className="
                  w-full bg-parking-surface border border-parking-border rounded-xl
                  px-4 py-3 text-parking-text font-mono text-sm
                  placeholder:text-parking-muted
                  focus:outline-none focus:border-parking-accent focus:ring-1 focus:ring-parking-accent/30
                  transition-all duration-200
                "
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-parking-muted text-xs font-mono">
                {slotNo.length}/6
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-parking-border" />

          {/* Toggles */}
          <div className="space-y-4">
            <label className="block text-xs text-parking-muted uppercase tracking-widest mb-1 font-mono">
              Features
            </label>
            <Toggle
              checked={isCovered}
              onChange={setIsCovered}
              label="Covered / Indoor Parking"
              icon="🏠"
            />
            <Toggle
              checked={isEVCharging}
              onChange={setIsEVCharging}
              label="EV Charging Station"
              icon="⚡"
            />
          </div>

          {/* Preview card */}
          <div className="rounded-xl border border-parking-border bg-parking-surface p-4">
            <p className="text-xs text-parking-muted uppercase tracking-wider mb-2 font-mono">Preview</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-parking-accent text-lg">
                {slotNo || '???'}
              </span>
              {isCovered && (
                <span className="px-2 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">
                  🏠 Covered
                </span>
              )}
              {isEVCharging && (
                <span className="px-2 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">
                  ⚡ EV
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-parking-greenDim text-parking-green text-xs font-mono">
                ✓ Available
              </span>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`
              rounded-xl p-3 flex items-center gap-2 text-sm animate-pop opacity-0
              ${feedback.ok
                ? 'bg-parking-greenDim text-parking-green border border-parking-green/30'
                : 'bg-parking-redDim text-parking-red border border-parking-red/30'
              }
            `}>
              <span>{feedback.ok ? '✅' : '❌'}</span>
              <span className="font-body">{feedback.message}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !slotNo.trim()}
            className="
              w-full py-3.5 rounded-xl font-display font-bold text-base
              bg-parking-accent text-parking-bg
              hover:brightness-110 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200 glow-accent btn-press
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-parking-bg/40 border-t-parking-bg rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              '+ Add Parking Slot'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}