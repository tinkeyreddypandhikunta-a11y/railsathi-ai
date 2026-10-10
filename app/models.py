from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class StationNode(BaseModel):
    id: str
    name: str
    type: str # entrance, hall, concourse, fob, ramp, lift, escalator, platform, coach_zone, facility
    x: float
    y: float
    description: Optional[str] = None
    step_free: bool = True
    current_crowd: int = 40 # percentage 0-100

class StationEdge(BaseModel):
    source: str
    target: str
    distance_meters: int
    base_time_seconds: int
    has_stairs: bool = False
    has_lift: bool = False
    has_ramp: bool = False
    crowd_density: int = 50 # percentage
    is_operational: bool = True

class Station(BaseModel):
    id: str
    name: str
    code: str
    city: str
    description: str
    nodes: List[StationNode]
    edges: List[StationEdge]

class Facility(BaseModel):
    id: str
    name: str
    type: str # washroom, water, lift, helpdesk, holding, food
    location_node: str
    location_name: str
    walking_time_mins: int
    status: str
    operational: bool = True
    details: Optional[str] = None

class TrainInfo(BaseModel):
    number: str
    name: str
    route: str
    platform: int
    selected_coach: str
    selected_seat: int
    boarding_time: str
    departure_time: str
    status: str
    coaches: List[str]

class RouteRequest(BaseModel):
    station_id: str = "CSMT_DEMO"
    start_node: str = "entrance_a"
    destination_node: str = "coach_b4"
    accessibility_mode: str = "normal" # normal, wheelchair, elderly, family
    optimize_for: Optional[str] = None # fastest, lowest_crowd, accessible

class RouteStep(BaseModel):
    node_id: str
    name: str
    instruction: str
    distance_m: int
    time_seconds: int
    step_free: bool
    crowd_level: int
    icon: str

class RouteOption(BaseModel):
    id: str
    title: str
    badge: str
    estimated_time_mins: int
    total_distance_m: int
    avg_crowd_percent: int
    step_free: bool
    path_nodes: List[str]
    steps: List[RouteStep]
    recommendation_score: float
    description: str

class RoutePlanResponse(BaseModel):
    station_id: str
    start_node: str
    destination_node: str
    accessibility_mode: str
    routes: List[RouteOption]
    timestamp: str

class CrowdReading(BaseModel):
    station_id: str
    total_station_crowd: int
    platform_crowds: Dict[str, int]
    updated_at: str

class CrowdPredictionRequest(BaseModel):
    station_id: str = "CSMT_DEMO"
    target_node_or_platform: str = "Platform 6"
    minutes_ahead: int = 15

class CrowdPredictionPoint(BaseModel):
    time_label: str
    minutes_offset: int
    crowd_percentage: int
    is_projected: bool

class CrowdPredictionResponse(BaseModel):
    station_id: str
    target: str
    current_crowd: int
    predicted_crowd_15m: int
    status: str
    meter_level: str # Low, Medium, High, Very High
    timeline: List[CrowdPredictionPoint]
    heuristic_breakdown: Dict[str, str]
    disclaimer: str

class AlertItem(BaseModel):
    id: str
    severity: str # critical, warning, info, success
    category: str # crowd, route, train, facility
    title: str
    description: str
    related_location: str
    timestamp: str
    suggested_action: str
    is_read: bool = False

class StationOperationsOverview(BaseModel):
    total_crowd_percent: int
    platform_crowds: Dict[str, int]
    predicted_bottlenecks: List[Dict[str, str]]
    recommended_staff_actions: List[str]
    facility_health: Dict[str, str]
    train_status_board: List[Dict[str, str]]
