import React, { useState } from 'react'
import { ParkVehicle, sortSlots, getTowerDistance, getDistanceBadgeColor } from '../utils/parkingLogic'

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

export default function ResidentSelfParkPanel({ user, slots }) {
  const [needsEV, setNeedsEV]       = useState(false)
  const [needsCover, setNeedsCover] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)

  const handlePark = async () => {
    setLoading(true); setResult(null)
    await new Promise(r => setTimeout(r, 400))
    
    const found = ParkVehicle(sortSlots(slots), needsEV, needsCover, user.tower)
    
    if (found.slot) {
      await fetch(`${API}/slots/${found.slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOccupied: true,
          occupiedBy: { id: user.id, name: user.name, phone: user.phone }
        }),
      })
      window.dispatchEvent(new Event('parking-updated'))
      setResult({ type: 'success', message: found.message, slot: found.slot })
    } else {
      setResult({ type: 'error', message: found.message })
    }
    setLoading(false)
  }

  return (
    <div className="px-6 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>
      <div className="glass border border-parking-border rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-parking-accentDim flex items-center justify-center"><span className="text-lg">🚗</span></div>
          <div>
            <h2 className="font-display font-bold text-lg text-parking-text">Park My Vehicle</h2>
            <p className="text-parking-muted text-xs">Find a slot near Tower {user.tower || '?'}</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <ToggleCard checked={needsEV}    onChange={setNeedsEV}    icon="⚡" title="EV Charging Required"  description="Find a slot with EV charger"    type="ev"    />
          <ToggleCard checked={needsCover} onChange={setNeedsCover} icon="🏠" title="Covered Spot Required" description="Find a covered/indoor slot"      type="cover" />
        </div>

        {result && (
          <div className={`rounded-xl p-4 mb-4 border ${result.type === 'success' ? 'bg-parking-greenDim border-parking-green/30' : 'bg-parking-redDim border-parking-red/30'}`}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{result.type === 'success' ? '✅' : '❌'}</span>
              <div className="flex-1">
                <p className={`font-display font-bold text-sm ${result.type === 'success' ? 'text-parking-green' : 'text-parking-red'}`}>{result.message}</p>
                {result.slot && (
                  <>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {result.slot.isCovered && <span className="px-2 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">🏠 Covered</span>}
                      {result.slot.isEVCharging && <span className="px-2 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">⚡ EV</span>}
                    </div>
                    {user.tower && result.slot.nearTowers && (() => {
                      const distInfo = getTowerDistance(user.tower, result.slot.nearTowers)
                      const badgeColor = getDistanceBadgeColor(distInfo.level)
                      return (
                        <div className="mt-3 p-2 rounded-lg bg-parking-surface border border-parking-border">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-parking-muted font-mono">Distance:</span>
                            <span className={`px-2 py-0.5 rounded-full font-mono font-bold border ${badgeColor}`}>
                              {distInfo.distance} ({distInfo.meters})
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </>
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
          ) : '🚗 Park My Vehicle'}
        </button>
      </div>
    </div>
  )
}
