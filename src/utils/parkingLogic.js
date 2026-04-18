/**
 * Calculate distance between two towers (A-H arranged in a circle)
 * Returns distance category: "Very Near", "Near", "Moderate", "Far"
 */
export function getTowerDistance(residentTower, slotTowers) {
  if (!residentTower || !slotTowers || slotTowers.length === 0) {
    return { distance: 'Unknown', level: 0 }
  }

  // Tower positions in circular layout: A, B, C, D, E, F, G, H
  const towerPositions = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7 }
  const resPos = towerPositions[residentTower]
  
  // Find minimum distance to any of the slot's near towers
  const distances = slotTowers.map(t => {
    const slotPos = towerPositions[t]
    // Calculate circular distance (shortest path around the circle)
    const direct = Math.abs(resPos - slotPos)
    const around = 8 - direct
    return Math.min(direct, around)
  })
  
  const minDist = Math.min(...distances)
  
  // Categorize distance
  if (minDist === 0) return { distance: 'Same Tower', level: 0, meters: '~20m' }
  if (minDist === 1) return { distance: 'Very Near', level: 1, meters: '~50m' }
  if (minDist === 2) return { distance: 'Near', level: 2, meters: '~100m' }
  if (minDist === 3) return { distance: 'Moderate', level: 3, meters: '~150m' }
  return { distance: 'Far', level: 4, meters: '~200m+' }
}

/**
 * Get distance badge color based on level
 */
export function getDistanceBadgeColor(level) {
  switch(level) {
    case 0: return 'bg-parking-greenDim text-parking-green border-parking-green/30'
    case 1: return 'bg-parking-greenDim text-parking-green border-parking-green/30'
    case 2: return 'bg-blue-500/10 text-blue-400 border-blue-400/30'
    case 3: return 'bg-parking-amberDim text-parking-amber border-parking-amber/30'
    case 4: return 'bg-parking-redDim text-parking-red border-parking-red/30'
    default: return 'bg-parking-surface text-parking-muted border-parking-border'
  }
}

// ─── Core Parking Logic ───────────────────────────────────────────

/**
 * ParkVehicle — Finds and allocates the best matching available slot.
 * Prioritizes slots near the resident's tower if provided.
 * @param {Array} slots         - All parking slots
 * @param {boolean} needsEV     - Vehicle needs EV charging
 * @param {boolean} needsCover  - Vehicle needs covered spot
 * @param {string|null} tower   - Resident's tower (A-H) for proximity priority
 * @returns {{ slot: Object|null, message: string }}
 */
export function ParkVehicle(slots, needsEV, needsCover, tower = null) {
  // Step 1: Filter only available (unoccupied) slots
  const available = slots.filter((s) => !s.isOccupied)

  if (available.length === 0) {
    return { slot: null, message: 'Parking lot is completely full.' }
  }

  // Step 2: Apply user preference filters
  const matching = available.filter((s) => {
    const evOk = needsEV ? s.isEVCharging : true
    const coverOk = needsCover ? s.isCovered : true
    return evOk && coverOk
  })

  if (matching.length === 0) {
    const reason = []
    if (needsEV) reason.push('EV charging')
    if (needsCover) reason.push('covered spot')
    return {
      slot: null,
      message: `No available slot with ${reason.join(' & ')} found.`,
    }
  }

  // Step 3: If tower is provided, prioritize slots near that tower
  let allocated
  if (tower) {
    const nearTower = matching.filter(s => s.nearTowers && s.nearTowers.includes(tower))
    allocated = nearTower.length > 0 ? nearTower[0] : matching[0]
  } else {
    allocated = matching[0]
  }

  return { slot: allocated, message: `Slot ${allocated.slotNo} allocated successfully!` }
}

/**
 * Sorts slots by slotNo — numeric first, then alphanumeric
 */
export function sortSlots(slots) {
  return [...slots].sort((a, b) => {
    const numA = parseInt(a.slotNo)
    const numB = parseInt(b.slotNo)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return a.slotNo.localeCompare(b.slotNo)
  })
}

/**
 * Get parking lot statistics
 */
export function getParkingStats(slots) {
  const total = slots.length
  const occupied = slots.filter((s) => s.isOccupied).length
  const available = total - occupied
  const evSlots = slots.filter((s) => s.isEVCharging).length
  const coveredSlots = slots.filter((s) => s.isCovered).length
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0

  return { total, occupied, available, evSlots, coveredSlots, occupancyRate }
}

/**
 * Validate slot number uniqueness
 */
export function isSlotNumberTaken(slots, slotNo) {
  return slots.some((s) => s.slotNo.toLowerCase() === slotNo.toLowerCase())
}
