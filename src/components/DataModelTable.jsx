import React, { useState } from 'react'
import DataModelBadge from './DataModelBadge'

/**
 * DataModelTable
 * Shows ALL slots in a table with exact assignment data model field columns:
 *   slotNo | isCovered | isEVCharging | isOccupied
 *
 * Props:
 *   slots       — array of slot objects
 *   onViewSlot  — (slot) => void — opens detail modal
 */
export default function DataModelTable({ slots, onViewSlot }) {
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
    // For slotNo: try numeric sort first
    if (sortField === 'slotNo') {
      const nA = parseInt(valA); const nB = parseInt(valB)
      if (!isNaN(nA) && !isNaN(nB)) { valA = nA; valB = nB }
    }
    // Boolean: true > false
    if (typeof valA === 'boolean') { valA = valA ? 1 : 0; valB = valB ? 1 : 0 }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1
    if (valA > valB) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const COLUMNS = [
    { field: 'slotNo',      label: 'slotNo',      type: 'string'  },
    { field: 'isCovered',   label: 'isCovered',   type: 'boolean' },
    { field: 'isEVCharging',label: 'isEVCharging', type: 'boolean' },
    { field: 'isOccupied',  label: 'isOccupied',  type: 'boolean' },
  ]

  return (
    <div className="px-6 animate-fade-up opacity-0" style={{ animationDelay: '0.05s' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-parking-text text-lg">Data Model View</h2>
          <p className="text-parking-muted text-xs font-mono mt-0.5">
            All {slots.length} slots — exact schema fields
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-parking-card border border-parking-border">
          <span className="w-1.5 h-1.5 rounded-full bg-parking-accent" />
          <span className="text-xs text-parking-muted font-mono">
            {slots.filter(s => !s.isOccupied).length} free
          </span>
        </div>
      </div>

      {/* Schema legend */}
      <div className="rounded-xl bg-parking-surface border border-parking-border p-3 mb-4">
        <p className="text-xs font-mono text-parking-muted mb-2 uppercase tracking-wider">Schema</p>
        <pre className="text-xs font-mono text-parking-accent/80 leading-relaxed">
{`{
  slotNo:      string,   // Unique slot identifier
  isCovered:   boolean,  // true = indoor/covered
  isEVCharging: boolean, // true = has EV charger
  isOccupied:  boolean   // true = vehicle parked
}`}
        </pre>
      </div>

      {/* Table */}
      {slots.length === 0 ? (
        <div className="text-center py-16 glass border border-parking-border rounded-3xl">
          <p className="text-4xl mb-3">🅿️</p>
          <p className="font-display font-bold text-parking-text">No slots yet</p>
          <p className="text-parking-muted text-sm mt-1">Switch to "Add Slot" to create your first slot</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-parking-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
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
                        {col.field}
                        <span className="text-parking-border">
                          {sortField === col.field
                            ? sortDir === 'asc' ? '↑' : '↓'
                            : '↕'}
                        </span>
                      </div>
                      <div className="text-parking-border font-mono text-xs normal-case tracking-normal font-normal">
                        {col.type}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-mono text-parking-muted uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="bg-parking-card divide-y divide-parking-border">
                {sorted.map((slot) => (
                  <DataModelBadge
                    key={slot.id}
                    slot={{ ...slot, _onView: onViewSlot }}
                    mode="table"
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer with row count */}
          <div className="bg-parking-surface border-t border-parking-border px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-mono text-parking-muted">{sorted.length} records</span>
            <div className="flex items-center gap-3 text-xs font-mono text-parking-muted">
              <span>
                <span className="text-parking-green">●</span> Available: {slots.filter(s => !s.isOccupied).length}
              </span>
              <span>
                <span className="text-parking-red">●</span> Occupied: {slots.filter(s => s.isOccupied).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}