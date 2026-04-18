import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'db.json')

const app = express()
app.use(cors())
app.use(express.json())

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) }
  catch { return { slots: [], users: [] } }
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// ── AUTH ──────────────────────────────────────────────────────────

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  const db = readDB()
  const user = db.users.find(u => u.username === username && u.password === password)
  if (!user) return res.status(401).json({ error: 'Invalid username or password.' })
  const { password: _, ...safeUser } = user
  res.json(safeUser)
})

// ── USERS (admin only) ────────────────────────────────────────────

// GET /api/users — list residents and guards (no passwords)
app.get('/api/users', (req, res) => {
  const db = readDB()
  const safe = db.users
    .filter(u => u.role !== 'admin')
    .map(({ password: _, ...u }) => u)
  res.json(safe)
})

// GET /api/users/residents — list only residents (for guard dropdown)
app.get('/api/users/residents', (req, res) => {
  const db = readDB()
  const residents = db.users
    .filter(u => u.role === 'resident')
    .map(({ password: _, ...u }) => u)
  res.json(residents)
})

// POST /api/users — create resident or guard account
app.post('/api/users', (req, res) => {
  const db = readDB()
  const { username, password, role, name, phone } = req.body
  if (!username || !password || !role || !name) {
    return res.status(400).json({ error: 'username, password, role, and name are required.' })
  }
  if (db.users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already exists.' })
  }
  const newUser = { id: `${role}-${Date.now()}`, username, password, role, name, phone: phone || null }
  db.users.push(newUser)
  writeDB(db)
  const { password: _, ...safe } = newUser
  res.json(safe)
})

// PUT /api/users/:id — update resident or guard account
app.put('/api/users/:id', (req, res) => {
  const db = readDB()
  const index = db.users.findIndex(u => u.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'User not found.' })
  
  const { username, password, name, phone, tower, role } = req.body
  const existingUser = db.users[index]
  
  // Check if username is being changed and if it conflicts
  if (username && username !== existingUser.username) {
    if (db.users.find(u => u.username === username)) {
      return res.status(409).json({ error: 'Username already exists.' })
    }
  }
  
  // Update user - keep existing password if new one not provided
  db.users[index] = {
    ...existingUser,
    username: username || existingUser.username,
    password: password || existingUser.password,
    name: name || existingUser.name,
    phone: phone !== undefined ? phone : existingUser.phone,
    tower: tower !== undefined ? tower : existingUser.tower,
    role: role || existingUser.role
  }
  
  writeDB(db)
  const { password: _, ...safe } = db.users[index]
  res.json(safe)
})

// DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
  const db = readDB()
  db.users = db.users.filter(u => u.id !== req.params.id)
  writeDB(db)
  res.json({ ok: true })
})

// ── SLOTS ─────────────────────────────────────────────────────────

// GET /api/slots
app.get('/api/slots', (req, res) => {
  const db = readDB()
  res.json(db.slots)
})

// POST /api/slots
app.post('/api/slots', (req, res) => {
  const db = readDB()
  const newSlot = req.body
  db.slots.push(newSlot)
  writeDB(db)
  res.json(newSlot)
})

// PUT /api/slots/:id
app.put('/api/slots/:id', (req, res) => {
  const db = readDB()
  const index = db.slots.findIndex(s => s.id === req.params.id)
  if (index === -1) return res.status(404).json({ error: 'Slot not found' })
  db.slots[index] = { ...db.slots[index], ...req.body }
  writeDB(db)
  res.json(db.slots[index])
})

// DELETE /api/slots/:id
app.delete('/api/slots/:id', (req, res) => {
  const db = readDB()
  db.slots = db.slots.filter(s => s.id !== req.params.id)
  writeDB(db)
  res.json({ ok: true })
})

app.listen(3001, () => console.log('myParking server running on http://localhost:3001'))
