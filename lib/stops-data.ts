export type RoutePhase = "outbound" | "turning-point" | "return"
export type RouteLegId = "outbound" | "return"
export type RouteStyle = "scenic-outbound" | "scenic-return"
export type StopType = "stay-friendly" | "scenic-only" | "transit"
export type StayOptionLabel = "A" | "B" | "C" | "D"

export interface SafetyRating {
  level: "excellent" | "good"
  risk: string
}

export interface StayRating {
  safety: SafetyRating
  convenience: 1 | 2 | 3 | 4 | 5
  cost: 1 | 2 | 3 | 4 | 5
  comfort: 1 | 2 | 3 | 4 | 5
}

export interface DogWalk {
  name: string
  type: "trail" | "park" | "beach" | "greenway" | "mixed"
  leashRequired: boolean
}

export interface StayRecommendation {
  id: string
  name: string
  location: string
  appleMapsQuery: string
  appleMapsUrl: string
  sourceType: "official" | "official-tourism" | "recreation" | "aggregator"
  notes: string
  verified: boolean
}

export interface StayOption {
  label: StayOptionLabel
  type: string
  name: string
  appleMapsQuery: string
  location: string
  dogFriendly: boolean
  shower: string
  groceryNearby: string
  notes: string
  rating: StayRating
  recommendations: StayRecommendation[]
}

export interface StopData {
  id: string
  stepNumber: number
  name: string
  shortName: string
  subtitle: string
  state: string
  distance: string
  totalMiles: number
  distanceMilesToNext: number
  driveTimeFromPrev: string
  stayDuration: string
  plannedStayLabel: string
  phase: RoutePhase
  legId: RouteLegId
  type: StopType
  appleMapsQuery: string
  areaWarnings: { rating: 1 | 2 | 3 | 4 | 5; summary: string }
  showerInfo: string
  groceryNearby: string
  dogWalks: DogWalk[]
  stayOptions: StayOption[]
  next: { label: string; stopId?: string }[]
}

function assertContinuousRoute(route: BaselineRouteStop[]): void {
  route.forEach((stop, index) => {
    if (stop.step !== index + 1) {
      throw new Error(`Route step gap detected at index ${index}: expected ${index + 1}, got ${stop.step}`)
    }
  })
}

const coords: Record<number, { lat: number; lng: number; x: number; y: number }> = {
  1: { lat: 40.7934, lng: -77.86, x: 83, y: 18 },
  2: { lat: 38.53, lng: -78.35, x: 77, y: 24 },
  3: { lat: 36.2, lng: -81.7, x: 72, y: 30 },
  4: { lat: 35.6118, lng: -83.4895, x: 68, y: 34 },
  5: { lat: 36.1627, lng: -86.7816, x: 62, y: 36 },
  6: { lat: 35.1495, lng: -90.049, x: 57, y: 38 },
  7: { lat: 34.7465, lng: -92.2896, x: 54, y: 39 },
  8: { lat: 35.4676, lng: -97.5164, x: 48, y: 40 },
  9: { lat: 35.2219, lng: -101.8313, x: 43, y: 41 },
  10: { lat: 35.687, lng: -105.9378, x: 38, y: 40 },
  11: { lat: 35.0844, lng: -106.6504, x: 37, y: 41 },
  12: { lat: 38.5733, lng: -109.5498, x: 31, y: 33 },
  13: { lat: 38.2969, lng: -111.2615, x: 29, y: 34 },
  14: { lat: 37.6283, lng: -112.1677, x: 28, y: 35 },
  15: { lat: 37.106, lng: -112.113, x: 27, y: 36 },
  16: { lat: 36.1699, lng: -115.1398, x: 22, y: 37 },
  17: { lat: 36.606, lng: -118.0629, x: 16, y: 35 },
  18: { lat: 40.5865, lng: -122.3917, x: 12, y: 25 },
  19: { lat: 41.2132, lng: -124.0046, x: 10, y: 23 },
  20: { lat: 42.0526, lng: -124.2839, x: 10, y: 21 },
  21: { lat: 44.0582, lng: -121.3153, x: 17, y: 18 },
  22: { lat: 43.615, lng: -116.2023, x: 24, y: 18 },
  23: { lat: 43.4917, lng: -112.0333, x: 28, y: 18 },
  24: { lat: 43.7904, lng: -110.6818, x: 23, y: 17 },
  25: { lat: 44.6621, lng: -111.1041, x: 23, y: 14 },
  26: { lat: 44.5263, lng: -109.0565, x: 27, y: 14 },
  27: { lat: 44.0805, lng: -103.231, x: 36, y: 16 },
  28: { lat: 43.546, lng: -96.7313, x: 46, y: 18 },
  29: { lat: 44.9778, lng: -93.265, x: 52, y: 16 },
  30: { lat: 45.0, lng: -87.0, x: 60, y: 16 },
  31: { lat: 44.877, lng: -86.061, x: 62, y: 16 },
  32: { lat: 41.8781, lng: -87.6298, x: 61, y: 22 },
  33: { lat: 40.4173, lng: -82.9071, x: 69, y: 22 },
  34: { lat: 40.2732, lng: -76.8867, x: 77, y: 20 },
  35: { lat: 42.6159, lng: -70.662, x: 93, y: 9 },
}

