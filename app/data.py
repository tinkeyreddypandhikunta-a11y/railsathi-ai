# Seed demo dataset for RailSathi AI - CSMT Demonstration Station
from typing import Dict, List
from .models import Station, StationNode, StationEdge, Facility, TrainInfo, AlertItem

STATION_NODES: List[StationNode] = [
    StationNode(id="entrance_a", name="Entrance A", type="entrance", x=80, y=420, description="South Main Terminal Portico, Near Taxi Stand", step_free=True, current_crowd=75),
    StationNode(id="entrance_b", name="Entrance B", type="entrance", x=80, y=160, description="North Suburban Gate, Step-Free Ramp Access", step_free=True, current_crowd=34),
    StationNode(id="main_hall", name="Main Hall", type="hall", x=220, y=420, description="Grand Heritage Concourse & Ticketing Dome", step_free=True, current_crowd=65),
    StationNode(id="concourse", name="Concourse Central", type="concourse", x=390, y=290, description="Central Junction connecting all platforms & bridges", step_free=True, current_crowd=72),
    StationNode(id="fob_1", name="FOB 1 (North Bridge)", type="fob", x=620, y=170, description="North Foot Over Bridge with Lift 1 access", step_free=False, current_crowd=38),
    StationNode(id="fob_2", name="FOB 2 (South Bridge)", type="fob", x=620, y=410, description="South Foot Over Bridge connecting Platforms 4-7", step_free=False, current_crowd=68),
    StationNode(id="ramp", name="Accessibility Ramp", type="ramp", x=220, y=160, description="Gradual 1:12 slope ramp designed for wheelchairs", step_free=True, current_crowd=25),
    StationNode(id="lift_1", name="Lift 1 (North)", type="lift", x=470, y=170, description="High-capacity elevator direct to North FOB & P6", step_free=True, current_crowd=30),
    StationNode(id="lift_2", name="Lift 2 (Central)", type="lift", x=470, y=370, description="Braille & audio-enabled step-free lift to Platforms 5-7", step_free=True, current_crowd=42),
    StationNode(id="escalator", name="Central Escalator", type="escalator", x=520, y=290, description="Bi-directional escalator towards FOB 2", step_free=False, current_crowd=60),
    StationNode(id="platform_5", name="Platform 5", type="platform", x=780, y=190, description="Island Platform for Express departures", step_free=True, current_crowd=61),
    StationNode(id="platform_6", name="Platform 6", type="platform", x=780, y=290, description="Departure platform for 12951 Rajdhani Express", step_free=True, current_crowd=78),
    StationNode(id="platform_7", name="Platform 7", type="platform", x=780, y=390, description="Platform for outbound Central Railway express trains", step_free=True, current_crowd=48),
    StationNode(id="coach_b4", name="Coach Zone B4", type="coach_zone", x=930, y=290, description="Coach B4 Boarding Position (Platform 6)", step_free=True, current_crowd=74),
    
    # Specific facility nodes
    StationNode(id="washroom_p6", name="Washroom (P6)", type="facility", x=830, y=240, description="Clean modern washroom near Platform 6 mid-section", step_free=True, current_crowd=40),
    StationNode(id="water_concourse", name="Drinking Water Point", type="facility", x=360, y=240, description="RO Purified cold water dispenser at Concourse", step_free=True, current_crowd=32),
    StationNode(id="helpdesk_main", name="Help Desk & Sahayata", type="facility", x=220, y=490, description="24/7 Passenger assistance, Porter & Wheelchair booking", step_free=True, current_crowd=35),
    StationNode(id="holding_gate_b", name="Passenger Holding Area", type="facility", x=160, y=90, description="Air-conditioned waiting lounge near Entrance B", step_free=True, current_crowd=44),
    StationNode(id="food_concourse", name="Food Outlet (IRCTC Food Plaza)", type="facility", x=430, y=350, description="Hygienic snacks, meals, tea and beverages", step_free=True, current_crowd=58),
]

