import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .models import (
    Station, Facility, TrainInfo, RouteRequest, RoutePlanResponse,
    RouteOption, CrowdReading, CrowdPredictionRequest, CrowdPredictionResponse,
    CrowdPredictionPoint, AlertItem, StationOperationsOverview
)
from .data import (
    STATION_NODES, STATION_EDGES, FACILITIES_LIST,
    TRAINS_DATABASE, INITIAL_ALERTS, PLATFORM_CROWDS
)
from .graph import GRAPH

app = FastAPI(
    title="RailSathi AI API",
    description="A Smart Railway Station Navigation and Passenger Assistance System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend and deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory alerts state
alerts_store: List[AlertItem] = [alert.model_copy() for alert in INITIAL_ALERTS]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RailSathi AI Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "simulated_data": True,
        "disclaimer": "Prototype demonstration using simulated data. Not connected to Indian Railways or IRCTC."
    }

@app.get("/api/stations", response_model=List[Dict[str, Any]])
def get_stations():
    return [
        {
            "id": "CSMT_DEMO",
            "name": "Chhatrapati Shivaji Maharaj Terminus",
            "code": "CSMT",
            "city": "Mumbai",
            "description": "Historical UNESCO World Heritage terminal station with 18 platforms.",
            "is_demo_ready": True
        },
        {
            "id": "NDLS_PROTO",
            "name": "New Delhi Railway Station",
            "code": "NDLS",
            "city": "New Delhi",
            "description": "High-traffic 16-platform hub connecting Northern and Western railway zones.",
            "is_demo_ready": False
        },
        {
            "id": "HWH_PROTO",
            "name": "Howrah Junction",
            "code": "HWH",
            "city": "Kolkata",
            "description": "Busiest railway station complex in India with 23 operational platforms.",
            "is_demo_ready": False
        }
    ]

@app.get("/api/stations/{station_id}")
def get_station_details(station_id: str):
    if station_id not in ["CSMT_DEMO", "CSMT"]:
        return {
            "id": station_id,
            "name": f"Station {station_id}",
            "code": station_id,
            "city": "India",
            "description": "Simulated station prototype.",
            "nodes": [n.model_dump() for n in STATION_NODES],
            "edges": [e.model_dump() for e in STATION_EDGES]
        }
    return {
        "id": "CSMT_DEMO",
        "name": "Chhatrapati Shivaji Maharaj Terminus — Demo",
        "code": "CSMT",
        "city": "Mumbai",
        "description": "Demonstration station model for RailSathi AI navigation.",
        "nodes": [n.model_dump() for n in STATION_NODES],
        "edges": [e.model_dump() for e in STATION_EDGES]
    }

@app.get("/api/stations/{station_id}/facilities", response_model=List[Facility])
def get_facilities(station_id: str):
    return FACILITIES_LIST

@app.get("/api/trains/{train_number}")
def get_train_details(train_number: str):
    train = TRAINS_DATABASE.get(train_number)
    if not train:
        # Provide fallback/custom simulated train
        return {
            "number": train_number,
            "name": f"Express Special {train_number}",
            "route": "Mumbai CSMT → Destination",
            "platform": 6,
            "selected_coach": "B4",
            "selected_seat": 42,
            "boarding_time": "10:10 PM",
            "departure_time": "10:25 PM",
            "status": "On time (Simulated)",
            "coaches": ["ENGINE", "A1", "A2", "B1", "B2", "B3", "B4", "C1"],
            "is_simulated": True
        }
    return train

@app.get("/api/trains/{train_number}/status")
def get_train_status(train_number: str):
    train = TRAINS_DATABASE.get(train_number)
    status_label = train.status if train else "On time"
    platform = train.platform if train else 6
    return {
        "train_number": train_number,
        "platform": platform,
        "status": status_label,
        "expected_arrival": "On time",
        "expected_departure": train.departure_time if train else "10:25 PM",
        "coach_positioning_ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/routes/plan", response_model=RoutePlanResponse)
