# RailSathi AI 🚆
**A Smart Railway Station Navigation and Passenger Assistance System**

> **Main Tagline:** Your railway journey, smarter from entry to coach.  
> **Final Tagline:** RailSathi AI — From station entrance to your coach, the smart way.  
> **Hackathon Category:** Open Innovation  
> **Target Demonstration Station:** Chhatrapati Shivaji Maharaj Terminus (CSMT) — Demo  

---

## 📌 Executive Summary & Product Vision
Railway stations in India accommodate millions of passengers daily. The journey from **ENTRANCE → CONCOURSE → PLATFORM → COACH** is often fraught with congestion bottlenecks, confusion over coach positions, lack of step-free accessibility guidance, and disorientation while seeking critical amenities.

**RailSathi AI** converts real-time station conditions into personalized passenger routes. Rather than functioning as a ticket-booking portal, RailSathi AI serves as an intelligent in-station co-pilot for passengers and a command center for station operations personnel.

---

## 🚀 Key Features

### 1. Interactive SVG Station Blueprint
- Complete simulated layout of CSMT featuring:
  - Entrance A (South Portico) & Entrance B (North Step-Free Ramp)
  - Heritage Main Hall & Central Concourse Junction
  - Foot Over Bridges: FOB 1 (North) & FOB 2 (South)
  - Accessibility Ramp & Dual Elevators (Lift 1 & Lift 2)
  - Central Escalator
  - Platforms 5, 6, and 7 (with tactile warning edges & live rail tracks)
  - Coach Zone B4 (Departure position for Train 12951 Rajdhani Express)
  - Real-time heat overlay and zoom/pan controls

### 2. Algorithmic Route Recommendation Engine
Powered by a weighted Dijkstra graph-search algorithm evaluating walking distance, vertical stairs vs. lifts, and crowd density:
- **Route A: Fastest Route** (Entrance A → Concourse → FOB 2 → Platform 6 → Coach B4 | 5 mins, 320m, 62% crowd)
- **Route B: Lowest-Crowd Route** (Entrance B → Lift 1 → FOB 1 → Platform 6 → Coach B4 | 8 mins, 410m, 34% crowd)
- **Route C: Accessible Route** (Entrance B → Ramp → Lift 2 → Platform 6 → Coach B4 | 9 mins, 380m, 100% Step-Free)

### 3. Comprehensive Accessibility Profiles
- **Normal**, **Wheelchair**, **Elderly / Reduced Mobility**, and **Family with Children (Strollers)**
- Wheelchair & Elderly modes strictly enforce step-free routes, verify elevator operational status, bypass stairways, and recalibrate platform walk distances.

### 4. Direct Facility-to-Map Navigation
- Interactive facility cards for:
  - **Washroom** (Platform 6, 2 mins, Open)
  - **Drinking Water** (Concourse, 1 min, Available)
  - **Lift** (FOB 1, 3 mins, Available)
  - **Help Desk / Sahayata** (Main Hall, 3 mins, Available 24/7)
  - **Holding Area** (Gate B, 4 mins, Moderate)
  - **Food Plaza** (Concourse, 2 mins, Open)
- Clicking any facility immediately renders the path to that specific facility on the station map with start/destination pins and offers a one-click return to the active coach route.

### 5. AI Crowd Prediction & Heuristic Modeling
- Real-time Platform 6 density: **78% (High Crowd)**
- 15-Minute Forecast: **88% (Predicted Surge)**
- Transparent chronological chart spanning past 30 mins, current conditions, and projected 30 mins.
- Transparent attribution: *Baseline flow (+22%), Departure proximity (+35%), Inter-platform transfer (+15%), Weekend travel (+6%)*.

### 6. Smart Contextual Alert Engine
- Categorized station advisories (Critical, Warning, Info, Success).
- Dismiss, filter by severity, mark as read.
- **Replay as Notifications:** Sequentially dispatches alerts as non-intrusive toast popups without page reload loops.

### 7. Train & Coach Position Visualizer
- Train 12951 Rajdhani Express (Platform 6, Boarding 10:10 PM, Dep 10:25 PM, Seat 42).
- Dynamic rake layout: `[ENGINE] ── [A1] ── [A2] ── [B1] ── [B2] ── [B3] ── [★ B4 ★] ── [C1]`.
- Clickable coach selector recalculates distance along the platform.

### 8. Station Operations Command Center (Staff View)
- Real-time aggregate station crowd: **68%**.
- Multi-platform density bars (Platforms 1 through 7).
- Congestion bottleneck alerts and actionable staff recommendations:
  *"Redirect passengers toward Entrance B and FOB 1."*
- Vertical mobility health audit (Lift 1, Lift 2, Escalators 100% operational).
- Role switcher allows toggling between Passenger and Station Staff views.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Modern ES6+ Modular JavaScript, Tailwind CSS, SVG Graphics, JetBrains Mono & Plus Jakarta Sans typography.
- **Backend:** Python 3.15, FastAPI, Uvicorn, Pydantic data schemas, CORS middleware.
- **Deployment & Hosting:** GitHub Pages (Static SPA) + Local/Cloud FastAPI Server.

---

## 🔌 REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status & simulated data disclaimer |
| `GET` | `/api/stations` | Station metadata list |
| `GET` | `/api/stations/{id}` | Detailed station nodes and corridor graph |
| `GET` | `/api/stations/{id}/facilities` | Station verified facilities list |
| `GET` | `/api/trains/{train_number}` | Train schedule, platform & rake layout |
| `POST` | `/api/routes/plan` | Dijkstra route planner for passenger journey |
| `GET` | `/api/routes/facility/{facility_id}` | Facility waypoint route planner |
| `GET` | `/api/crowd/{station_id}` | Live platform crowd readings |
| `POST` | `/api/crowd/predict` | Explainable crowd projection engine |
| `GET` | `/api/alerts/{user_id}` | Contextual user notification feed |
| `GET` | `/api/operations/overview` | Station Master operations command feed |

---

## 💻 Local Quickstart

### Running the Python FastAPI Server:
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Open in browser:
# Frontend Application: http://localhost:8000
# Interactive Swagger Docs: http://localhost:8000/docs
```

---

## ⚖️ Transparency & Safety Disclaimer
*Prototype demonstration using simulated data. Not connected to Indian Railways or IRCTC.*
All passenger flow figures, train timing benchmarks, facility statuses, and route calculations are synthetic models created for hackathon demonstration.
