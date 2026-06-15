import { useState, useEffect, useCallback } from 'react'
import { sortSlots, isSlotNumberTaken } from '../utils/parkingLogic'

const API      = `${import.meta.env.VITE_API_URL}/slots`
const EVENTS   = `${import.meta.env.VITE_API_URL}/events`

export function useParking() {
  const [slots, setSlots] = useState([])
  const [activeTab, setActiveTab] = useState('slots')

  useEffect(() => {
    // Initial load
    const load = () => {
      fetch(API)
        .then(r => r.json())
        .then(data => setSlots(data))
        .catch(() => console.error('Could not connect to myParking server. Is it running?'))
    }
    load()

    // SSE — receive server-push updates (sensor, guard actions, etc.)
    const es = new EventSource(EVENTS)
    es.addEventListener('slots-updated', load)
    es.onerror = () => {
      // SSE dropped — fall back to polling every 5s until reconnected
      // EventSource reconnects automatically; polling is just a safety net
    }

    // Also keep the local window event for same-tab optimistic updates
    window.addEventListener('parking-updated', load)

    return () => {
      es.close()
      window.removeEventListener('parking-updated', load)
    }
  }, [])

  // Add a new slot
  const addSlot = useCallback(async (slotNo, isCovered, isEVCharging) => {
    const trimmed = slotNo.trim().toUpperCase()
    if (!trimmed) return { ok: false, message: 'Slot number cannot be empty.' }
    if (isSlotNumberTaken(slots, trimmed)) return { ok: false, message: `Slot "${trimmed}" already exists.` }

    const newSlot = {
      id: Date.now().toString(),
      slotNo: trimmed,
      isCovered,
      isEVCharging,
      isOccupied: false,
    }

    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSlot),
    })

    setSlots(prev => sortSlots([...prev, newSlot]))
    return { ok: true, message: `Slot ${trimmed} added successfully!` }
  }, [slots])

  // Free a slot
  const removeVehicle = useCallback(async (slotId) => {
    const target = slots.find(s => s.id === slotId)
    if (!target) return

    await fetch(`${API}/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOccupied: false }),
    })

    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, isOccupied: false } : s))
  }, [slots])

  // Delete a slot
  const deleteSlot = useCallback(async (slotId) => {
    await fetch(`${API}/${slotId}`, { method: 'DELETE' })
    setSlots(prev => prev.filter(s => s.id !== slotId))
  }, [])

  // Update slot features
  const updateSlot = useCallback(async (slotId, changes) => {
    await fetch(`${API}/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })

    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ...changes } : s))
  }, [slots])

  return {
    slots: sortSlots(slots),
    activeTab,
    setActiveTab,
    addSlot,
    removeVehicle,
    deleteSlot,
    updateSlot,
  }
}
