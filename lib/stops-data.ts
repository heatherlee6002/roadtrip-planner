export type StopType = "stay-friendly" | "scenic-only" | "transit"
export type RoutePhase = "outbound" | "turning-point" | "return"
export type RouteLegId = "outbound" | "return"
export type RouteStyle = "coastal" | "inland"

export interface CandidateOption {
  letter: string
  name: string
  appleMapsQuery?: string
}

export interface DogWalkCandidate {
  primary: string
  primaryQuery?: string
  secondary?: string
  secondaryQuery?: string
  restrictions?: string
}

export interface CandidatePlanningData {
  // Static fallback planning data only. These are not live-validated listings.
  stayCandidates: CandidateOption[]
  dogWalkCandidates: DogWalkCandidate
  emergencyCandidates: { label: string; appleMapsQuery?: string }[]
  logistics: { groceries: string; groceriesQuery?: string; gas: string; gasQuery?: string }
}

export interface RouteStopSeed {
  id: string
  leg: RouteLegId
  style: RouteStyle
  phase: RoutePhase
  stepNumber?: number
  name: string
  shortName: string
  subtitle: string
  distance: string
  totalMiles: number
  lat: number
  lng: number
  x: number
  y: number
  type: StopType
  notes?: string
  appleMapsQuery: string
  candidateData: CandidatePlanningData
}

export interface StopData extends Omit<RouteStopSeed, "leg" | "style" | "candidateData"> {
  routeLeg: RouteLegId
  routeStyle: RouteStyle
  status: "start" | "current" | "upcoming" | "future" | "completed"
  next: { label: string; stopId?: string }[]
  // Backwards-compatible aliases used by current UI components.
  stay: CandidateOption[]
  dog: DogWalkCandidate
  emergency: { label: string; appleMapsQuery?: string }[]
  logistics: { groceries: string; groceriesQuery?: string; gas: string; gasQuery?: string }
}

export interface FallbackRouteMetadata {
  id: string
  name: string
  version: string
  startMode: "device-gps"
  endMode: "home"
  homeStopId: string
  description: string
}

export interface FallbackRoutePlan {
  metadata: FallbackRouteMetadata
  legs: {
    id: RouteLegId
    label: string
    style: RouteStyle
    stopIds: string[]
  }[]
}

