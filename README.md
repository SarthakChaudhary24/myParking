# myParking 🅿️

A smart parking management system for residential societies with tower-based proximity allocation.

## Features

### 🏢 Multi-Tower Society Support
- 8-tower layout (A-H) with intelligent proximity-based parking allocation
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
- Free up occupied slots
- View resident contact information
- Cannot modify parking slot configurations

**Resident**
- Self-park vehicles with preference selection (EV/Covered)
- View only their occupied slots
- Free their own parking slots
- See distance from their tower to parking spots
- Contact information privacy (can't see other residents' phone numbers)

### 🚗 Smart Parking Allocation
- **EV Charging**: Filter slots with EV charging stations
- **Covered Parking**: Find covered/indoor spots
- **Tower Proximity**: Automatically prioritizes slots near resident's tower
- **Distance Display**: Shows approximate walking distance (20m - 200m+)

### 📊 Real-Time Dashboard
- Live parking occupancy statistics
- Available vs occupied slot tracking
- Feature-based filtering (EV, Covered)
- Visual slot grid with status indicators

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js
- **Database**: JSON file-based persistence
- **State Management**: Custom hooks

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

3. Start the backend server
```bash
npm run server
```

4. Start the frontend (in a new terminal)
```bash
npm run dev
```

5. Open your browser at `http://localhost:5173`

## Default Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Guard
- Username: `guard1`
- Password: `guard123`

### Sample Residents
- **Sarthak** (Tower A): `sarthak` / `sarthak123`
- **Priya** (Tower C): `priya` / `priya123`
- **Amit** (Tower A): `amit` / `amit123`
- **Neha** (Tower B): `neha` / `neha123`
- **Rajesh** (Tower B): `rajesh` / `rajesh123`
- **Vikram** (Tower C): `vikram` / `vikram123`
- **Anjali** (Tower E): `anjali` / `anjali123`
- **Karan** (Tower F): `karan` / `karan123`
- **Deepak** (Tower G): `deepak` / `deepak123`
- **Sneha** (Tower H): `sneha` / `sneha123`
- **Rohit** (Tower D): `rohit` / `rohit123`
- **Pooja** (Tower E): `pooja` / `pooja123`

## Project Structure

```
myParking/
├── src/
│   ├── components/
│   │   ├── AdminApp.jsx          # Admin dashboard
│   │   ├── GuardApp.jsx          # Guard interface
│   │   ├── ResidentApp.jsx       # Resident interface
│   │   ├── RoleLoginPage.jsx     # Login page
│   │   ├── Header.jsx            # Common header
│   │   ├── SlotGrid.jsx          # Parking slot grid
│   │   ├── GuardParkPanel.jsx    # Guard parking panel
│   │   ├── ResidentSelfParkPanel.jsx  # Resident self-parking
│   │   ├── ResidentParkPanel.jsx # Resident's occupied slots
│   │   └── ...
│   ├── hooks/
│   │   └── useParking.js         # Parking state management
│   ├── utils/
│   │   └── parkingLogic.js       # Core parking algorithms
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── server.js                     # Express backend
├── db.json                       # Database file
├── package.json
└── README.md
```

## How It Works

### Tower-Based Distance Calculation
The system arranges towers in a circular layout: A → B → C → D → E → F → G → H → A

Distance categories:
- **Same Tower** (~20m): Slot is adjacent to your tower
- **Very Near** (~50m): 1 tower away
- **Near** (~100m): 2 towers away
- **Moderate** (~150m): 3 towers away
- **Far** (~200m+): 4+ towers away

### Parking Allocation Logic
1. Filter available (unoccupied) slots
2. Apply user preferences (EV charging, covered)
3. Prioritize slots near resident's tower
4. Allocate the best matching slot
5. Display distance information

### Data Persistence
All data is stored in `db.json`:
- User accounts (admin, guards, residents)
- Parking slots with features and occupancy
- Tower assignments and proximity mappings

## Features in Detail

### Admin Dashboard
- Two-tab interface: Users and Slots
- Create resident/guard accounts with tower assignment
- Edit existing accounts (password optional on update)
- Delete accounts
- Full slot CRUD operations

### Guard Interface
- Park vehicles with resident tagging or "Guest" option
- View all parking slots with occupancy status
- Free up any occupied slot
- See resident contact information in slot details
- Cannot modify slot configurations

### Resident Interface
- **View Slots**: See all parking slots with availability
- **My Parking**: View only their occupied slots with distance info
- **Park Vehicle**: Self-park with EV/Covered preferences
- **Data Table**: User-friendly parking data view
- Privacy: Can't see other residents' phone numbers

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

Built with ❤️ by Sarthak

---

**Version**: 1.0.0  
**Last Updated**: April 2026
