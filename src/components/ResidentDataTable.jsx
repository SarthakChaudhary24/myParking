import React, { useState } from 'react'

function FriendlyBadge({ value, trueLabel, falseLabel, trueColor, trueBg, falseColor, falseBg }) {
  return (
    <span className={`
      px-2 py-0.5 rounded-md text-xs font-mono font-bold border border-parking-border
      ${value
        ? `${trueBg} ${trueColor}`
        : `${falseBg || 'bg-parking-surface'} ${falseColor || 'text-parking-muted'}`
      }
    `}>
      {value ? trueLabel : falseLabel}
    </span>
  )
}

export default function ResidentDataTable({ slots }) {
  const [sortField, setSortField] = useState('slotNo')
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = [...slots].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    if (sortField === 'slotNo') {
      const nA = parseInt(valA); const nB = parseInt(valB)
      if (!isNaN(nA) && !isNaN(nB)) { valA = nA; valB = nB }
    }
    if (typeof valA === 'boolean') { valA = valA ? 1 : 0; valB = valB ? 1 : 0 }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const COLUMNS = [
    { field: 'slotNo',       label: 'Slot'     },
    { field: 'isCovered',    label: 'Covered'  },
    { field: 'isEVCharging', label: 'EV'       },
    { field: 'isOccupied',   label: 'Status'   },
  ]

  return (
    <div className="px-6 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-parking-text text-lg">Parking Overview</h2>
          <p className="text-parking-muted text-xs font-mono mt-0.5">
            All {slots.length} slots
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-parking-card border border-parking-border">
          <span className="w-1.5 h-1.5 rounded-full bg-parking-accent" />
          <span className="text-xs text-parking-muted font-mono">
            {slots.filter(s => !s.isOccupied).length} free
          </span>
        </div>
      </div>

      {/* Table */}
      {slots.length === 0 ? (
        <div className="text-center py-16 glass border border-parking-border rounded-3xl">
          <p className="text-4xl mb-3">🅿️</p>
          <p className="font-display font-bold text-parking-text">No slots available</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-parking-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-parking-surface border-b border-parking-border">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="
                        px-4 py-3 text-left text-xs font-mono text-parking-muted
                        uppercase tracking-wider cursor-pointer
                        hover:text-parking-accent transition-colors select-none
                      "
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <span className="text-parking-border">
                          {sortField === col.field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-parking-card divide-y divide-parking-border">
                {sorted.map((slot) => (
                  <tr key={slot.id} className="border-b border-parking-border hover:bg-parking-card/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-parking-accent text-sm">{slot.slotNo}</td>
                    <td className="px-4 py-3">
                      <FriendlyBadge
                        value={slot.isCovered}
                        trueLabel="Yes" falseLabel="No"
                        trueColor="text-parking-purple" trueBg="bg-parking-purpleDim"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FriendlyBadge
                        value={slot.isEVCharging}
                        trueLabel="Yes" falseLabel="No"
                        trueColor="text-parking-amber" trueBg="bg-parking-amberDim"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <FriendlyBadge
                        value={slot.isOccupied}
                        trueLabel="Occupied" falseLabel="Free"
                        trueColor="text-parking-red" trueBg="bg-parking-redDim"
                        falseColor="text-parking-green" falseBg="bg-parking-greenDim"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-parking-surface border-t border-parking-border px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-mono text-parking-muted">{sorted.length} slots</span>
            <div className="flex items-center gap-3 text-xs font-mono text-parking-muted">
              <span><span className="text-parking-green">●</span> Free: {slots.filter(s => !s.isOccupied).length}</span>
              <span><span className="text-parking-red">●</span> Occupied: {slots.filter(s => s.isOccupied).length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
