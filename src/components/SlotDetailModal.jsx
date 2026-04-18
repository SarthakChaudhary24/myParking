import React, { useState, useEffect } from 'react'
import DataModelBadge from './DataModelBadge'
import { getTowerDistance, getDistanceBadgeColor } from '../utils/parkingLogic'

/**
 * SlotDetailModal
 * Shows a modal with full slot data model view + inline edit toggles
 *
 * Props:
 *   slot        — the slot object to display
 *   onClose     — close handler
 *   onUpdate    — (slotId, changes) => void — update isCovered / isEVCharging
 *   onRemove    — (slotId) => void — free vehicle
 *   onDelete    — (slotId) => void — delete slot
 *   viewerRole  — 'guard' | 'resident' | 'admin'
 *   userTower   — viewer's tower (for distance calculation)
 */
export default function SlotDetailModal({ slot, onClose, onUpdate, onRemove, onDelete, viewerRole, userTower }) {
  const [isCovered, setIsCovered] = useState(slot.isCovered)
  const [isEVCharging, setIsEVCharging] = useState(slot.isEVCharging)
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const hasChanges = isCovered !== slot.isCovered || isEVCharging !== slot.isEVCharging

  const handleSave = () => {
    onUpdate(slot.id, { isCovered, isEVCharging })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleRemove = () => {
    onRemove(slot.id)
    onClose()
  }

  const handleDelete = () => {
    onDelete(slot.id)
    onClose()
  }

  // Live preview of edited slot for DataModelBadge
  const previewSlot = { ...slot, isCovered, isEVCharging }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal panel */}
      <div className="
        w-full max-w-md bg-parking-card border border-parking-border rounded-3xl
        shadow-2xl animate-pop opacity-0 overflow-hidden
      ">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-parking-border bg-parking-surface">
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-black
              ${slot.isOccupied ? 'bg-parking-redDim text-parking-red' : 'bg-parking-accentDim text-parking-accent'}
            `}>
              {slot.isOccupied ? '🚗' : '🅿️'}
            </div>
            <div>
              <p className="font-display font-black text-parking-text text-lg leading-none">
                Slot {slot.slotNo}
              </p>
              <p className={`text-xs font-mono mt-0.5 ${slot.isOccupied ? 'text-parking-red' : 'text-parking-green'}`}>
                {slot.isOccupied ? '● Occupied' : '● Available'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="
              w-8 h-8 rounded-full bg-parking-border text-parking-muted
              hover:bg-parking-red/20 hover:text-parking-red
              flex items-center justify-center text-sm transition-all duration-150
            "
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* ── Distance Info (for residents) ── */}
          {userTower && slot.nearTowers && (
            <section>
              <p className="text-xs text-parking-muted font-mono uppercase tracking-widest mb-2">Distance from Your Tower</p>
              {(() => {
                const distInfo = getTowerDistance(userTower, slot.nearTowers)
                const badgeColor = getDistanceBadgeColor(distInfo.level)
                return (
                  <div className="rounded-xl border border-parking-border bg-parking-surface p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-display font-bold text-parking-text">{distInfo.distance}</p>
                        <p className="text-xs font-mono text-parking-muted mt-0.5">Approx. {distInfo.meters}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${badgeColor}`}>
                        Tower {userTower} → {slot.nearTowers.join(', ')}
                      </span>
                    </div>
                  </div>
                )
              })()}
            </section>
          )}

          {/* ── Occupant Info ── */}
          {slot.isOccupied && slot.occupiedBy && (
            <section>
              <p className="text-xs text-parking-muted font-mono uppercase tracking-widest mb-2">Occupied By</p>
              <div className="rounded-xl border border-parking-border bg-parking-surface p-4 space-y-1">
                <p className="text-sm font-display font-bold text-parking-text">{slot.occupiedBy.name}</p>
                {viewerRole === 'guard' && slot.occupiedBy.phone && (
                  <p className="text-xs font-mono text-parking-accent">📞 {slot.occupiedBy.phone}</p>
                )}
                {viewerRole !== 'guard' && (
                  <p className="text-xs font-mono text-parking-muted">Contact info hidden</p>
                )}
              </div>
            </section>
          )}

          {/* ── Data Model View ── */}
          <section>
            <p className="text-xs text-parking-muted font-mono uppercase tracking-widest mb-2">
              Data Model Fields
            </p>
            <DataModelBadge slot={previewSlot} mode="card" />
          </section>

          {/* ── Edit Features — Admin only ── */}
          {onUpdate && (
          <section>
            <p className="text-xs text-parking-muted font-mono uppercase tracking-widest mb-3">
              Edit Features
            </p>
            <div className="space-y-2">
              <EditToggle
                label="isCovered"
                description="Covered / Indoor parking spot"
                icon="🏠"
                checked={isCovered}
                onChange={setIsCovered}
                activeColor="parking-purple"
              />
              <EditToggle
                label="isEVCharging"
                description="EV charging station available"
                icon="⚡"
                checked={isEVCharging}
                onChange={setIsEVCharging}
                activeColor="parking-amber"
              />
            </div>

            {hasChanges && (
              <button
                onClick={handleSave}
                className="
                  mt-3 w-full py-2.5 rounded-xl font-display font-bold text-sm
                  bg-parking-accent text-parking-bg
                  hover:brightness-110 active:scale-[0.98] transition-all duration-150
                "
              >
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            )}
          </section>
          )}

          {/* ── Actions ── */}
          {(onRemove || onDelete) && (
          <section className="border-t border-parking-border pt-4">
            <p className="text-xs text-parking-muted font-mono uppercase tracking-widest mb-3">
              Actions
            </p>

            <div className="space-y-2">
              {/* Free vehicle (only if occupied) */}
              {slot.isOccupied && (
                <button
                  onClick={handleRemove}
                  className="
                    w-full py-2.5 rounded-xl font-display font-bold text-sm
                    bg-parking-greenDim text-parking-green border border-parking-green/30
                    hover:brightness-110 active:scale-[0.98] transition-all duration-150
                  "
                >
                  🔓 Free This Slot
                </button>
              )}

              {/* Delete slot */}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="
                    w-full py-2.5 rounded-xl font-display font-bold text-sm
                    bg-parking-surface text-parking-muted border border-parking-border
                    hover:border-parking-red/50 hover:text-parking-red
                    active:scale-[0.98] transition-all duration-150
                  "
                >
                  🗑️ Delete Slot
                </button>
              ) : (
                <div className="rounded-xl border border-parking-red/30 bg-parking-redDim p-3">
                  <p className="text-parking-red text-xs font-mono mb-2 text-center">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="flex-1 py-2 rounded-lg bg-parking-red text-parking-bg font-bold text-sm active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 rounded-lg bg-parking-surface text-parking-muted border border-parking-border text-sm active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Sub-component: EditToggle ─────────────────────────────────────
function EditToggle({ label, description, icon, checked, onChange }) {
  return (
    <div
      className="
        flex items-center justify-between p-3 rounded-xl border border-parking-border
        bg-parking-surface cursor-pointer hover:border-parking-muted transition-all duration-150 select-none
      "
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <p className="text-xs font-mono text-parking-text">{label}</p>
          <p className="text-xs text-parking-muted">{description}</p>
        </div>
      </div>
      {/* Toggle pill */}
      <div className={`
        relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0
        ${checked ? 'bg-parking-accent' : 'bg-parking-border'}
      `}>
        <div className={`
          absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200
          ${checked ? 'left-5' : 'left-0.5'}
        `} />
      </div>
    </div>
  )
}