STATION_EDGES: List[StationEdge] = [
    # Entrance A connections (Fastest south corridor)
    StationEdge(source="entrance_a", target="main_hall", distance_meters=60, base_time_seconds=50, has_stairs=False, crowd_density=72),
    StationEdge(source="main_hall", target="concourse", distance_meters=110, base_time_seconds=90, has_stairs=False, crowd_density=68),
    StationEdge(source="main_hall", target="helpdesk_main", distance_meters=40, base_time_seconds=30, has_stairs=False, crowd_density=35),
    StationEdge(source="concourse", target="fob_2", distance_meters=90, base_time_seconds=80, has_stairs=True, crowd_density=64),
    StationEdge(source="fob_2", target="platform_6", distance_meters=60, base_time_seconds=60, has_stairs=True, crowd_density=60),
    StationEdge(source="platform_6", target="coach_b4", distance_meters=80, base_time_seconds=70, has_stairs=False, crowd_density=75),
    
    # Entrance B connections (Lowest crowd & ramp accessible)
    StationEdge(source="entrance_b", target="ramp", distance_meters=45, base_time_seconds=40, has_ramp=True, has_stairs=False, crowd_density=28),
    StationEdge(source="entrance_b", target="holding_gate_b", distance_meters=35, base_time_seconds=30, has_stairs=False, crowd_density=30),
    StationEdge(source="ramp", target="lift_1", distance_meters=85, base_time_seconds=75, has_ramp=True, has_stairs=False, crowd_density=32),
    StationEdge(source="ramp", target="concourse", distance_meters=110, base_time_seconds=95, has_stairs=False, crowd_density=40),
    StationEdge(source="lift_1", target="fob_1", distance_meters=30, base_time_seconds=35, has_lift=True, has_stairs=False, crowd_density=34),
    StationEdge(source="fob_1", target="platform_6", distance_meters=120, base_time_seconds=110, has_stairs=False, has_lift=True, crowd_density=36),
    StationEdge(source="lift_1", target="platform_6", distance_meters=140, base_time_seconds=120, has_lift=True, has_stairs=False, crowd_density=30),

    # Accessibility route via Lift 2
    StationEdge(source="ramp", target="lift_2", distance_meters=140, base_time_seconds=120, has_ramp=True, has_stairs=False, crowd_density=35),
    StationEdge(source="concourse", target="lift_2", distance_meters=70, base_time_seconds=60, has_stairs=False, crowd_density=45),
    StationEdge(source="lift_2", target="platform_6", distance_meters=95, base_time_seconds=85, has_lift=True, has_stairs=False, crowd_density=40),
    
    # Concourse to facilities & platforms
    StationEdge(source="concourse", target="water_concourse", distance_meters=30, base_time_seconds=25, has_stairs=False, crowd_density=32),
    StationEdge(source="concourse", target="food_concourse", distance_meters=35, base_time_seconds=30, has_stairs=False, crowd_density=55),
    StationEdge(source="concourse", target="escalator", distance_meters=45, base_time_seconds=35, has_stairs=False, crowd_density=58),
    StationEdge(source="escalator", target="fob_2", distance_meters=55, base_time_seconds=45, has_stairs=False, crowd_density=62),
    StationEdge(source="concourse", target="platform_6", distance_meters=150, base_time_seconds=130, has_stairs=True, crowd_density=78),
    StationEdge(source="platform_6", target="washroom_p6", distance_meters=40, base_time_seconds=35, has_stairs=False, crowd_density=40),
    
    # Inter-platform edges
    StationEdge(source="fob_1", target="platform_5", distance_meters=60, base_time_seconds=50, has_stairs=True, crowd_density=48),
    StationEdge(source="fob_2", target="platform_7", distance_meters=65, base_time_seconds=55, has_stairs=True, crowd_density=45),
    StationEdge(source="platform_5", target="platform_6", distance_meters=90, base_time_seconds=80, has_stairs=True, crowd_density=66),
    StationEdge(source="platform_6", target="platform_7", distance_meters=90, base_time_seconds=80, has_stairs=True, crowd_density=62),
]

FACILITIES_LIST: List[Facility] = [
    Facility(
        id="fac_washroom",
        name="Washroom",
        type="washroom",
        location_node="washroom_p6",
        location_name="Platform 6",
        walking_time_mins=2,
        status="Open",
        operational=True,
        details="Clean Western & Indian cubicles, wheelchair accessible, infant changing station."
    ),
    Facility(
        id="fac_water",
        name="Drinking Water",
        type="water",
        location_node="water_concourse",
        location_name="Concourse",
        walking_time_mins=1,
        status="Available",
        operational=True,
        details="RO chilled drinking water kiosk, contactless sensor, certified purity."
    ),
    Facility(
        id="fac_lift",
        name="Lift",
        type="lift",
        location_node="lift_1",
        location_name="FOB 1",
        walking_time_mins=3,
        status="Available",
        operational=True,
        details="Priority elevator for senior citizens & passengers with luggage/wheelchairs."
    ),
    Facility(
        id="fac_helpdesk",
        name="Help Desk",
        type="helpdesk",
        location_node="helpdesk_main",
        location_name="Main Hall",
        walking_time_mins=3,
        status="Available 24/7",
        operational=True,
        details="Station master inquiry, Sahayata counter, porter & battery car booking."
    ),
    Facility(
        id="fac_holding",
        name="Holding Area",
        type="holding",
        location_node="holding_gate_b",
        location_name="Gate B",
        walking_time_mins=4,
        status="Moderate",
        operational=True,
        details="Air-conditioned lounge with charging sockets and real-time train display."
    ),
    Facility(
        id="fac_food",
        name="Food",
        type="food",
        location_node="food_concourse",
        location_name="Concourse",
        walking_time_mins=2,
        status="Open",
        operational=True,
        details="IRCTC Food Plaza: hot South/North Indian snacks, packaged food, bottled water."
    ),
]

