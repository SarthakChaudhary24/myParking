import React from 'react'

/**
 * DataModelBadge
 * Shows the exact data model fields for a slot as per the assignment spec:
 *   slotNo | isCovered | isEVCharging | isOccupied
 *
 * Props:
 *   slot   — the slot object
 *   mode   — 'inline' (compact row) | 'card' (full card layout) | 'table' (table row)
 */
export default function DataModelBadge({ slot, mode = 'inline' }) {
  if (!slot) return null

  const fields = [
    {
      key: 'slotNo',
      label: 'slotNo',
      value: slot.slotNo,
      type: 'string',
      display: slot.slotNo,
      color: 'text-parking-accent',
      bg: 'bg-parking-accentDim',
    },
    {
      key: 'isCovered',
      label: 'isCovered',
      value: slot.isCovered,
      type: 'boolean',
      display: String(slot.isCovered),
      color: slot.isCovered ? 'text-parking-purple' : 'text-parking-muted',
      bg: slot.isCovered ? 'bg-parking-purpleDim' : 'bg-parking-surface',
    },
    {
      key: 'isEVCharging',
      label: 'isEVCharging',
      value: slot.isEVCharging,
      type: 'boolean',
      display: String(slot.isEVCharging),
      color: slot.isEVCharging ? 'text-parking-amber' : 'text-parking-muted',
      bg: slot.isEVCharging ? 'bg-parking-amberDim' : 'bg-parking-surface',
    },
    {
      key: 'isOccupied',
      label: 'isOccupied',
      value: slot.isOccupied,
      type: 'boolean',
      display: String(slot.isOccupied),
      color: slot.isOccupied ? 'text-parking-red' : 'text-parking-green',
      bg: slot.isOccupied ? 'bg-parking-redDim' : 'bg-parking-greenDim',
    },
  ]

  if (mode === 'inline') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {fields.map((f) => (
          <span
            key={f.key}
            className={`
              px-2 py-0.5 rounded-md text-xs font-mono border border-parking-border
              ${f.bg} ${f.color}
            `}
          >
            <span className="opacity-60">{f.label}:</span>{' '}
            <span className="font-bold">{f.display}</span>
          </span>
        ))}
      </div>
    )
  }

  if (mode === 'card') {
    return (
      <div className="rounded-xl border border-parking-border bg-parking-surface overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2 border-b border-parking-border bg-parking-card flex items-center justify-between">
          <span className="text-xs font-mono text-parking-muted uppercase tracking-wider">
            Data Model — Slot Object
          </span>
          <span className="text-xs font-mono text-parking-accent bg-parking-accentDim px-2 py-0.5 rounded">
            {slot.slotNo}
          </span>
        </div>

        {/* Fields */}
        <div className="divide-y divide-parking-border">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-parking-border" />
                <span className="text-xs font-mono text-parking-text">{f.label}</span>
                <span className="text-xs text-parking-muted">
                  ({f.type})
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${f.bg} ${f.color}`}>
                {f.type === 'string' ? `"${f.display}"` : f.display}
              </span>
            </div>
          ))}
        </div>

        {/* JSON preview */}
        <div className="px-4 py-3 bg-parking-bg border-t border-parking-border">
          <p className="text-xs text-parking-muted font-mono mb-1">JSON</p>
          <pre className="text-xs font-mono text-parking-accent/80 leading-relaxed overflow-x-auto">
{`{
  "slotNo": "${slot.slotNo}",
  "isCovered": ${slot.isCovered},
  "isEVCharging": ${slot.isEVCharging},
  "isOccupied": ${slot.isOccupied}
}`}
          </pre>
        </div>
      </div>
    )
  }

  if (mode === 'table') {
    return (
      <tr className="border-b border-parking-border hover:bg-parking-card/50 transition-colors">
        <td className="px-4 py-3 font-mono font-bold text-parking-accent text-sm">{slot.slotNo}</td>
        <td className="px-4 py-3">
          <BoolBadge value={slot.isCovered} trueColor="text-parking-purple" trueBg="bg-parking-purpleDim" />
        </td>
        <td className="px-4 py-3">
          <BoolBadge value={slot.isEVCharging} trueColor="text-parking-amber" trueBg="bg-parking-amberDim" />
        </td>
        <td className="px-4 py-3">
          <BoolBadge
            value={slot.isOccupied}
            trueColor="text-parking-red"
            trueBg="bg-parking-redDim"
            falseColor="text-parking-green"
            falseBg="bg-parking-greenDim"
          />
        </td>
        <td className="px-4 py-3">
          {slot._onView && (
            <button
              onClick={() => slot._onView(slot)}
              className="text-xs font-mono text-parking-accent hover:underline"
            >
              View →
            </button>
          )}
        </td>
      </tr>
    )
  }

  return null
}

function BoolBadge({
  value,
  trueColor = 'text-parking-green',
  trueBg = 'bg-parking-greenDim',
  falseColor = 'text-parking-muted',
  falseBg = 'bg-parking-surface',
}) {
  return (
    <span className={`
      px-2 py-0.5 rounded-md text-xs font-mono font-bold border border-parking-border
      ${value ? `${trueBg} ${trueColor}` : `${falseBg} ${falseColor}`}
    `}>
      {String(value)}
    </span>
  )
}