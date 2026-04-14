export type StopType = "stay-friendly" | "scenic-only" | "transit"
export type RoutePhase = "outbound" | "turning-point" | "return"
export type RouteLegId = "outbound" | "return"
export type RouteStyle = "scenic-outbound" | "scenic-return"

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
  anchorRegion: string
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
  anchorRegions: {
    outbound: string[]
    return: string[]
  }
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

// TODO(ai): Keep data static for now. Future AI strategy should consume this route plan
// via lib/route-engine.ts to enable dynamic recalc, scoring, and recommendation injection.
export const fallbackRoutePlan: FallbackRoutePlan = {
  metadata: {
    id: "cross-country-scenic-loop",
    name: "Cross-Country Scenic Loop",
    version: "2026-04",
    startMode: "device-gps",
    endMode: "home",
    homeStopId: "0",
    anchorRegions: {
      outbound: [
        "Home / New England",
        "Mid-Atlantic Transition",
        "Great Smoky Mountains",
        "Appalachian South",
        "Southern Inland Connector",
        "High Plains Connector",
        "Rockies Approach",
        "Yellowstone",
        "Grand Teton (optional)",
      ],
      return: [
        "Yellowstone / Tetons",
        "Northern Interior Corridor",
        "Great Lakes / Midwest",
        "Pennsylvania Interior",
        "New York Interior",
        "Home",
      ],
    },
    description: "Static nationwide scenic fallback loop with anchor regions for future AI-driven routing.",
  },
  legs: [
    {
      id: "outbound",
      label: "Outbound",
      style: "scenic-outbound",
      stopIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8"],
    },
    {
      id: "return",
      label: "Return",
      style: "scenic-return",
      stopIds: ["9", "10", "11", "12", "13"],
    },
  ],
}

