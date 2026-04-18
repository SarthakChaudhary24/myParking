import { useState, useEffect, useCallback } from 'react'
import { ParkVehicle, sortSlots, isSlotNumberTaken } from '../utils/parkingLogic'

const API = 'http://localhost:3001/api/slots'

export function useParking() {
  const [slots, setSlots] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const [activeTab, setActiveTab] = useState('slots')

  // Load slots from server on mount
  useEffect(() => {
    const load = () => {
      fetch(API)
        .then(r => r.json())
        .then(data => setSlots(data))
        .catch(() => console.error('Could not connect to myParking server. Is it running?'))
    }
    load()
    window.addEventListener('parking-updated', load)
    return () => window.removeEventListener('parking-updated', load)
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

  // Park a vehicle
  const parkVehicle = useCallback(async (needsEV, needsCover) => {
    const result = ParkVehicle(sortSlots(slots), needsEV, needsCover)

    if (result.slot) {
      await fetch(`${API}/${result.slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOccupied: true }),
      })
      setSlots(prev => prev.map(s => s.id === result.slot.id ? { ...s, isOccupied: true } : s))
      setLastResult({ type: 'success', message: result.message, slot: result.slot })
    } else {
      setLastResult({ type: 'error', message: result.message, slot: null })
    }

    return result
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
    setLastResult({ type: 'info', message: `Slot ${target.slotNo} is now free.`, slot: target })
  }, [slots])

  // Delete a slot
  const deleteSlot = useCallback(async (slotId) => {
    await fetch(`${API}/${slotId}`, { method: 'DELETE' })
    setSlots(prev => prev.filter(s => s.id !== slotId))
    setLastResult(null)
  }, [])

  // Update slot features
  const updateSlot = useCallback(async (slotId, changes) => {
    await fetch(`${API}/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })

    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, ...changes } : s))
    const target = slots.find(s => s.id === slotId)
    if (target) {
      setLastResult({ type: 'info', message: `Slot ${target.slotNo} updated.`, slot: { ...target, ...changes } })
    }
  }, [slots])

  const clearResult = useCallback(() => setLastResult(null), [])

  return {
    slots: sortSlots(slots),
    lastResult,
    activeTab,
    setActiveTab,
    addSlot,
    parkVehicle,
    removeVehicle,
    deleteSlot,
    updateSlot,
    clearResult,
  }
}