// TODO(ai): Keep data static for now. Future AI strategy should consume this fallback route plan
// through lib/route-engine.ts without changing UI component contracts.
export const fallbackRoutePlan: FallbackRoutePlan = {
  metadata: {
    id: "fallback-east-coast-loop",
    name: "Fallback Coastal Outbound / Inland Return",
    version: "2026-04",
    startMode: "device-gps",
    endMode: "home",
    homeStopId: "0",
    description: "Static fallback corridor route. Ready for future agent-driven dynamic recommendations.",
  },
  legs: [
    {
      id: "outbound",
      label: "Outbound",
      style: "coastal",
      stopIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    {
      id: "return",
      label: "Return",
      style: "inland",
      stopIds: ["11", "12", "13", "14", "15", "16", "17", "18", "19"],
    },
  ],
}

const routeSeeds: RouteStopSeed[] = [
  {
    id: "0",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    name: "Home - Gloucester, MA",
    shortName: "Home",
    subtitle: "Trip base",
    distance: "Start",
    totalMiles: 0,
    lat: 42.6159,
    lng: -70.662,
    x: 92,
    y: 6,
    type: "stay-friendly",
    appleMapsQuery: "Gloucester, MA",
    candidateData: {
      stayCandidates: [],
      dogWalkCandidates: {
        primary: "Good Harbor Beach",
        primaryQuery: "Good Harbor Beach, Gloucester, MA",
        secondary: "Dogtown Commons trails",
        secondaryQuery: "Dogtown Commons, Gloucester, MA",
      },
      emergencyCandidates: [{ label: "Home base", appleMapsQuery: "Gloucester, MA" }],
      logistics: {
        groceries: "Market Basket (planning)",
        groceriesQuery: "Market Basket, Gloucester, MA",
        gas: "Route 128 fuel stops (planning)",
        gasQuery: "Gas Station, Route 128, MA",
      },
    },
  },
  {
    id: "1",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 1,
    name: "Massachusetts Coast",
    shortName: "MA Coast",
    subtitle: "South Shore / Cape corridor",
    distance: "75 mi",
    totalMiles: 75,
    lat: 42.0834,
    lng: -70.1786,
    x: 92,
    y: 10,
    type: "stay-friendly",
    appleMapsQuery: "Plymouth, MA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Scusset Beach State Reservation (planning)", appleMapsQuery: "Scusset Beach State Reservation, MA" },
        { letter: "B", name: "Cape Cod National Seashore area campgrounds (planning)", appleMapsQuery: "Cape Cod National Seashore, MA" },
      ],
      dogWalkCandidates: { primary: "Plymouth waterfront walks", primaryQuery: "Plymouth Waterfront, MA" },
      emergencyCandidates: [{ label: "Route 3 services", appleMapsQuery: "Hospital, Plymouth, MA" }],
      logistics: { groceries: "Market Basket / Stop & Shop (planning)", gas: "Route 3 exits (planning)" },
    },
  },
  {
    id: "2",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 2,
    name: "Connecticut Coast",
    shortName: "CT Coast",
    subtitle: "Mystic / New London",
    distance: "170 mi",
    totalMiles: 170,
    lat: 41.3557,
    lng: -72.0995,
    x: 88,
    y: 15,
    type: "stay-friendly",
    appleMapsQuery: "Mystic, CT",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Rocky Neck SP campground (planning)", appleMapsQuery: "Rocky Neck State Park, CT" },
        { letter: "B", name: "Mystic private RV parks (planning)", appleMapsQuery: "Campground, Mystic, CT" },
      ],
      dogWalkCandidates: { primary: "Mystic River greenway", primaryQuery: "Mystic River Park, CT" },
      emergencyCandidates: [{ label: "I-95 coastal services", appleMapsQuery: "Urgent Care, New London, CT" }],
      logistics: { groceries: "Big Y / Stop & Shop (planning)", gas: "I-95 exits (planning)" },
    },
  },
  {
    id: "3",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 3,
    name: "New Jersey Shore",
    shortName: "NJ Shore",
    subtitle: "Asbury to Cape May corridor",
    distance: "300 mi",
    totalMiles: 300,
    lat: 39.3556,
    lng: -74.4346,
    x: 84,
    y: 22,
    type: "stay-friendly",
    appleMapsQuery: "Atlantic City, NJ",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Island Beach area campgrounds (planning)", appleMapsQuery: "Island Beach State Park, NJ" },
        { letter: "B", name: "Cape May private stays (planning)", appleMapsQuery: "Campground, Cape May, NJ" },
      ],
      dogWalkCandidates: { primary: "Dog-friendly boardwalk segments", primaryQuery: "Asbury Park Dog Beach, NJ" },
      emergencyCandidates: [{ label: "Garden State Parkway service plazas", appleMapsQuery: "Hospital, Atlantic City, NJ" }],
      logistics: { groceries: "ShopRite (planning)", gas: "GS Parkway fuel (planning)" },
    },
  },
  {
    id: "4",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 4,
    name: "Delaware / Maryland Coast",
    shortName: "DE/MD Coast",
    subtitle: "Rehoboth to Ocean City",
    distance: "420 mi",
    totalMiles: 420,
    lat: 38.3365,
    lng: -75.0849,
    x: 80,
    y: 28,
    type: "stay-friendly",
    appleMapsQuery: "Ocean City, MD",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Assateague area camping (planning)", appleMapsQuery: "Assateague Island National Seashore" },
        { letter: "B", name: "Coastal private parks (planning)", appleMapsQuery: "Campground, Ocean City, MD" },
      ],
      dogWalkCandidates: { primary: "Assateague beach access points", primaryQuery: "Assateague Island National Seashore" },
      emergencyCandidates: [{ label: "US-50 / coastal routes", appleMapsQuery: "Hospital, Ocean City, MD" }],
      logistics: { groceries: "Food Lion (planning)", gas: "US-50 corridor (planning)" },
    },
  },
  {
    id: "5",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 5,
    name: "Virginia Coast",
    shortName: "VA Coast",
    subtitle: "Virginia Beach / Chesapeake Bay",
    distance: "590 mi",
    totalMiles: 590,
    lat: 36.8529,
    lng: -75.978,
    x: 78,
    y: 34,
    type: "stay-friendly",
    appleMapsQuery: "Virginia Beach, VA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "First Landing area stays (planning)", appleMapsQuery: "First Landing State Park, VA" },
        { letter: "B", name: "Virginia Beach RV parks (planning)", appleMapsQuery: "Campground, Virginia Beach, VA" },
      ],
      dogWalkCandidates: { primary: "Virginia Beach boardwalk mornings", primaryQuery: "Virginia Beach Boardwalk" },
      emergencyCandidates: [{ label: "Hampton Roads 24/7 services", appleMapsQuery: "Hospital, Virginia Beach, VA" }],
      logistics: { groceries: "Kroger / Harris Teeter (planning)", gas: "I-64 / US-13 fuel (planning)" },
    },
  },
  {
    id: "6",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 6,
    name: "Outer Banks",
    shortName: "Outer Banks",
    subtitle: "Nags Head / Hatteras",
    distance: "760 mi",
    totalMiles: 760,
    lat: 35.7796,
    lng: -75.466,
    x: 76,
    y: 40,
    type: "scenic-only",
    notes: "Scenic-heavy segment. Keep dog logistics conservative in protected areas.",
    appleMapsQuery: "Nags Head, NC",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Oregon Inlet campground area (planning)", appleMapsQuery: "Oregon Inlet Campground, NC" },
        { letter: "B", name: "Private OBX campgrounds (planning)", appleMapsQuery: "Campground, Nags Head, NC" },
      ],
      dogWalkCandidates: {
        primary: "Nags Head beach walks",
        primaryQuery: "Nags Head Beach, NC",
        restrictions: "Some national seashore zones may have seasonal dog rules",
      },
      emergencyCandidates: [{ label: "US-64 / US-158 services", appleMapsQuery: "Hospital, Nags Head, NC" }],
      logistics: { groceries: "Food Lion (planning)", gas: "Bridge approach stations (planning)" },
    },
  },
  {
    id: "7",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 7,
    name: "South Carolina Coast",
    shortName: "SC Coast",
    subtitle: "Myrtle / Charleston corridor",
    distance: "980 mi",
    totalMiles: 980,
    lat: 33.6891,
    lng: -78.8867,
    x: 72,
    y: 48,
    type: "stay-friendly",
    appleMapsQuery: "Myrtle Beach, SC",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Huntington Beach SP area (planning)", appleMapsQuery: "Huntington Beach State Park, SC" },
        { letter: "B", name: "Coastal SC private parks (planning)", appleMapsQuery: "Campground, Charleston, SC" },
      ],
      dogWalkCandidates: { primary: "Myrtle boardwalk + beach windows", primaryQuery: "Myrtle Beach Boardwalk" },
      emergencyCandidates: [{ label: "US-17 coastal services", appleMapsQuery: "Hospital, Myrtle Beach, SC" }],
      logistics: { groceries: "Publix / Food Lion (planning)", gas: "US-17 / I-26 fuel (planning)" },
    },
  },
  {
    id: "8",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 8,
    name: "Georgia Coast",
    shortName: "GA Coast",
    subtitle: "Savannah / Golden Isles",
    distance: "1180 mi",
    totalMiles: 1180,
    lat: 31.99,
    lng: -81.0932,
    x: 69,
    y: 56,
    type: "stay-friendly",
    appleMapsQuery: "Savannah, GA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Skidaway Island area camping (planning)", appleMapsQuery: "Skidaway Island State Park, GA" },
        { letter: "B", name: "Savannah private stays (planning)", appleMapsQuery: "Campground, Savannah, GA" },
      ],
      dogWalkCandidates: { primary: "Forsyth Park + waterfront loops", primaryQuery: "Forsyth Park, Savannah, GA" },
      emergencyCandidates: [{ label: "I-95 / Savannah services", appleMapsQuery: "Hospital, Savannah, GA" }],
      logistics: { groceries: "Publix / Kroger (planning)", gas: "I-95 fuel (planning)" },
    },
  },
  {
    id: "9",
    leg: "outbound",
    style: "coastal",
    phase: "outbound",
    stepNumber: 9,
    name: "Florida Coast",
    shortName: "FL Coast",
    subtitle: "Northeast to South Atlantic coast",
    distance: "1420 mi",
    totalMiles: 1420,
    lat: 27.6648,
    lng: -81.5158,
    x: 64,
    y: 66,
    type: "stay-friendly",
    appleMapsQuery: "West Palm Beach, FL",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "State park coastal camping (planning)", appleMapsQuery: "Jonathan Dickinson State Park, FL" },
        { letter: "B", name: "South FL private parks (planning)", appleMapsQuery: "Campground, West Palm Beach, FL" },
      ],
      dogWalkCandidates: { primary: "Atlantic dog beach windows", primaryQuery: "Jupiter Dog Beach, FL" },
      emergencyCandidates: [{ label: "Florida Turnpike / I-95 services", appleMapsQuery: "Hospital, West Palm Beach, FL" }],
      logistics: { groceries: "Publix (planning)", gas: "I-95 / Turnpike fuel (planning)" },
    },
  },
  {
    id: "10",
    leg: "outbound",
    style: "coastal",
    phase: "turning-point",
    stepNumber: 10,
    name: "Florida Keys / Overseas Highway",
    shortName: "Florida Keys",
    subtitle: "Turning point",
    distance: "1650 mi",
    totalMiles: 1650,
    lat: 24.5551,
    lng: -81.78,
    x: 60,
    y: 74,
    type: "stay-friendly",
    notes: "Turning point between coastal outbound and inland return.",
    appleMapsQuery: "Key West, FL",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Lower Keys camp areas (planning)", appleMapsQuery: "Boyd's Key West Campground" },
        { letter: "B", name: "Marathon private stays (planning)", appleMapsQuery: "Campground, Marathon, FL" },
      ],
      dogWalkCandidates: { primary: "Key West waterfront dog walks", primaryQuery: "Higgs Beach Dog Park, Key West, FL" },
      emergencyCandidates: [{ label: "US-1 Keys corridor services", appleMapsQuery: "Hospital, Key West, FL" }],
      logistics: { groceries: "Publix / Winn-Dixie (planning)", gas: "Overseas Highway stations (planning)" },
    },
  },
  {
    id: "11",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 11,
    name: "Florida Inland",
    shortName: "FL Inland",
    subtitle: "Lake Okeechobee / central corridor",
    distance: "1850 mi",
    totalMiles: 1850,
    lat: 28.5383,
    lng: -81.3792,
    x: 58,
    y: 66,
    type: "transit",
    appleMapsQuery: "Orlando, FL",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Central FL state parks (planning)", appleMapsQuery: "Lake Kissimmee State Park, FL" },
        { letter: "B", name: "Orlando inland camp options (planning)", appleMapsQuery: "Campground, Orlando, FL" },
      ],
      dogWalkCandidates: { primary: "Lakefront park loops", primaryQuery: "Lake Eola Park, Orlando, FL" },
      emergencyCandidates: [{ label: "Florida inland 24/7 services", appleMapsQuery: "Hospital, Orlando, FL" }],
      logistics: { groceries: "Publix / Aldi (planning)", gas: "Florida Turnpike fuel (planning)" },
    },
  },
  {
    id: "12",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 12,
    name: "Georgia Inland",
    shortName: "GA Inland",
    subtitle: "Macon / Atlanta corridor",
    distance: "2200 mi",
    totalMiles: 2200,
    lat: 33.749,
    lng: -84.388,
    x: 61,
    y: 56,
    type: "transit",
    appleMapsQuery: "Atlanta, GA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "State park inland campgrounds (planning)", appleMapsQuery: "Indian Springs State Park, GA" },
        { letter: "B", name: "Atlanta south private options (planning)", appleMapsQuery: "Campground, Atlanta, GA" },
      ],
      dogWalkCandidates: { primary: "Atlanta beltline sections", primaryQuery: "Atlanta BeltLine Eastside Trail" },
      emergencyCandidates: [{ label: "I-75 metro services", appleMapsQuery: "Hospital, Atlanta, GA" }],
      logistics: { groceries: "Kroger / Publix (planning)", gas: "I-75 fuel (planning)" },
    },
  },
  {
    id: "13",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 13,
    name: "South Carolina Inland",
    shortName: "SC Inland",
    subtitle: "Columbia / Midlands",
    distance: "2460 mi",
    totalMiles: 2460,
    lat: 34.0007,
    lng: -81.0348,
    x: 63,
    y: 50,
    type: "transit",
    appleMapsQuery: "Columbia, SC",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Congaree-adjacent camping (planning)", appleMapsQuery: "Congaree National Park, SC" },
        { letter: "B", name: "Columbia private stays (planning)", appleMapsQuery: "Campground, Columbia, SC" },
      ],
      dogWalkCandidates: { primary: "Riverfront Park dog loops", primaryQuery: "Riverfront Park, Columbia, SC" },
      emergencyCandidates: [{ label: "I-20 inland services", appleMapsQuery: "Hospital, Columbia, SC" }],
      logistics: { groceries: "Publix / Food Lion (planning)", gas: "I-20 / I-26 fuel (planning)" },
    },
  },
  {
    id: "14",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 14,
    name: "North Carolina Inland",
    shortName: "NC Inland",
    subtitle: "Raleigh / Durham corridor",
    distance: "2700 mi",
    totalMiles: 2700,
    lat: 35.7796,
    lng: -78.6382,
    x: 67,
    y: 44,
    type: "stay-friendly",
    appleMapsQuery: "Raleigh, NC",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Jordan Lake area camping (planning)", appleMapsQuery: "Jordan Lake State Recreation Area, NC" },
        { letter: "B", name: "Triangle private sites (planning)", appleMapsQuery: "Campground, Raleigh, NC" },
      ],
      dogWalkCandidates: { primary: "Neuse River greenway", primaryQuery: "Neuse River Trail, Raleigh, NC" },
      emergencyCandidates: [{ label: "I-40 inland services", appleMapsQuery: "Hospital, Raleigh, NC" }],
      logistics: { groceries: "Harris Teeter / Wegmans (planning)", gas: "I-40 corridor (planning)" },
    },
  },
  {
    id: "15",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 15,
    name: "Blue Ridge Area",
    shortName: "Blue Ridge",
    subtitle: "Asheville / Boone region",
    distance: "2950 mi",
    totalMiles: 2950,
    lat: 35.5951,
    lng: -82.5515,
    x: 70,
    y: 38,
    type: "stay-friendly",
    appleMapsQuery: "Blue Ridge Parkway, NC",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Blue Ridge parkway camp zones (planning)", appleMapsQuery: "Blue Ridge Parkway Campground" },
        { letter: "B", name: "Pisgah dispersed alternatives (planning)", appleMapsQuery: "Pisgah National Forest, NC" },
      ],
      dogWalkCandidates: { primary: "Blue Ridge overlooks + trailheads", primaryQuery: "Blue Ridge Parkway, NC" },
      emergencyCandidates: [{ label: "Mountain corridor services", appleMapsQuery: "Hospital, Asheville, NC" }],
      logistics: { groceries: "Ingles (planning)", gas: "US-221 / BRP approach fuel (planning)" },
    },
  },
  {
    id: "16",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 16,
    name: "Shenandoah Valley",
    shortName: "Shenandoah",
    subtitle: "Valley corridor",
    distance: "3230 mi",
    totalMiles: 3230,
    lat: 38.4496,
    lng: -78.8689,
    x: 73,
    y: 30,
    type: "stay-friendly",
    appleMapsQuery: "Harrisonburg, VA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Shenandoah campgrounds (planning)", appleMapsQuery: "Big Meadows Campground, VA" },
        { letter: "B", name: "Valley private options (planning)", appleMapsQuery: "Campground, Harrisonburg, VA" },
      ],
      dogWalkCandidates: { primary: "Valley rail trails", primaryQuery: "Shenandoah Valley Rail Trail" },
      emergencyCandidates: [{ label: "I-81 valley services", appleMapsQuery: "Hospital, Harrisonburg, VA" }],
      logistics: { groceries: "Kroger (planning)", gas: "I-81 corridor (planning)" },
    },
  },
  {
    id: "17",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 17,
    name: "Central Pennsylvania",
    shortName: "Central PA",
    subtitle: "State College corridor",
    distance: "3500 mi",
    totalMiles: 3500,
    lat: 40.7934,
    lng: -77.86,
    x: 77,
    y: 24,
    type: "transit",
    appleMapsQuery: "State College, PA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "State forest camp spots (planning)", appleMapsQuery: "Bald Eagle State Forest, PA" },
        { letter: "B", name: "State College private options (planning)", appleMapsQuery: "Campground, State College, PA" },
      ],
      dogWalkCandidates: { primary: "Bald Eagle trails", primaryQuery: "Bald Eagle State Park, PA" },
      emergencyCandidates: [{ label: "I-80 interior services", appleMapsQuery: "Hospital, State College, PA" }],
      logistics: { groceries: "Wegmans (planning)", gas: "I-80 exits (planning)" },
    },
  },
  {
    id: "18",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 18,
    name: "New York Interior",
    shortName: "NY Interior",
    subtitle: "Hudson valley / interior corridor",
    distance: "3750 mi",
    totalMiles: 3750,
    lat: 42.6526,
    lng: -73.7562,
    x: 83,
    y: 16,
    type: "transit",
    appleMapsQuery: "Albany, NY",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "State park inland camping (planning)", appleMapsQuery: "Thacher State Park, NY" },
        { letter: "B", name: "Hudson valley private options (planning)", appleMapsQuery: "Campground, Albany, NY" },
      ],
      dogWalkCandidates: { primary: "Mohawk-Hudson bike trail", primaryQuery: "Mohawk-Hudson Bike-Hike Trail" },
      emergencyCandidates: [{ label: "I-87 / I-90 inland services", appleMapsQuery: "Hospital, Albany, NY" }],
      logistics: { groceries: "Hannaford / Price Chopper (planning)", gas: "NYS thruway fuel (planning)" },
    },
  },
  {
    id: "19",
    leg: "return",
    style: "inland",
    phase: "return",
    stepNumber: 19,
    name: "Massachusetts Interior / Home",
    shortName: "MA Interior",
    subtitle: "Final inland leg to home",
    distance: "4000 mi",
    totalMiles: 4000,
    lat: 42.2626,
    lng: -71.8023,
    x: 88,
    y: 10,
    type: "transit",
    appleMapsQuery: "Worcester, MA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Central MA stopover options (planning)", appleMapsQuery: "Campground, Worcester, MA" },
        { letter: "B", name: "Direct push to home (planning)", appleMapsQuery: "Gloucester, MA" },
      ],
      dogWalkCandidates: { primary: "Local conservation trails en route", primaryQuery: "Wachusett Reservoir, MA" },
      emergencyCandidates: [{ label: "Mass Pike corridor services", appleMapsQuery: "Hospital, Worcester, MA" }],
      logistics: { groceries: "Stop & Shop (planning)", gas: "I-90 / Route 2 fuel (planning)" },
    },
  },
]

