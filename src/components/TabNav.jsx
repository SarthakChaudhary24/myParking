import React from 'react'

const TABS = [
  { id: 'slots',  label: 'All Slots',    icon: '🅿️' },
  { id: 'data',   label: 'Data Model',   icon: '📋' },
  { id: 'add',    label: 'Add Slot',     icon: '➕' },
  { id: 'park',   label: 'Park / Free',  icon: '🚗' },
]

export default function TabNav({ activeTab, setActiveTab }) {
  return (
    <nav className="px-6 mb-6">
      <div className="flex gap-1 p-1 bg-parking-surface border border-parking-border rounded-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl
              font-body font-medium text-xs transition-all duration-200 btn-press
              ${activeTab === tab.id
                ? 'bg-parking-accent text-parking-bg shadow-lg'
                : 'text-parking-muted hover:text-parking-text hover:bg-parking-card'
              }
            `}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="hidden sm:inline truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}