TRAINS_DATABASE: Dict[str, TrainInfo] = {
    "12951": TrainInfo(
        number="12951",
        name="Rajdhani Express",
        route="Mumbai CSMT → New Delhi (NDLS)",
        platform=6,
        selected_coach="B4",
        selected_seat=42,
        boarding_time="10:10 PM",
        departure_time="10:25 PM",
        status="On time",
        coaches=["ENGINE", "A1", "A2", "B1", "B2", "B3", "B4", "C1"]
    ),
    "12009": TrainInfo(
        number="12009",
        name="Shatabdi Express",
        route="Mumbai CSMT → Ahmedabad (ADI)",
        platform=5,
        selected_coach="C2",
        selected_seat=18,
        boarding_time="06:05 AM",
        departure_time="06:20 AM",
        status="On time",
        coaches=["ENGINE", "E1", "C1", "C2", "C3", "C4", "C5"]
    ),
    "22221": TrainInfo(
        number="22221",
        name="Rajdhani Express (Central)",
        route="Mumbai CSMT → Hazrat Nizamuddin",
        platform=7,
        selected_coach="B2",
        selected_seat=33,
        boarding_time="03:45 PM",
        departure_time="04:00 PM",
        status="Boarding",
        coaches=["ENGINE", "H1", "A1", "B1", "B2", "B3", "B4"]
    )
}

INITIAL_ALERTS: List[AlertItem] = [
    AlertItem(
        id="alt-1",
        severity="critical",
        category="crowd",
        title="Platform 6 Congestion Alert",
        description="Platform 6 is currently crowded at 78% capacity. Congestion is predicted to surge to 88% in 15 minutes due to boarding.",
        related_location="Platform 6",
        timestamp="Just now",
        suggested_action="Consider approaching via North Entrance B & FOB 1 to bypass the central concourse rush.",
        is_read=False
    ),
    AlertItem(
        id="alt-2",
        severity="warning",
        category="route",
        title="Alternative Low-Crowd Entrance Recommended",
        description="Entrance B offers a 34% lower crowd density compared to Main Hall Entrance A (75%).",
        related_location="Entrance B",
        timestamp="3 mins ago",
        suggested_action="Use Entrance B for a significantly calmer boarding walk with ramp access.",
        is_read=False
    ),
    AlertItem(
        id="alt-3",
        severity="success",
        category="train",
        title="Train 12951 On Time Confirmation",
        description="Train 12951 Rajdhani Express is confirmed arriving on Platform 6. Departure scheduled at 10:25 PM.",
        related_location="Platform 6",
        timestamp="8 mins ago",
        suggested_action="Proceed towards Coach Zone B4 ahead of boarding time (10:10 PM).",
        is_read=False
    ),
    AlertItem(
        id="alt-4",
        severity="info",
        category="facility",
        title="Step-Free Lift 2 Operational",
        description="Lift 2 at Concourse South is operational with voice announcement & braille keypad.",
        related_location="Lift 2",
        timestamp="14 mins ago",
        suggested_action="Recommended for wheelchair users, elderly passengers, and heavy luggage.",
        is_read=False
    ),
    AlertItem(
        id="alt-5",
        severity="warning",
        category="crowd",
        title="FOB 2 Stairs Bottleneck",
        description="FOB 2 stairways are experiencing heavy two-way pedestrian movement.",
        related_location="FOB 2",
        timestamp="20 mins ago",
        suggested_action="Use FOB 1 North Bridge or Central Escalator for smoother transit.",
        is_read=False
    )
]

PLATFORM_CROWDS = {
    "Platform 1": 32,
    "Platform 2": 51,
    "Platform 3": 45,
    "Platform 4": 37,
    "Platform 5": 61,
    "Platform 6": 78,
    "Platform 7": 48
}
