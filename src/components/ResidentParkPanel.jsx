import React, { useState } from 'react'
import { getTowerDistance, getDistanceBadgeColor } from '../utils/parkingLogic'

export default function ResidentParkPanel({ mySlots, onFree, userTower }) {
  const [freed, setFreed] = useState(null)

  const handleFree = async (slotId) => {
    await onFree(slotId)
    setFreed(slotId)
    setTimeout(() => setFreed(null), 3000)
  }

  return (
    <div className="px-6 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>
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
            <p className="text-parking-muted text-xs font-mono mt-2">Ask the guard to park your vehicle.</p>
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