function mapStopType(type: BaselineRouteStop["type"]): StopType {
  if (type === "transit") return "transit"
  if (type === "end") return "transit"
  return "stay-friendly"
}

function buildStayOptions(stop: BaselineRouteStop): StayOption[] {
  return [
    {
      label: "A",
      type: "Recommended Stay",
      name: `${stop.name} Camp/Stay A`,
      appleMapsQuery: `${stop.name} Camp/Stay A`,
      location: stop.region,
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Recommended baseline",
      rating: {
        safety: { level: "excellent", risk: "Low" },
        convenience: 4,
        cost: 3,
        comfort: 4,
      },
    },
    {
      label: "B",
      type: "Fallback Stay",
      name: `${stop.name} Stay B`,
      appleMapsQuery: `${stop.name} Stay B`,
      location: stop.region,
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Fallback",
      rating: {
        safety: { level: "excellent", risk: "Moderate traffic" },
        convenience: 4,
        cost: 3,
        comfort: 4,
      },
    },
    {
      label: "C",
      type: "Remote Option",
      name: `${stop.name} Remote C`,
      appleMapsQuery: `${stop.name} Remote C`,
      location: stop.region,
      dogFriendly: true,
      shower: "none",
      groceryNearby: "20-30 min",
      spaced: true,
      isRemote: true,
      notes: "Remote option",
      rating: {
        safety: { level: "good", risk: "Limited services" },
        convenience: 2,
        cost: 5,
        comfort: 2,
      },
    },
    {
      label: "D",
      type: "Safety Fallback",
      name: `${stop.name} Hotel D`,
      appleMapsQuery: `${stop.name} Hotel D`,
      location: stop.region,
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: false,
      isRemote: false,
      notes: "Safety fallback",
      rating: {
        safety: { level: "excellent", risk: "Controlled area" },
        convenience: 5,
        cost: 2,
        comfort: 5,
      },
    },
  ]
}

