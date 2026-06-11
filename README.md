# myParking 🅿️

A smart IoT-integrated parking management system for residential societies with tower-based proximity allocation.

## Features

### 📡 IoT Motion Sensor Simulation
- CLI-based fake sensor (`sensor.js`) simulates physical motion detectors in parking slots
- Sensor triggers mark a slot as **occupied anonymously** — no owner assigned
- Guards can **appoint** the slot to a resident or guest after detection
- Residents can **claim** a sensor-detected slot themselves (parked first, claim later)
- Sensor slots are highlighted with an amber badge across all views

### 🏢 Multi-Tower Society Support
- 8-tower layout (A–H) with intelligent proximity-based parking allocation
- Distance calculation showing how far each slot is from your tower
- Automatic slot prioritization based on resident's tower location

### 👥 Role-Based Access Control

**Admin**
- Create and manage resident/guard accounts
- Full slot management (add, edit, delete)
- Assign towers to residents
- View all system data

**Guard**
- Park vehicles and tag residents or guests
- Appoint sensor-detected anonymous slots to a resident or guest
- Free up occupied slots
- View resident contact information
- Cannot modify parking slot configurations

**Resident**
- Self-park vehicles with preference selection (EV / Covered)
- **Claim sensor-detected slots** — if you parked first, register it under your name
- View and free their own occupied slots
- See distance from their tower to parking spots
- Contact information privacy (can't see other residents' phone numbers)

### 🚗 Smart Parking Allocation
- **EV Charging**: Filter slots with EV charging stations
- **Covered Parking**: Find covered/indoor spots
- **Tower Proximity**: Automatically prioritizes slots near resident's tower
- **Distance Display**: Shows approximate walking distance (20m – 200m+)

### 📊 Real-Time Dashboard
- Live parking occupancy statistics
- Available vs occupied slot tracking
- Feature-based filtering (EV, Covered)
- Visual slot grid with status indicators

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (custom `parking-*` color palette)
- **Backend**: Express.js (Node.js)
- **Database**: JSON file-based persistence (`db.json`)
- **State Management**: Custom React hook (`useParking`)

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd myParking
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file in the root directory
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the backend server
```bash
npm run server
```

5. Start the frontend (new terminal)
```bash
npm run dev
```

6. (Optional) Run the IoT sensor simulator (new terminal)
```bash
npm run sensor
```

7. Open your browser at `http://localhost:5173`

## IoT Sensor — How to Use

The sensor simulator is a Node.js CLI that mimics a physical motion detector mounted in each parking slot.

```
npm run sensor
```

**Available commands inside the CLI:**

| Command | Description |
|---------|-------------|
| `list` | Show all slots — green = available, red = occupied |
| `A1` | Trigger motion sensor on slot A1 (marks it occupied anonymously) |
| `B3` | Trigger on slot B3 |
| `exit` | Quit the simulator |

**What happens after a sensor trigger:**
1. Slot is marked `isOccupied: true` with `occupiedBy: { id: "SENSOR", name: "Anonymous (Sensor)" }`
2. Guard sees an amber **"Sensor Detected"** banner in the Park/Free tab with an **Appoint →** button
3. Resident sees a sensor badge on the **My Parking** tab and can **Claim** the slot
4. Either role can also free the slot normally if it was a false trigger

## Default Credentials

### Admin
- Username: `admin` / Password: `admin123`

### Guard
- Username: `guard1` / Password: `guard123`

### Sample Residents

| Name | Tower | Username | Password |
|------|-------|----------|----------|
| Sarthak | A | `sarthak` | `sarthak123` |
| Priya | C | `priya` | `priya123` |
| Amit | A | `amit` | `amit123` |
| Neha | B | `neha` | `neha123` |
| Rajesh | B | `rajesh` | `rajesh123` |
| Vikram | C | `vikram` | `vikram123` |
| Anjali | E | `anjali` | `anjali123` |
| Karan | F | `karan` | `karan123` |
| Deepak | G | `deepak` | `deepak123` |
| Sneha | H | `sneha` | `sneha123` |
| Rohit | D | `rohit` | `rohit123` |
| Pooja | E | `pooja` | `pooja123` |

## Project Structure

```
myParking/
├── src/
│   ├── components/
│   │   ├── AdminApp.jsx              # Admin dashboard (users + slots)
│   │   ├── GuardApp.jsx              # Guard interface
│   │   ├── ResidentApp.jsx           # Resident interface
│   │   ├── RoleLoginPage.jsx         # Role selector + login
│   │   ├── Header.jsx                # Stats bar + logout
│   │   ├── SlotGrid.jsx              # Filterable slot grid
│   │   ├── SlotDetailModal.jsx       # Slot detail + edit modal
│   │   ├── GuardParkPanel.jsx        # Park/free + sensor appoint
│   │   ├── GuardTabNav.jsx           # Guard tab navigation
│   │   ├── ResidentSelfParkPanel.jsx # Resident self-parking
│   │   ├── ResidentParkPanel.jsx     # My Parking + sensor claim
│   │   ├── ResidentTabNav.jsx        # Resident tab nav (sensor badge)
│   │   ├── ResidentSlotGrid.jsx      # Resident slot grid view
│   │   ├── ResidentDataTable.jsx     # Friendly data table
│   │   ├── DataModelTable.jsx        # Technical schema table
│   │   ├── DataModelBadge.jsx        # Schema field badges
│   │   └── AddSlotForm.jsx           # Add new slot form
│   ├── hooks/
│   │   └── useParking.js             # Slot state + CRUD operations
│   ├── utils/
│   │   └── parkingLogic.js           # ParkVehicle, distance calc, stats
│   ├── App.jsx                       # Root — role-based routing
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Tailwind base + custom utilities
├── server.js                         # Express REST API (port 3001)
├── sensor.js                         # IoT motion sensor CLI simulator
├── db.json                           # File-based database
├── .env                              # API URL config
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## How It Works

### Tower-Based Distance Calculation
Towers are arranged in a circular layout: A → B → C → D → E → F → G → H → A

| Category | Distance | Steps |
|----------|----------|-------|
| Same Tower | ~20m | 0 |
| Very Near | ~50m | 1 |
| Near | ~100m | 2 |
| Moderate | ~150m | 3 |
| Far | ~200m+ | 4+ |

### Parking Allocation Logic
1. Filter available (unoccupied) slots
2. Apply user preferences (EV charging, covered)
3. If a resident's tower is known, prioritize slots near that tower
4. Allocate the best matching slot and display distance info

### Sensor Flow
```
sensor.js  →  POST /api/sensor  →  slot marked anonymous
                                         ↓
                              Guard appoints  OR  Resident claims
                                         ↓
                              occupiedBy updated to real person
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate user |
| GET | `/api/users` | List all users (no passwords) |
| GET | `/api/users/residents` | List residents only |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/slots` | Get all slots |
| POST | `/api/slots` | Create slot |
| PUT | `/api/slots/:id` | Update slot |
| DELETE | `/api/slots/:id` | Delete slot |
| POST | `/api/sensor` | Sensor trigger — mark slot anonymous |

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `vite` | Start frontend dev server |
| `npm run server` | `node server.js` | Start Express backend |
| `npm run sensor` | `node sensor.js` | Run IoT sensor CLI |
| `npm run build` | `vite build` | Production build |
| `npm run preview` | `vite preview` | Preview production build |

## License

MIT License — feel free to use this project for personal or educational purposes.

## Credits

Built with ❤️ by Sarthak

---

**Version**: 1.1
**Last Updated**: June 2026
