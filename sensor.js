#!/usr/bin/env node
/**
 * sensor.js — Fake IoT Motion Sensor (CLI)
 *
 * Simulates a parking slot motion sensor for demo/college IoT project.
 * When triggered, marks a slot as occupied anonymously so the guard
 * can later appoint it to a resident or guest.
 *
 * Usage:
 *   node sensor.js
 *
 * Make sure the myParking server is running first:
 *   npm run server
 */

import * as readline from 'readline'

const API_URL = 'http://localhost:3001/api'

// ── Colours for terminal output ────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  gray:   '\x1b[90m',
}

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
})

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve))
}

function printBanner() {
  console.clear()
  console.log(`${c.cyan}${c.bold}`)
  console.log('  ███████╗███████╗███╗   ██╗███████╗ ██████╗ ██████╗ ')
  console.log('  ██╔════╝██╔════╝████╗  ██║██╔════╝██╔═══██╗██╔══██╗')
  console.log('  ███████╗█████╗  ██╔██╗ ██║███████╗██║   ██║██████╔╝')
  console.log('  ╚════██║██╔══╝  ██║╚██╗██║╚════██║██║   ██║██╔══██╗')
  console.log('  ███████║███████╗██║ ╚████║███████║╚██████╔╝██║  ██║')
  console.log('  ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝')
  console.log(`${c.reset}`)
  console.log(`  ${c.bold}myParking — IoT Motion Sensor Simulator${c.reset}`)
  console.log(`  ${c.gray}Simulates physical motion detectors in parking slots${c.reset}`)
  console.log()
  console.log(`  ${c.dim}Server: ${API_URL}${c.reset}`)
  console.log(`  ${c.dim}Commands: type a slot number, or "list" / "exit"${c.reset}`)
  console.log()
  console.log(`  ${c.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`)
  console.log()
}

async function fetchSlots() {
  const res = await fetch(`${API_URL}/slots`)
  if (!res.ok) throw new Error('Could not fetch slots')
  return res.json()
}

async function triggerSensor(slotNo) {
  const res = await fetch(`${API_URL}/sensor`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ slotNo: slotNo.trim().toUpperCase() }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Unknown error')
  return data
}

async function listSlots() {
  const slots = await fetchSlots()
  const available = slots.filter(s => !s.isOccupied)
  const occupied  = slots.filter(s => s.isOccupied)

  console.log(`  ${c.bold}Parking Slots${c.reset}  ${c.gray}(${slots.length} total)${c.reset}`)
  console.log()

  if (available.length > 0) {
    console.log(`  ${c.green}● Available (${available.length})${c.reset}`)
    const rows = []
    for (let i = 0; i < available.length; i += 8) {
      rows.push(available.slice(i, i + 8).map(s => `    ${c.green}${s.slotNo.padEnd(5)}${c.reset}`).join(''))
    }
    rows.forEach(r => console.log(r))
    console.log()
  }

  if (occupied.length > 0) {
    console.log(`  ${c.red}● Occupied (${occupied.length})${c.reset}`)
    const rows = []
    for (let i = 0; i < occupied.length; i += 8) {
      rows.push(occupied.slice(i, i + 8).map(s => `    ${c.red}${s.slotNo.padEnd(5)}${c.reset}`).join(''))
    }
    rows.forEach(r => console.log(r))
    console.log()
  }
}

async function main() {
  printBanner()

  // Quick connectivity check
  try {
    await fetchSlots()
    console.log(`  ${c.green}✓ Connected to myParking server${c.reset}`)
  } catch {
    console.log(`  ${c.red}✗ Cannot reach server at ${API_URL}${c.reset}`)
    console.log(`  ${c.yellow}  → Start it first with: npm run server${c.reset}`)
    rl.close()
    process.exit(1)
  }

  console.log()
  console.log(`  ${c.dim}Type "list" to see all slots, or enter a slot number to trigger sensor.${c.reset}`)
  console.log()

  while (true) {
    const raw = await ask(`  ${c.cyan}${c.bold}SENSOR ›${c.reset} `)
    const input = raw.trim()

    if (!input) continue

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log()
      console.log(`  ${c.gray}Sensor offline. Goodbye.${c.reset}`)
      console.log()
      rl.close()
      process.exit(0)
    }

    if (input.toLowerCase() === 'list') {
      console.log()
      try {
        await listSlots()
      } catch {
        console.log(`  ${c.red}✗ Failed to fetch slots${c.reset}`)
        console.log()
      }
      continue
    }

    // Treat input as a slot number — trigger the sensor
    const slotNo = input.toUpperCase()
    console.log()
    console.log(`  ${c.yellow}⚡ Motion detected — triggering sensor for slot ${c.bold}${slotNo}${c.reset}${c.yellow}...${c.reset}`)

    try {
      const data = await triggerSensor(slotNo)
      console.log()
      console.log(`  ${c.green}${c.bold}✓ Slot ${data.slot.slotNo} marked as OCCUPIED${c.reset}`)
      console.log(`  ${c.gray}  occupiedBy : Anonymous (Sensor)${c.reset}`)
      console.log(`  ${c.gray}  isCovered  : ${data.slot.isCovered}${c.reset}`)
      console.log(`  ${c.gray}  isEV       : ${data.slot.isEVCharging}${c.reset}`)
      console.log()
      console.log(`  ${c.blue}ℹ  Guard can now appoint this slot to a resident or guest.${c.reset}`)
    } catch (err) {
      console.log()
      console.log(`  ${c.red}✗ ${err.message}${c.reset}`)
    }

    console.log()
  }
}

main()