const REAL_STAY_OPTIONS_FIRST_FIVE: Record<number, StayOption[]> = {
  1: [
    {
      label: "A",
      type: "Recommended Stay",
      name: "Black Moshannon State Park Campground",
      appleMapsQuery: "Black Moshannon State Park Campground",
      location: "Central Pennsylvania",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "B",
      type: "Fallback Stay",
      name: "Poe Paddy State Park Campground",
      appleMapsQuery: "Poe Paddy State Park Campground",
      location: "Central Pennsylvania",
      dogFriendly: true,
      shower: "nearby",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "good", risk: "Low" }, convenience: 3, cost: 4, comfort: 3 },
    },
    {
      label: "C",
      type: "Remote Option",
      name: "Bald Eagle State Forest",
      appleMapsQuery: "Bald Eagle State Forest",
      location: "Central Pennsylvania",
      dogFriendly: true,
      shower: "none",
      groceryNearby: "20-30 min",
      spaced: true,
      isRemote: true,
      notes: "Lower certainty",
      rating: { safety: { level: "good", risk: "Limited services" }, convenience: 2, cost: 5, comfort: 2 },
    },
    {
      label: "D",
      type: "Safety Fallback",
      name: "The Penn Stater Hotel",
      appleMapsQuery: "The Penn Stater Hotel",
      location: "Central Pennsylvania",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: false,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Controlled area" }, convenience: 5, cost: 2, comfort: 5 },
    },
  ],
  2: [
    {
      label: "A",
      type: "Recommended Stay",
      name: "Loft Mountain Campground",
      appleMapsQuery: "Loft Mountain Campground",
      location: "Virginia",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "B",
      type: "Fallback Stay",
      name: "Big Meadows Campground",
      appleMapsQuery: "Big Meadows Campground",
      location: "Virginia",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "C",
      type: "Remote Option",
      name: "George Washington National Forest dispersed",
      appleMapsQuery: "George Washington National Forest dispersed",
      location: "Virginia",
      dogFriendly: true,
      shower: "none",
      groceryNearby: "20-30 min",
      spaced: true,
      isRemote: true,
      notes: "Lower certainty",
      rating: { safety: { level: "good", risk: "Limited services" }, convenience: 2, cost: 5, comfort: 2 },
    },
    {
      label: "D",
      type: "Safety Fallback",
      name: "Skyland Lodge",
      appleMapsQuery: "Skyland Lodge",
      location: "Virginia",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: false,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Controlled area" }, convenience: 5, cost: 2, comfort: 5 },
    },
  ],
  3: [
    {
      label: "A",
      type: "Recommended Stay",
      name: "Julian Price Campground",
      appleMapsQuery: "Julian Price Campground",
      location: "Virginia / North Carolina corridor",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "B",
      type: "Fallback Stay",
      name: "Linville Falls Campground",
      appleMapsQuery: "Linville Falls Campground",
      location: "Virginia / North Carolina corridor",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "C",
      type: "Remote Option",
      name: "Pisgah National Forest dispersed",
      appleMapsQuery: "Pisgah National Forest dispersed",
      location: "Virginia / North Carolina corridor",
      dogFriendly: true,
      shower: "none",
      groceryNearby: "20-30 min",
      spaced: true,
      isRemote: true,
      notes: "Lower certainty",
      rating: { safety: { level: "good", risk: "Limited services" }, convenience: 2, cost: 5, comfort: 2 },
    },
    {
      label: "D",
      type: "Safety Fallback",
      name: "Boxwood Lodge",
      appleMapsQuery: "Boxwood Lodge",
      location: "Virginia / North Carolina corridor",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: false,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Controlled area" }, convenience: 5, cost: 2, comfort: 5 },
    },
  ],
  4: [
    {
      label: "A",
      type: "Recommended Stay",
      name: "Elkmont Campground",
      appleMapsQuery: "Elkmont Campground",
      location: "Tennessee / North Carolina",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "B",
      type: "Fallback Stay",
      name: "Smokemont Campground",
      appleMapsQuery: "Smokemont Campground",
      location: "Tennessee / North Carolina",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "C",
      type: "Remote Option",
      name: "Cherokee National Forest dispersed",
      appleMapsQuery: "Cherokee National Forest dispersed",
      location: "Tennessee / North Carolina",
      dogFriendly: true,
      shower: "none",
      groceryNearby: "20-30 min",
      spaced: true,
      isRemote: true,
      notes: "Lower certainty",
      rating: { safety: { level: "good", risk: "Limited services" }, convenience: 2, cost: 5, comfort: 2 },
    },
    {
      label: "D",
      type: "Safety Fallback",
      name: "Whispering Winds Cabins",
      appleMapsQuery: "Whispering Winds Cabins",
      location: "Tennessee / North Carolina",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: false,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Controlled area" }, convenience: 5, cost: 2, comfort: 5 },
    },
  ],
  5: [
    {
      label: "A",
      type: "Recommended Stay",
      name: "Montgomery Bell State Park Campground",
      appleMapsQuery: "Montgomery Bell State Park Campground",
      location: "Tennessee",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "B",
      type: "Fallback Stay",
      name: "Montgomery Bell State Park Campground (Fallback)",
      appleMapsQuery: "Montgomery Bell State Park Campground",
      location: "Tennessee",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: true,
      isRemote: false,
      notes: "Fallback",
      rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 4, comfort: 3 },
    },
    {
      label: "C",
      type: "Remote Option",
      name: "Not enough verified remote candidate yet",
      appleMapsQuery: "Not enough verified remote candidate yet",
      location: "Tennessee",
      dogFriendly: true,
      shower: "none",
      groceryNearby: "20-30 min",
      spaced: true,
      isRemote: true,
      notes: "Lower certainty",
      rating: { safety: { level: "good", risk: "Limited services" }, convenience: 2, cost: 5, comfort: 2 },
    },
    {
      label: "D",
      type: "Safety Fallback",
      name: "1 Hotel Nashville",
      appleMapsQuery: "1 Hotel Nashville",
      location: "Tennessee",
      dogFriendly: true,
      shower: "on-site",
      groceryNearby: "Nearby",
      spaced: false,
      isRemote: false,
      notes: "Verified place",
      rating: { safety: { level: "excellent", risk: "Controlled area" }, convenience: 5, cost: 2, comfort: 5 },
    },
  ],
}