export const stopsData: StopData[] = routeSeeds.map((seed, index) => ({
  id: seed.id,
  name: seed.name,
  shortName: seed.shortName,
  distance: seed.distance,
  totalMiles: seed.totalMiles,
  subtitle: seed.subtitle,
  x: seed.x,
  y: seed.y,
  lat: seed.lat,
  lng: seed.lng,
  phase: seed.phase,
  type: seed.type,
  notes: seed.notes,
  stepNumber: seed.stepNumber,
  routeLeg: seed.leg,
  routeStyle: seed.style,
  status: index === 0 ? "start" : "future",
  stay: seed.candidateData.stayCandidates,
  dog: seed.candidateData.dogWalkCandidates,
  emergency: seed.candidateData.emergencyCandidates,
  logistics: seed.candidateData.logistics,
  next: index < routeSeeds.length - 1 ? [{ label: routeSeeds[index + 1].shortName, stopId: routeSeeds[index + 1].id }] : [{ label: "Home", stopId: "0" }],
  appleMapsQuery: seed.appleMapsQuery,
}))

export function getStopById(id: string): StopData | undefined {
  return stopsData.find((stop) => stop.id === id)
}

export function getNextStopIndex(currentIndex: number): number {
  return Math.min(currentIndex + 1, stopsData.length - 1)
}

export function getStopsByPhase(phase: RoutePhase): StopData[] {
  return stopsData.filter((stop) => stop.phase === phase)
}

export function getRouteStopsByLeg(leg: RouteLegId): StopData[] {
  return stopsData.filter((stop) => stop.routeLeg === leg)
}

export function calculateProgress(currentStopId: string): number {
  const currentStop = getStopById(currentStopId)
  if (!currentStop) return 0
  const totalMiles = stopsData[stopsData.length - 1].totalMiles
  return Math.round((currentStop.totalMiles / totalMiles) * 100)
}

export function findNearestStop(lat: number, lng: number): { stop: StopData; distanceMiles: number } | null {
  const R = 3959
  let closestStop: StopData | null = null
  let minDistance = Infinity

  for (const stop of stopsData) {
    const dLat = ((stop.lat - lat) * Math.PI) / 180
    const dLon = ((stop.lng - lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((stop.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    if (distance < minDistance) {
      minDistance = distance
      closestStop = stop
    }
  }

  if (closestStop) {
    return { stop: closestStop, distanceMiles: Math.round(minDistance) }
  }
  return null
}