def plan_route(req: RouteRequest):
    routes = GRAPH.get_three_routes(
        start_id=req.start_node or "entrance_a",
        dest_id=req.destination_node or "coach_b4",
        accessibility_mode=req.accessibility_mode or "normal"
    )

    return RoutePlanResponse(
        station_id=req.station_id,
        start_node=req.start_node,
        destination_node=req.destination_node,
        accessibility_mode=req.accessibility_mode,
        routes=routes,
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/api/routes/facility/{facility_id}", response_model=RouteOption)
def plan_facility_route(facility_id: str, start_node: str = "entrance_a"):
    fac = next((f for f in FACILITIES_LIST if f.id == facility_id or f.type == facility_id), None)
    if not fac:
        fac = FACILITIES_LIST[0]
    
    route = GRAPH.get_facility_route(start_node, fac.location_node)
    if not route:
        raise HTTPException(status_code=404, detail="Route to facility not found")
    return route

@app.get("/api/crowd/{station_id}", response_model=CrowdReading)
def get_crowd_readings(station_id: str):
    return CrowdReading(
        station_id=station_id,
        total_station_crowd=68,
        platform_crowds=PLATFORM_CROWDS,
        updated_at=datetime.utcnow().isoformat()
    )

@app.post("/api/crowd/predict", response_model=CrowdPredictionResponse)
def predict_crowd(req: CrowdPredictionRequest):
    # Explainable AI heuristic simulation as specified in Section 9
    current_val = 78
    pred_15m = 88
    
    timeline = [
        CrowdPredictionPoint(time_label="t - 30m", minutes_offset=-30, crowd_percentage=65, is_projected=False),
        CrowdPredictionPoint(time_label="t - 20m", minutes_offset=-20, crowd_percentage=70, is_projected=False),
        CrowdPredictionPoint(time_label="t - 10m", minutes_offset=-10, crowd_percentage=74, is_projected=False),
        CrowdPredictionPoint(time_label="Now", minutes_offset=0, crowd_percentage=78, is_projected=False),
        CrowdPredictionPoint(time_label="t + 10m", minutes_offset=10, crowd_percentage=84, is_projected=True),
        CrowdPredictionPoint(time_label="t + 15m", minutes_offset=15, crowd_percentage=88, is_projected=True),
        CrowdPredictionPoint(time_label="t + 20m", minutes_offset=20, crowd_percentage=86, is_projected=True),
        CrowdPredictionPoint(time_label="t + 30m", minutes_offset=30, crowd_percentage=79, is_projected=True),
    ]

    return CrowdPredictionResponse(
        station_id=req.station_id,
        target=req.target_node_or_platform or "Platform 6",
        current_crowd=current_val,
        predicted_crowd_15m=pred_15m,
        status="High Crowd",
        meter_level="High",
        timeline=timeline,
        heuristic_breakdown={
            "Baseline Historical Flow": "+22% based on typical Friday evening volume",
            "Train Departure Proximity": "+35% boarding peak for 12951 Rajdhani Express (10:25 PM)",
            "Cross-Platform Movement": "+15% arrival passengers from Platform 5 transfer",
            "Weekend Leisure Travel": "+6% seasonal holiday indicator"
        },
        disclaimer="The prediction uses simulated passenger flow, train schedules, time of day and historical station patterns."
    )

@app.get("/api/alerts/{user_id}", response_model=List[AlertItem])
def get_user_alerts(user_id: str = "demo_user"):
    return alerts_store

@app.post("/api/alerts/{alert_id}/read")
def mark_alert_read(alert_id: str):
    for a in alerts_store:
        if a.id == alert_id:
            a.is_read = True
            return {"status": "success", "alert_id": alert_id}
    return {"status": "not_found"}

@app.get("/api/operations/overview", response_model=StationOperationsOverview)
def get_operations_overview():
    return StationOperationsOverview(
        total_crowd_percent=68,
        platform_crowds=PLATFORM_CROWDS,
        predicted_bottlenecks=[
            {
                "platform": "Platform 6",
                "current_crowd": "78%",
                "predicted_crowd": "88%",
                "horizon": "15 minutes",
                "risk": "High Surge",
                "recommendation": "Redirect passengers toward Entrance B and FOB 1."
            },
            {
                "platform": "Concourse FOB 2",
                "current_crowd": "68%",
                "predicted_crowd": "74%",
                "horizon": "20 minutes",
                "risk": "Medium Congestion",
                "recommendation": "Deploy platform marshal to regulate stairway bottleneck."
            }
        ],
        recommended_staff_actions=[
            "Redirect passengers toward Entrance B and FOB 1.",
            "Display alternate staircase directional signs on Concourse LED monitors.",
            "Ensure Lift 1 and Lift 2 priority queue for wheelchair and elderly passengers.",
            "Open Auxiliary Gate 4 at North Concourse for egress flow."
        ],
        facility_health={
            "Lift 1": "Operational (99.8%)",
            "Lift 2": "Operational (Braille Active)",
            "Central Escalator": "Operational (Bi-directional)",
            "Water Stations": "4/4 Operational",
            "Cleanliness Audit": "Verified Clean 12 mins ago"
        },
        train_status_board=[
            {"train": "12951 Rajdhani Express", "platform": "6", "time": "22:25", "status": "On Time", "action": "Boarding Underway"},
            {"train": "12009 Shatabdi Express", "platform": "5", "time": "06:20", "status": "Arrived", "action": "Deboarding"},
            {"train": "22221 Rajdhani Special", "platform": "7", "time": "16:00", "status": "Scheduled", "action": "Rake Positioned"},
            {"train": "12137 Punjab Mail", "platform": "4", "time": "19:35", "status": "On Time", "action": "Platform Cleared"}
        ]
    )

# Mount static folder if exists
static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/")
def serve_root():
    root_index = os.path.join(os.path.dirname(os.path.dirname(__file__)), "index.html")
    if os.path.exists(root_index):
        return FileResponse(root_index)
    static_index = os.path.join(static_path, "index.html")
    if os.path.exists(static_index):
        return FileResponse(static_index)
    return {"message": "RailSathi AI API is live! Navigate to /docs for API documentation."}