function getStayOptionsForStop(stop: BaselineRouteStop): StayOption[] {
  if (stop.step >= 1 && stop.step <= 5) {
    return REAL_STAY_OPTIONS_FIRST_FIVE[stop.step]
  }

  return buildStayOptions(stop)
}

assertContinuousRoute(baselineRoute1)

if (baselineRoute1.length !== 35) {
  throw new Error(`Expected 35 baseline stops, received ${baselineRoute1.length}`)
}

if (baselineRoute1WithDistance.length !== baselineRoute1.length) {
  throw new Error(`Expected ${baselineRoute1.length} segment entries, received ${baselineRoute1WithDistance.length}`)
}

const segmentDistanceByStep = new Map<number, number>(
  baselineRoute1WithDistance.map((segment) => [segment.step, segment.distanceMilesToNext])
)

function getMilesTraveledToStep(step: number): number {
  if (step <= 0) return 0

  let total = HOME_TO_FIRST_STOP_MILES

  for (let currentStep = 1; currentStep < step; currentStep += 1) {
    total += segmentDistanceByStep.get(currentStep) ?? 0
  }

  return total
}

export const stopsData: StopData[] = [
  {
    id: "3",
    stepNumber: 3,
    name: "Blue Ridge Parkway, NC",
    shortName: "Blue Ridge",
    subtitle: "Blue Ridge Parkway, NC",
    state: "Blue Ridge Parkway, NC",
    distance: "Verified stop",
    totalMiles: 630,
    distanceMilesToNext: 210,
    driveTimeFromPrev: "3–4 hr",
    stayDuration: "1 night",
    plannedStayLabel: "Safety-first stay",
    phase: "outbound",
    legId: "outbound",
    type: "stay-friendly",
    appleMapsQuery: "Blue Ridge Parkway, NC",
    areaWarnings: { rating: 2, summary: "Safety-first filtered for dog-friendly stays and quieter options." },
    showerInfo: "Camp showers or nearby indoor fallback",
    groceryNearby: "Nearby town groceries available",
    dogWalks: [
      { name: "Julian Price Memorial Park trails", type: "trail", leashRequired: true },
      { name: "Moses H. Cone carriage trails", type: "trail", leashRequired: true },
    ],
    stayOptions: [
      {
        label: "A",
        type: "Recommended",
        name: "Julian Price Campground",
        location: "Blue Ridge Parkway, NC",
        dogFriendly: true,
        shower: "Available",
        groceryNearby: "Nearby town services",
        notes: "Primary quiet dog-friendly pick.",
        rating: { safety: { level: "excellent", risk: "Standard campground awareness" }, convenience: 4, cost: 3, comfort: 4 },
        recommendations: [
          rec("3", "A", 1, "Julian Price Campground", "Blue Ridge Parkway, NC", "Top verified candidate"),
          rec("3", "A", 2, "Linville Falls Campground", "Blue Ridge Parkway, NC", "Second verified candidate"),
          rec("3", "A", 3, "Boxwood Lodge", "Blue Ridge Parkway, NC", "Indoor fallback if weather or arrival timing shifts"),
        ],
      },
      {
        label: "B",
        type: "Fallback",
        name: "Linville Falls Campground",
        location: "Blue Ridge Parkway, NC",
        dogFriendly: true,
        shower: "Available or nearby",
        groceryNearby: "Nearby town services",
        notes: "Backup if A is full.",
        rating: { safety: { level: "good", risk: "Check current availability and spacing" }, convenience: 4, cost: 3, comfort: 3 },
        recommendations: [
          rec("3", "B", 1, "Linville Falls Campground", "Blue Ridge Parkway, NC", "Fallback verified candidate"),
          rec("3", "B", 2, "Julian Price Campground", "Blue Ridge Parkway, NC", "Use if fallback inventory changes"),
          rec("3", "B", 3, "Boxwood Lodge", "Blue Ridge Parkway, NC", "Indoor fallback"),
        ],
      },
      {
        label: "C",
        type: "Remote Option",
        name: "Pisgah National Forest dispersed area",
        location: "Blue Ridge Parkway, NC",
        dogFriendly: true,
        shower: "Usually none",
        groceryNearby: "Stock up first",
        notes: "Remote option only when verified comfortable on arrival.",
        rating: { safety: { level: "good", risk: "Lower services and weaker certainty" }, convenience: 2, cost: 5, comfort: 2 },
        recommendations: [
          rec("3", "C", 1, "Pisgah National Forest dispersed area", "Blue Ridge Parkway, NC", "Remote-style option"),
          rec("3", "C", 2, "Julian Price Campground", "Blue Ridge Parkway, NC", "Use A instead if uncertainty remains"),
          rec("3", "C", 3, "Boxwood Lodge", "Blue Ridge Parkway, NC", "Indoor fallback if needed"),
        ],
      },
      {
        label: "D",
        type: "Safety Fallback",
        name: "Boxwood Lodge",
        location: "Blue Ridge Parkway, NC",
        dogFriendly: true,
        shower: "Private bathroom / hotel",
        groceryNearby: "Nearby town services",
        notes: "Best fallback for late arrival, weather, or safety concerns.",
        rating: { safety: { level: "excellent", risk: "Urban or lodge norms only" }, convenience: 5, cost: 2, comfort: 5 },
        recommendations: [
          rec("3", "D", 1, "Boxwood Lodge", "Blue Ridge Parkway, NC", "Primary indoor fallback"),
          rec("3", "D", 2, "Julian Price Campground", "Blue Ridge Parkway, NC", "Return to campsite if conditions fit"),
          rec("3", "D", 3, "Linville Falls Campground", "Blue Ridge Parkway, NC", "Second outdoor fallback"),
        ],
      },
    ],
    next: [{ label: "Next", stopId: "4" }],
  },
  {
    id: "4",
    stepNumber: 4,
    name: "Great Smoky Mountains, TN/NC",
    shortName: "Smokies",
    subtitle: "Great Smoky Mountains, TN/NC",
    state: "Great Smoky Mountains, TN/NC",
    distance: "Verified stop",
    totalMiles: 840,
    distanceMilesToNext: 210,
    driveTimeFromPrev: "3–4 hr",
    stayDuration: "1 night",
    plannedStayLabel: "Safety-first stay",
    phase: "outbound",
    legId: "outbound",
    type: "stay-friendly",
    appleMapsQuery: "Great Smoky Mountains National Park",
    areaWarnings: { rating: 2, summary: "Safety-first filtered for dog-friendly stays and quieter options." },
    showerInfo: "Camp showers or nearby indoor fallback",
    groceryNearby: "Nearby town groceries available",
    dogWalks: [
      { name: "Gatlinburg Trail", type: "trail", leashRequired: true },
      { name: "Oconaluftee River Trail", type: "trail", leashRequired: true },
    ],
    stayOptions: [
      {
        label: "A",
        type: "Recommended",
        name: "Elkmont Campground",
        location: "Great Smoky Mountains, TN/NC",
        dogFriendly: true,
        shower: "Available",
        groceryNearby: "Nearby town services",
        notes: "Primary quiet dog-friendly pick.",
        rating: { safety: { level: "excellent", risk: "Standard campground awareness" }, convenience: 4, cost: 3, comfort: 4 },
        recommendations: [
          rec("4", "A", 1, "Elkmont Campground", "Great Smoky Mountains, TN/NC", "Top verified candidate"),
          rec("4", "A", 2, "Smokemont Campground", "Great Smoky Mountains, TN/NC", "Second verified candidate"),
          rec("4", "A", 3, "Whispering Winds Log Cabins", "Great Smoky Mountains, TN/NC", "Indoor fallback if weather or arrival timing shifts"),
        ],
      },
      {
        label: "B",
        type: "Fallback",
        name: "Smokemont Campground",
        location: "Great Smoky Mountains, TN/NC",
        dogFriendly: true,
        shower: "Available or nearby",
        groceryNearby: "Nearby town services",
        notes: "Backup if A is full.",
        rating: { safety: { level: "good", risk: "Check current availability and spacing" }, convenience: 4, cost: 3, comfort: 3 },
        recommendations: [
          rec("4", "B", 1, "Smokemont Campground", "Great Smoky Mountains, TN/NC", "Fallback verified candidate"),
          rec("4", "B", 2, "Elkmont Campground", "Great Smoky Mountains, TN/NC", "Use if fallback inventory changes"),
          rec("4", "B", 3, "Whispering Winds Log Cabins", "Great Smoky Mountains, TN/NC", "Indoor fallback"),
        ],
      },
      {
        label: "C",
        type: "Remote Option",
        name: "Cherokee National Forest dispersed area",
        location: "Great Smoky Mountains, TN/NC",
        dogFriendly: true,
        shower: "Usually none",
        groceryNearby: "Stock up first",
        notes: "Remote option only when verified comfortable on arrival.",
        rating: { safety: { level: "good", risk: "Lower services and weaker certainty" }, convenience: 2, cost: 5, comfort: 2 },
        recommendations: [
          rec("4", "C", 1, "Cherokee National Forest dispersed area", "Great Smoky Mountains, TN/NC", "Remote-style option"),
          rec("4", "C", 2, "Elkmont Campground", "Great Smoky Mountains, TN/NC", "Use A instead if uncertainty remains"),
          rec("4", "C", 3, "Whispering Winds Log Cabins", "Great Smoky Mountains, TN/NC", "Indoor fallback if needed"),
        ],
      },
      {
        label: "D",
        type: "Safety Fallback",
        name: "Whispering Winds Log Cabins",
        location: "Great Smoky Mountains, TN/NC",
        dogFriendly: true,
        shower: "Private bathroom / hotel",
        groceryNearby: "Nearby town services",
        notes: "Best fallback for late arrival, weather, or safety concerns.",
        rating: { safety: { level: "excellent", risk: "Urban or lodge norms only" }, convenience: 5, cost: 2, comfort: 5 },
        recommendations: [
          rec("4", "D", 1, "Whispering Winds Log Cabins", "Great Smoky Mountains, TN/NC", "Primary indoor fallback"),
          rec("4", "D", 2, "Elkmont Campground", "Great Smoky Mountains, TN/NC", "Return to campsite if conditions fit"),
          rec("4", "D", 3, "Smokemont Campground", "Great Smoky Mountains, TN/NC", "Second outdoor fallback"),
        ],
      },
    ],
    next: [{ label: "Next", stopId: "5" }],
  },
  {
    id: "5",
    stepNumber: 5,
    name: "Nashville, TN",
    shortName: "Nashville",
    subtitle: "Nashville, TN",
    state: "Nashville, TN",
    distance: "Verified stop",
    totalMiles: 1050,
    distanceMilesToNext: 210,
    driveTimeFromPrev: "3–4 hr",
    stayDuration: "1 night",
    plannedStayLabel: "Safety-first stay",
    phase: "outbound",
    legId: "outbound",
    type: "stay-friendly",
    appleMapsQuery: "Nashville, TN",
    areaWarnings: { rating: 2, summary: "Safety-first filtered for dog-friendly stays and quieter options." },
    showerInfo: "Camp showers or nearby indoor fallback",
    groceryNearby: "Nearby town groceries available",
    dogWalks: [
      { name: "Shelby Bottoms Greenway", type: "greenway", leashRequired: true },
      { name: "Warner Parks paved greenway", type: "greenway", leashRequired: true },
    ],
    stayOptions: [
      {
        label: "A",
        type: "Recommended",
        name: "Montgomery Bell State Park Campground",
        location: "Nashville, TN",
        dogFriendly: true,
        shower: "Available",
        groceryNearby: "Nearby town services",
        notes: "Primary quiet dog-friendly pick.",
        rating: { safety: { level: "excellent", risk: "Standard campground awareness" }, convenience: 4, cost: 3, comfort: 4 },
        recommendations: [
          rec("5", "A", 1, "Montgomery Bell State Park Campground", "Nashville, TN", "Top verified candidate"),
          rec("5", "A", 2, "1 Hotel Nashville", "Nashville, TN", "Indoor fallback if weather or arrival timing shifts"),
          rec("5", "A", 3, "Safe private dog-friendly campground fallback", "Nashville, TN", "Needs more hard verification"),
        ],
      },
      {
        label: "B",
        type: "Fallback",
        name: "Safe private dog-friendly campground fallback",
        location: "Nashville, TN",
        dogFriendly: true,
        shower: "Available or nearby",
        groceryNearby: "Nearby town services",
        notes: "Backup if A is full.",
        rating: { safety: { level: "good", risk: "Check current availability and spacing" }, convenience: 3, cost: 3, comfort: 3 },
        recommendations: [
          rec("5", "B", 1, "Safe private dog-friendly campground fallback", "Nashville, TN", "Needs more hard verification", false),
          rec("5", "B", 2, "Montgomery Bell State Park Campground", "Nashville, TN", "Use if fallback inventory changes"),
          rec("5", "B", 3, "1 Hotel Nashville", "Nashville, TN", "Indoor fallback"),
        ],
      },
      {
        label: "C",
        type: "Remote Option",
        name: "Not enough verified remote candidate yet",
        location: "Nashville, TN",
        dogFriendly: true,
        shower: "Unknown",
        groceryNearby: "Stock up first",
        notes: "No honest third remote-style candidate verified yet.",
        rating: { safety: { level: "good", risk: "Lower services and weaker certainty" }, convenience: 1, cost: 5, comfort: 1 },
        recommendations: [
          rec("5", "C", 1, "Not enough verified remote candidate yet", "Nashville, TN", "Display uncertainty in UI", false),
          rec("5", "C", 2, "Montgomery Bell State Park Campground", "Nashville, TN", "Use A instead if uncertainty remains"),
          rec("5", "C", 3, "1 Hotel Nashville", "Nashville, TN", "Indoor fallback if needed"),
        ],
      },
      {
        label: "D",
        type: "Safety Fallback",
        name: "1 Hotel Nashville",
        location: "Nashville, TN",
        dogFriendly: true,
        shower: "Private bathroom / hotel",
        groceryNearby: "Nearby town services",
        notes: "Best fallback for late arrival, weather, or safety concerns.",
        rating: { safety: { level: "excellent", risk: "Urban hotel norms only" }, convenience: 5, cost: 1, comfort: 5 },
        recommendations: [
          rec("5", "D", 1, "1 Hotel Nashville", "Nashville, TN", "Primary indoor fallback"),
          rec("5", "D", 2, "Montgomery Bell State Park Campground", "Nashville, TN", "Return to campsite if conditions fit"),
          rec("5", "D", 3, "Safe private dog-friendly campground fallback", "Nashville, TN", "Second outdoor fallback", false),
        ],
      },
    ],
    next: [{ label: "Next", stopId: "6" }],
  },
  ...baselineRoute1.map((stop, index) => {
    const phase: RoutePhase = stop.step < 19 ? "outbound" : stop.step === 19 ? "turning-point" : "return"
    const routeLeg: RouteLegId = phase === "return" || phase === "turning-point" ? "return" : "outbound"
    const routeStyle: RouteStyle = routeLeg === "return" ? "scenic-return" : "scenic-outbound"
    const point = coords[stop.step] ?? { lat: 39.5, lng: -98.35, x: 50, y: 25 }
    const plannedStayLabel = formatPlannedStay(stop.plannedStayDays)
    const distanceMilesToNext = segmentDistanceByStep.get(stop.step) ?? 0
    const totalMiles = getMilesTraveledToStep(stop.step)

    return {
      id: String(stop.step),
      order: stop.step,
      stepNumber: stop.step,
      name: stop.name,
      shortName: stop.name,
      state: stop.region,
      subtitle: stop.region,
      distance: `${totalMiles} mi traveled`,
      totalMiles,
      driveTimeFromPrev: `${stop.driveHoursFromPrevious}h`,
      stayDuration: plannedStayLabel,
      plannedStayLabel,
      plannedStayDays: stop.plannedStayDays,
      distanceMilesToNext,
      highlights: [stop.type],
      dogWalks: [{ name: `${stop.name} dog walk area`, type: "trail", leashRequired: true }],
      areaWarnings: { summary: stop.notes, rating: (stop.type === "transit" ? 2 : 3) as 2 | 3 },
      stayOptions: getStayOptionsForStop(stop),
      groceryNearby: "Nearby",
      showerInfo: "Shower available on-site or nearby by option",
      type: mapStopType(stop.type),
      phase,
      routeLeg,
      routeStyle,
      status: "future",
      x: point.x,
      y: point.y,
      lat: point.lat,
      lng: point.lng,
      next:
        index === baselineRoute1.length - 1
          ? [{ label: "Home", stopId: "0" }]
          : [{ label: baselineRoute1[index + 1].name, stopId: String(baselineRoute1[index + 1].step) }],
      appleMapsQuery: `${stop.name}, ${stop.region}`,
    }
  }),
]

export const stopsData: StopData[] = [
  ...firstFive,
  ...Array.from({ length: 30 }, (_, i) => makePlaceholderStop(i + 6)),
]

export function getStopById(id: string) {
  return stopsData.find((stop) => stop.id === id) ?? null
}

export function getStayOptions(stop: StopData) {
  return stop.stayOptions
}

export function getMilesToNextStop(id: string) {
  const stop = getStopById(id)
  return stop?.distanceMilesToNext ?? 0
}

export function getMilesTraveled(id: string) {
  const stop = getStopById(id)
  return stop?.totalMiles ?? 0
}

export function calculateProgress(id: string) {
  const index = stopsData.findIndex((stop) => stop.id === id)
  if (index < 0) return 0
  return Math.round((index / Math.max(stopsData.length - 1, 1)) * 100)
}
