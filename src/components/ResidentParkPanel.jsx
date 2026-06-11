import React, { useState } from 'react'
import { getTowerDistance, getDistanceBadgeColor } from '../utils/parkingLogic'

const API = import.meta.env.VITE_API_URL

export default function ResidentParkPanel({ mySlots, onFree, userTower, user, slots }) {
  const [freed, setFreed]           = useState(null)
  const [claiming, setClaiming]     = useState(null)  // slotId being claimed
  const [claimResult, setClaimResult] = useState(null)

  // Sensor-detected slots that haven't been claimed by anyone
  const sensorSlots = slots.filter(s => s.isOccupied && s.occupiedBy?.id === 'SENSOR')

  const handleFree = async (slotId) => {
    await onFree(slotId)
    setFreed(slotId)
    setTimeout(() => setFreed(null), 3000)
  }

  const handleClaim = async (slot) => {
    setClaiming(slot.id)
    await fetch(`${API}/slots/${slot.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        occupiedBy: { id: user.id, name: user.name, phone: user.phone },
      }),
    })
    window.dispatchEvent(new Event('parking-updated'))
    setClaiming(null)
    setClaimResult(slot.slotNo)
    setTimeout(() => setClaimResult(null), 4000)
  }

  return (
    <div className="px-6 animate-fade-up opacity-0 space-y-4" style={{ animationDelay: '0.05s' }}>

      {/* ── Sensor slots available to claim ── */}
      {sensorSlots.length > 0 && (
        <div className="glass border border-parking-amber/40 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-parking-amberDim flex items-center justify-center">
              <span className="text-lg animate-pulse">📡</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-parking-amber">
                Sensor Detected — Claim Your Slot
              </h2>
              <p className="text-parking-muted text-xs">
                Did you just park? Claim the slot to register it under your name.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {sensorSlots.map(slot => {
              const distInfo = userTower && slot.nearTowers
                ? getTowerDistance(userTower, slot.nearTowers)
                : null
              const badgeColor = distInfo ? getDistanceBadgeColor(distInfo.level) : ''

              return (
                <div key={slot.id}
                  className="rounded-2xl border border-parking-amber/30 bg-parking-amberDim/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Slot info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-parking-amberDim flex items-center justify-center text-sm font-mono font-black text-parking-amber shrink-0">
                        {slot.slotNo}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-black text-lg text-parking-text leading-none">
                          {slot.slotNo}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {slot.isCovered && (
                            <span className="px-1.5 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">🏠 Covered</span>
                          )}
                          {slot.isEVCharging && (
                            <span className="px-1.5 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">⚡ EV</span>
                          )}
                          {distInfo && (
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-mono border ${badgeColor}`}>
                              {distInfo.distance}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Claim button */}
                    <button
                      onClick={() => handleClaim(slot)}
                      disabled={claiming === slot.id}
                      className="shrink-0 px-4 py-2 rounded-xl font-display font-bold text-sm bg-parking-accent text-parking-bg glow-accent hover:brightness-110 active:scale-[0.98] disabled:opacity-40 transition-all btn-press"
                    >
                      {claiming === slot.id
                        ? <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border-2 border-parking-bg/40 border-t-parking-bg rounded-full animate-spin" />
                            Claiming...
                          </span>
                        : '⚡ Claim'
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {claimResult && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-parking-greenDim border border-parking-green/30 animate-pop opacity-0">
              <span>✅</span>
              <p className="text-xs font-mono text-parking-green">
                Slot {claimResult} is now registered under your name!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── My occupied slots ── */}
      <div className="glass border border-parking-border rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-parking-greenDim flex items-center justify-center">
            <span className="text-lg">🔓</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-parking-text">My Parking</h2>
            <p className="text-parking-muted text-xs">Slots currently occupied by you</p>
          </div>
        </div>

        {mySlots.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-parking-surface border border-parking-border">
            <p className="text-4xl mb-3">🅿️</p>
            <p className="font-display font-bold text-parking-text">No active parking</p>
            <p className="text-parking-muted text-sm mt-1">You don't have any slot currently occupied.</p>
            <p className="text-parking-muted text-xs font-mono mt-2">
              {sensorSlots.length > 0
                ? 'Did you park? Claim a sensor-detected slot above.'
                : 'Use "Park Vehicle" tab or ask the guard.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mySlots.map(slot => (
              <div key={slot.id} className="rounded-2xl border border-parking-red/40 bg-parking-redDim/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-parking-redDim text-parking-red flex items-center justify-center text-sm">🚗</div>
                    <div>
                      <p className="font-display font-black text-xl text-parking-text">{slot.slotNo}</p>
                      <p className="text-xs font-mono text-parking-red">Occupied — Your Vehicle</p>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-parking-red glow-red" />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {slot.isCovered
                    ? <span className="px-2 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">🏠 Covered</span>
                    : <span className="px-2 py-0.5 rounded-full bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border">☁️ Open</span>
                  }
                  {slot.isEVCharging
                    ? <span className="px-2 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">⚡ EV</span>
                    : <span className="px-2 py-0.5 rounded-full bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border">⛽ Fuel</span>
                  }
                </div>

                {/* Distance info */}
                {userTower && slot.nearTowers && (() => {
                  const distInfo = getTowerDistance(userTower, slot.nearTowers)
                  const badgeColor = getDistanceBadgeColor(distInfo.level)
                  return (
                    <div className="mb-3 p-2.5 rounded-lg bg-parking-surface border border-parking-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-parking-muted font-mono">Distance from Tower {userTower}:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${badgeColor}`}>
                          {distInfo.distance} ({distInfo.meters})
                        </span>
                      </div>
                    </div>
                  )
                })()}

                {freed === slot.id ? (
                  <div className="rounded-xl p-3 bg-parking-greenDim border border-parking-green/30 text-parking-green text-xs font-mono">✅ Slot freed!</div>
                ) : (
                  <button onClick={() => handleFree(slot.id)}
                    className="w-full py-2.5 rounded-xl font-display font-bold text-sm bg-parking-greenDim text-parking-green border border-parking-green/30 hover:brightness-110 active:scale-[0.98] transition-all">
                    🔓 Free This Slot
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
