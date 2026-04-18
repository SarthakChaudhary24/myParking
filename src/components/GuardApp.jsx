import React, { useState } from 'react'
import { useParking } from '../hooks/useParking'
import Header from './Header'
import GuardTabNav from './GuardTabNav'
import SlotGrid from './SlotGrid'
import GuardParkPanel from './GuardParkPanel'
import DataModelTable from './DataModelTable'
import SlotDetailModal from './SlotDetailModal'

export default function GuardApp({ user, onLogout }) {
  const {
    slots,
    activeTab,
    setActiveTab,
    removeVehicle,
  } = useParking()

  const [selectedSlotId, setSelectedSlotId] = useState(null)

  const modalSlot = selectedSlotId
    ? slots.find((s) => s.id === selectedSlotId) ?? null
    : null

  const openModal = (slot) => setSelectedSlotId(slot.id)
  const closeModal = () => setSelectedSlotId(null)

  return (
    <div className="min-h-screen bg-parking-bg grid-bg noise-bg relative">
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6ee7f7, transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

      <div className="max-w-6xl mx-auto pb-12 relative z-10">
        <Header slots={slots} onLogout={onLogout} userName={user.name} userRole="Guard" />
        <GuardTabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div key={activeTab}>
          {activeTab === 'slots' && (
            <SlotGrid
              slots={slots}
              onRemove={removeVehicle}
              onViewSlot={openModal}
            />
          )}
          {activeTab === 'data' && (
            <DataModelTable slots={slots} onViewSlot={openModal} />
          )}
          {activeTab === 'park' && (
            <GuardParkPanel slots={slots} onRemove={removeVehicle} />
          )}
        </div>

        <footer className="text-center mt-10 px-6">
          <p className="text-parking-muted text-xs font-mono">myParking v1.0 — Logged in as Guard</p>
          <p className="text-parking-border text-xs font-mono mt-3">Built with ❤️ by Sarthak</p>
        </footer>
      </div>

      {modalSlot && (
        <SlotDetailModal
          slot={modalSlot}
          onClose={closeModal}
          viewerRole="guard"
          userTower={null}
        />
      )}
    </div>
  )
}
