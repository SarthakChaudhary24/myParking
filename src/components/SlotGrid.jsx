import React, { useState } from 'react'

function SlotCard({ slot, onRemove, onViewSlot, index }) {
  const delay = Math.min(index * 0.04, 0.4)

  return (
    <div
      className={`
        slot-card glass border rounded-2xl p-4 animate-fade-up opacity-0
        ${slot.isOccupied
          ? 'border-parking-red/40 bg-parking-redDim/20'
          : 'border-parking-border hover:border-parking-accent/40'
        }
      `}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Slot number + status dot */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold
            ${slot.isOccupied ? 'bg-parking-redDim text-parking-red' : 'bg-parking-accentDim text-parking-accent'}
          `}>
            {slot.isOccupied ? '🚗' : '🅿️'}
          </div>
          <div>
            <p className="font-display font-black text-xl text-parking-text leading-none">
              {slot.slotNo}
            </p>
            <p className={`text-xs font-mono mt-0.5 ${slot.isOccupied ? 'text-parking-red' : 'text-parking-green'}`}>
              {slot.isOccupied ? 'Occupied' : 'Available'}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className={`
          w-2.5 h-2.5 rounded-full mt-1
          ${slot.isOccupied ? 'bg-parking-red glow-red' : 'bg-parking-green glow-green animate-pulse'}
        `} />
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {slot.isCovered ? (
          <span className="px-2 py-0.5 rounded-full bg-parking-purpleDim text-parking-purple text-xs font-mono">
            🏠 Covered
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border">
            ☁️ Open
          </span>
        )}
        {slot.isEVCharging ? (
          <span className="px-2 py-0.5 rounded-full bg-parking-amberDim text-parking-amber text-xs font-mono">
            ⚡ EV
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-parking-surface text-parking-muted text-xs font-mono border border-parking-border">
            ⛽ Fuel
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 border-t border-parking-border pt-3">
        <button
          onClick={() => onViewSlot(slot)}
          className="w-full py-1.5 rounded-lg bg-parking-accentDim text-parking-accent text-xs font-mono font-medium border border-parking-accent/20 hover:brightness-110 active:scale-95 transition-all duration-150"
        >
          📋 View Details
        </button>
        {slot.isOccupied && (
          <button
            onClick={() => onRemove(slot.id)}
            className="w-full py-1.5 rounded-lg bg-parking-greenDim text-parking-green text-xs font-mono font-medium hover:brightness-110 active:scale-95 transition-all duration-150"
          >
            Free Slot
          </button>
        )}
        {slot.isOccupied && slot.occupiedBy && (
          <p className="text-xs font-mono text-parking-muted text-center">
            {slot.occupiedBy.name}{slot.occupiedBy.phone ? ` · ${slot.occupiedBy.phone}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

export default function SlotGrid({ slots, onRemove, onViewSlot }) {
  const [filter, setFilter] = useState('all') // 'all' | 'available' | 'occupied' | 'ev' | 'covered'

  const filtered = slots.filter((s) => {
    if (filter === 'available') return !s.isOccupied
    if (filter === 'occupied') return s.isOccupied
    if (filter === 'ev') return s.isEVCharging
    if (filter === 'covered') return s.isCovered
    return true
  })

  const filterBtns = [
    { id: 'all', label: 'All' },
    { id: 'available', label: '✅ Free' },
    { id: 'occupied', label: '🚗 Busy' },
    { id: 'ev', label: '⚡ EV' },
    { id: 'covered', label: '🏠 Covered' },
  ]

  return (
    <div className="px-6 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {filterBtns.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`
              shrink-0 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 btn-press
              ${filter === btn.id
                ? 'bg-parking-accent text-parking-bg font-bold'
                : 'bg-parking-card border border-parking-border text-parking-muted hover:text-parking-text'
              }
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-parking-muted font-mono mb-4">
        Showing {filtered.length} of {slots.length} slots
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 glass border border-parking-border rounded-3xl">
          <div className="text-5xl mb-3">🅿️</div>
          <p className="font-display font-bold text-parking-text text-lg">No slots found</p>
          <p className="text-parking-muted text-sm mt-1">
            {slots.length === 0 ? 'Add your first parking slot' : 'Try a different filter'}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((slot, i) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            index={i}
            onRemove={onRemove}
            onViewSlot={onViewSlot}
          />
        ))}
      </div>
    </div>
  )
}