const routeSeeds: RouteStopSeed[] = [
  {
    id: "0",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    anchorRegion: "Home / New England",
    name: "Home - Gloucester, MA",
    shortName: "Home",
    subtitle: "New England home base",
    distance: "Start",
    totalMiles: 0,
    lat: 42.6159,
    lng: -70.662,
    x: 93,
    y: 8,
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
      logistics: { groceries: "Market Basket (planning)", gas: "Route 128 fuel stops (planning)" },
    },
  },
  {
    id: "1",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    stepNumber: 1,
    anchorRegion: "Mid-Atlantic Transition",
    name: "Mid-Atlantic Transition",
    shortName: "Mid-Atlantic",
    subtitle: "PA / VA transition corridor",
    distance: "420 mi",
    totalMiles: 420,
    lat: 39.9526,
    lng: -75.1652,
    x: 84,
    y: 17,
    type: "transit",
    appleMapsQuery: "Philadelphia, PA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "State park camp areas (planning)", appleMapsQuery: "French Creek State Park, PA" },
        { letter: "B", name: "I-95 private stays (planning)", appleMapsQuery: "Campground, Philadelphia, PA" },
      ],
      dogWalkCandidates: { primary: "Schuylkill River trail segments", primaryQuery: "Schuylkill River Trail, PA" },
      emergencyCandidates: [{ label: "I-95 / I-76 service corridors", appleMapsQuery: "Hospital, Philadelphia, PA" }],
      logistics: { groceries: "Wegmans / Giant (planning)", gas: "Interstate exits (planning)" },
    },
  },
  {
    id: "2",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    stepNumber: 2,
    anchorRegion: "Great Smoky Mountains",
    name: "Great Smoky Mountains",
    shortName: "Smokies",
    subtitle: "National park gateway",
    distance: "980 mi",
    totalMiles: 980,
    lat: 35.6118,
    lng: -83.4895,
    x: 69,
    y: 31,
    type: "stay-friendly",
    notes: "Scenic anchor. Dog access varies by trail in park zones.",
    appleMapsQuery: "Gatlinburg, TN",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Park-adjacent campgrounds (planning)", appleMapsQuery: "Elkmont Campground, TN" },
        { letter: "B", name: "Cherokee NF dispersed options (planning)", appleMapsQuery: "Cherokee National Forest, TN" },
      ],
      dogWalkCandidates: {
        primary: "Gatlinburg Trail + nearby forest roads",
        primaryQuery: "Gatlinburg Trailhead, TN",
        restrictions: "Park trail rules vary by area and season",
      },
      emergencyCandidates: [{ label: "US-441 and I-40 services", appleMapsQuery: "Hospital, Sevierville, TN" }],
      logistics: { groceries: "Food City / Kroger (planning)", gas: "US-441 fuel (planning)" },
    },
  },
  {
    id: "3",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    stepNumber: 3,
    anchorRegion: "Appalachian South",
    name: "Appalachian South",
    shortName: "App South",
    subtitle: "Northern Georgia mountains",
    distance: "1180 mi",
    totalMiles: 1180,
    lat: 34.627,
    lng: -83.193,
    x: 66,
    y: 39,
    type: "stay-friendly",
    appleMapsQuery: "Blue Ridge, GA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Chattahoochee NF camping (planning)", appleMapsQuery: "Chattahoochee National Forest, GA" },
        { letter: "B", name: "Mountain private camp options (planning)", appleMapsQuery: "Campground, Blue Ridge, GA" },
      ],
      dogWalkCandidates: { primary: "Mountain overlooks + forest paths", primaryQuery: "Blue Ridge, GA trails" },
      emergencyCandidates: [{ label: "US-76 mountain services", appleMapsQuery: "Hospital, Blue Ridge, GA" }],
      logistics: { groceries: "Ingles / Publix (planning)", gas: "US-76 stops (planning)" },
    },
  },
  {
    id: "4",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    stepNumber: 4,
    anchorRegion: "Southern Inland Connector",
    name: "Southern Inland Connector",
    shortName: "Southern Inland",
    subtitle: "AL / MS / AR connector",
    distance: "1520 mi",
    totalMiles: 1520,
    lat: 34.7465,
    lng: -92.2896,
    x: 53,
    y: 46,
    type: "transit",
    appleMapsQuery: "Little Rock, AR",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "State park connector camps (planning)", appleMapsQuery: "Pinnacle Mountain State Park, AR" },
        { letter: "B", name: "Interstate private stays (planning)", appleMapsQuery: "Campground, Little Rock, AR" },
      ],
      dogWalkCandidates: { primary: "Riverfront greenway breaks", primaryQuery: "Arkansas River Trail" },
      emergencyCandidates: [{ label: "I-40 inland services", appleMapsQuery: "Hospital, Little Rock, AR" }],
      logistics: { groceries: "Kroger / Walmart (planning)", gas: "I-40 and I-30 fuel (planning)" },
    },
  },
  {
    id: "5",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    stepNumber: 5,
    anchorRegion: "High Plains Connector",
    name: "High Plains Connector",
    shortName: "High Plains",
    subtitle: "Kansas / eastern Colorado",
    distance: "2080 mi",
    totalMiles: 2080,
    lat: 38.9717,
    lng: -95.2353,
    x: 41,
    y: 38,
    type: "transit",
    appleMapsQuery: "Topeka, KS",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Corps + state park camps (planning)", appleMapsQuery: "Clinton State Park, KS" },
        { letter: "B", name: "I-70 corridor private options (planning)", appleMapsQuery: "Campground, Topeka, KS" },
      ],
      dogWalkCandidates: { primary: "Prairie trail breaks", primaryQuery: "Shunga Trail, Topeka, KS" },
      emergencyCandidates: [{ label: "I-70 services", appleMapsQuery: "Hospital, Topeka, KS" }],
      logistics: { groceries: "Dillons / Walmart (planning)", gas: "I-70 exits (planning)" },
    },
  },
  {
    id: "6",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    stepNumber: 6,
    anchorRegion: "Rockies Approach",
    name: "Rockies Approach",
    shortName: "Rockies",
    subtitle: "Front Range access",
    distance: "2450 mi",
    totalMiles: 2450,
    lat: 39.7392,
    lng: -104.9903,
    x: 29,
    y: 30,
    type: "stay-friendly",
    appleMapsQuery: "Denver, CO",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Foothill camp zones (planning)", appleMapsQuery: "Golden Gate Canyon State Park, CO" },
        { letter: "B", name: "Front Range private stays (planning)", appleMapsQuery: "Campground, Denver, CO" },
      ],
      dogWalkCandidates: { primary: "Front range trailheads", primaryQuery: "Red Rocks Park, CO" },
      emergencyCandidates: [{ label: "I-25 / I-70 metro services", appleMapsQuery: "Hospital, Denver, CO" }],
      logistics: { groceries: "King Soopers (planning)", gas: "I-70 mountain approach fuel (planning)" },
    },
  },
  {
    id: "7",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "outbound",
    stepNumber: 7,
    anchorRegion: "Yellowstone",
    name: "Yellowstone",
    shortName: "Yellowstone",
    subtitle: "Primary western scenic anchor",
    distance: "2920 mi",
    totalMiles: 2920,
    lat: 44.428,
    lng: -110.5885,
    x: 19,
    y: 20,
    type: "scenic-only",
    notes: "Scenic anchor. Dog access is restricted in many park areas.",
    appleMapsQuery: "Yellowstone National Park",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Gateway town campgrounds (planning)", appleMapsQuery: "West Yellowstone, MT campgrounds" },
        { letter: "B", name: "National forest alternatives (planning)", appleMapsQuery: "Gallatin National Forest" },
      ],
      dogWalkCandidates: {
        primary: "Gateway town walks + NF alternatives",
        primaryQuery: "West Yellowstone, MT",
        restrictions: "Most park trails restrict dogs",
      },
      emergencyCandidates: [{ label: "Park gateway services", appleMapsQuery: "Hospital, Bozeman, MT" }],
      logistics: { groceries: "Gateway supermarkets (planning)", gas: "Park gateway fuel (planning)" },
    },
  },
  {
    id: "8",
    leg: "outbound",
    style: "scenic-outbound",
    phase: "turning-point",
    stepNumber: 8,
    anchorRegion: "Grand Teton (optional)",
    name: "Grand Teton (Optional)",
    shortName: "Grand Teton",
    subtitle: "Optional adjacent scenic anchor",
    distance: "3010 mi",
    totalMiles: 3010,
    lat: 43.7904,
    lng: -110.6818,
    x: 20,
    y: 24,
    type: "scenic-only",
    notes: "Optional stop before starting return leg.",
    appleMapsQuery: "Grand Teton National Park",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Jackson area camp options (planning)", appleMapsQuery: "Campground, Jackson, WY" },
        { letter: "B", name: "Bridger-Teton NF alternatives (planning)", appleMapsQuery: "Bridger-Teton National Forest" },
      ],
      dogWalkCandidates: { primary: "Jackson valley paths", primaryQuery: "Jackson, WY trails", restrictions: "Park trail restrictions may apply" },
      emergencyCandidates: [{ label: "Jackson gateway services", appleMapsQuery: "Hospital, Jackson, WY" }],
      logistics: { groceries: "Jackson grocery stops (planning)", gas: "US-191 / US-26 fuel (planning)" },
    },
  },
  {
    id: "9",
    leg: "return",
    style: "scenic-return",
    phase: "return",
    stepNumber: 9,
    anchorRegion: "Northern Interior Corridor",
    name: "Northern Interior Corridor",
    shortName: "Northern Interior",
    subtitle: "Montana / Dakotas transit",
    distance: "3500 mi",
    totalMiles: 3500,
    lat: 46.8083,
    lng: -100.7837,
    x: 38,
    y: 16,
    type: "transit",
    appleMapsQuery: "Bismarck, ND",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Prairie camp options (planning)", appleMapsQuery: "Campground, Bismarck, ND" },
        { letter: "B", name: "Interstate overnight connectors (planning)", appleMapsQuery: "Travel Center, Bismarck, ND" },
      ],
      dogWalkCandidates: { primary: "Riverside trail breaks", primaryQuery: "Missouri River trails, ND" },
      emergencyCandidates: [{ label: "I-94 corridor services", appleMapsQuery: "Hospital, Bismarck, ND" }],
      logistics: { groceries: "Target / Walmart (planning)", gas: "I-94 exits (planning)" },
    },
  },
  {
    id: "10",
    leg: "return",
    style: "scenic-return",
    phase: "return",
    stepNumber: 10,
    anchorRegion: "Great Lakes / Midwest",
    name: "Great Lakes / Midwest",
    shortName: "Great Lakes",
    subtitle: "Wisconsin / Michigan corridor",
    distance: "4060 mi",
    totalMiles: 4060,
    lat: 44.5133,
    lng: -88.0133,
    x: 58,
    y: 18,
    type: "stay-friendly",
    appleMapsQuery: "Green Bay, WI",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Lakeside state park options (planning)", appleMapsQuery: "Peninsula State Park, WI" },
        { letter: "B", name: "Midwest private camp options (planning)", appleMapsQuery: "Campground, Green Bay, WI" },
      ],
      dogWalkCandidates: { primary: "Lakefront and rail-trail walks", primaryQuery: "Fox River Trail, WI" },
      emergencyCandidates: [{ label: "US-41 and I-43 services", appleMapsQuery: "Hospital, Green Bay, WI" }],
      logistics: { groceries: "Meijer / Festival Foods (planning)", gas: "Great Lakes corridor fuel (planning)" },
    },
  },
  {
    id: "11",
    leg: "return",
    style: "scenic-return",
    phase: "return",
    stepNumber: 11,
    anchorRegion: "Pennsylvania Interior",
    name: "Pennsylvania Interior",
    shortName: "PA Interior",
    subtitle: "Central PA return corridor",
    distance: "4540 mi",
    totalMiles: 4540,
    lat: 40.7934,
    lng: -77.86,
    x: 76,
    y: 24,
    type: "transit",
    appleMapsQuery: "State College, PA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "State forest stays (planning)", appleMapsQuery: "Bald Eagle State Forest, PA" },
        { letter: "B", name: "I-80 private options (planning)", appleMapsQuery: "Campground, State College, PA" },
      ],
      dogWalkCandidates: { primary: "State forest trail breaks", primaryQuery: "Bald Eagle State Park, PA" },
      emergencyCandidates: [{ label: "I-80 service exits", appleMapsQuery: "Hospital, State College, PA" }],
      logistics: { groceries: "Wegmans / Giant (planning)", gas: "I-80 fuel (planning)" },
    },
  },
  {
    id: "12",
    leg: "return",
    style: "scenic-return",
    phase: "return",
    stepNumber: 12,
    anchorRegion: "New York Interior",
    name: "New York Interior",
    shortName: "NY Interior",
    subtitle: "Adirondack / capital region",
    distance: "4860 mi",
    totalMiles: 4860,
    lat: 42.6526,
    lng: -73.7562,
    x: 85,
    y: 16,
    type: "transit",
    appleMapsQuery: "Albany, NY",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Interior NY camps (planning)", appleMapsQuery: "Campground, Albany, NY" },
        { letter: "B", name: "Thruway connector stays (planning)", appleMapsQuery: "Travel Center, Albany, NY" },
      ],
      dogWalkCandidates: { primary: "Mohawk-Hudson trail segments", primaryQuery: "Mohawk-Hudson Bike-Hike Trail" },
      emergencyCandidates: [{ label: "I-87 / I-90 services", appleMapsQuery: "Hospital, Albany, NY" }],
      logistics: { groceries: "Hannaford (planning)", gas: "NYS thruway fuel (planning)" },
    },
  },
  {
    id: "13",
    leg: "return",
    style: "scenic-return",
    phase: "return",
    stepNumber: 13,
    anchorRegion: "Home",
    name: "Home Corridor",
    shortName: "Home Stretch",
    subtitle: "Final New England return",
    distance: "5100 mi",
    totalMiles: 5100,
    lat: 42.3601,
    lng: -71.0589,
    x: 90,
    y: 10,
    type: "transit",
    appleMapsQuery: "Boston, MA",
    candidateData: {
      stayCandidates: [
        { letter: "A", name: "Final push to home (planning)", appleMapsQuery: "Gloucester, MA" },
        { letter: "B", name: "Metro north shore stopover (planning)", appleMapsQuery: "Campground, North Shore, MA" },
      ],
      dogWalkCandidates: { primary: "North shore coastal trails", primaryQuery: "Lynn Woods Reservation, MA" },
      emergencyCandidates: [{ label: "I-95 / Route 128 services", appleMapsQuery: "Hospital, Boston, MA" }],
      logistics: { groceries: "Stop & Shop (planning)", gas: "I-95 corridor fuel (planning)" },
    },
  },
]

export const stopsData: StopData[] = routeSeeds.map((seed, index) => ({
  id: seed.id,
  anchorRegion: seed.anchorRegion,
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
