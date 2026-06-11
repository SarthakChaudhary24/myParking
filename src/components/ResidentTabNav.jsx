import React from 'react'

const TABS = [
  { id: 'slots',  label: 'All Slots',    icon: '🅿️' },
  { id: 'data',   label: 'Data Model',   icon: '📋' },
  { id: 'park',   label: 'Park Vehicle', icon: '🚗' },
  { id: 'mypark', label: 'My Parking',   icon: '🔓' },
]

export default function ResidentTabNav({ activeTab, setActiveTab, sensorCount = 0 }) {
  return (
    <nav className="px-6 mb-6">
      <div className="flex gap-1 p-1 bg-parking-surface border border-parking-border rounded-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl
              font-body font-medium text-xs transition-all duration-200 btn-press
              ${activeTab === tab.id
                ? 'bg-parking-accent text-parking-bg shadow-lg'
                : 'text-parking-muted hover:text-parking-text hover:bg-parking-card'
              }
            `}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="hidden sm:inline truncate">{tab.label}</span>

            {/* Sensor alert dot on My Parking tab */}
            {tab.id === 'mypark' && sensorCount > 0 && (
              <span className={`
                absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full
                flex items-center justify-center text-[10px] font-black
                ${activeTab === tab.id ? 'bg-parking-bg text-parking-amber' : 'bg-parking-amber text-parking-bg'}
              `}>
                {sensorCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
