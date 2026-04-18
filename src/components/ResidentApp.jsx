import React, { useState } from 'react'
import { useParking } from '../hooks/useParking'
import Header from './Header'
import ResidentTabNav from './ResidentTabNav'
import ResidentSlotGrid from './ResidentSlotGrid'
import ResidentSelfParkPanel from './ResidentSelfParkPanel'
import ResidentParkPanel from './ResidentParkPanel'
import ResidentDataTable from './ResidentDataTable'

export default function ResidentApp({ user, onLogout }) {
  const { slots, activeTab, setActiveTab } = useParking()

  // Only slots occupied by this resident
  const mySlots = slots.filter(s => s.isOccupied && s.occupiedBy?.id === user.id)

  const freeMySlot = async (slotId) => {
    await fetch(`http://localhost:3001/api/slots/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOccupied: false, occupiedBy: null }),
    })
    window.dispatchEvent(new Event('parking-updated'))
  }

  return (
    <div className="min-h-screen bg-parking-bg grid-bg noise-bg relative">
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6ee7f7, transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

      <div className="max-w-6xl mx-auto pb-12 relative z-10">
        <Header slots={slots} onLogout={onLogout} userName={user.name} userRole="Resident" />
        <ResidentTabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div key={activeTab}>
          {activeTab === 'slots' && (
            <ResidentSlotGrid slots={slots} mySlots={mySlots} onFree={freeMySlot} />
          )}
          {activeTab === 'data' && (
            <ResidentDataTable slots={slots} />
          )}
          {activeTab === 'park' && (
            <ResidentSelfParkPanel user={user} slots={slots} />
          )}
          {activeTab === 'mypark' && (
            <ResidentParkPanel mySlots={mySlots} onFree={freeMySlot} userTower={user.tower} />
          )}
        </div>

        <footer className="text-center mt-10 px-6">
          <p className="text-parking-muted text-xs font-mono">myParking v1.0 — Logged in as Resident</p>
          <p className="text-parking-border text-xs font-mono mt-3">Built with ❤️ by Sarthak</p>
        </footer>
      </div>
    </div>
  )
}
