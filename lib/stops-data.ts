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

export interface StayOption {
  label: StayOptionLabel
  type: string
  name: string
  location: string
  dogFriendly: boolean
  shower: "on-site" | "nearby" | "none"
  groceryNearby: string
  spaced: boolean
  isRemote: boolean
  notes: string
  rating: StayRating
}

export interface AreaWarning {
  summary: string
  rating: 1 | 2 | 3 | 4 | 5
}

export interface BaselineRouteStop {
  step: number
  name: string
  region: string
  type: "scenic" | "transit" | "recovery" | "utility" | "end"
  driveHoursFromPrevious: number
  plannedStayDays: number
  dogPlan: string
  notes: string
}

export interface StopData {
  id: string
  order: number
  stepNumber?: number
  name: string
  shortName: string
  state: string
  subtitle: string
  distance: string
  totalMiles: number
  driveTimeFromPrev: string
  stayDuration: string
  plannedStayLabel: string
  plannedStayDays: number
  distanceMilesToNext: number
  highlights: string[]
  dogWalks: DogWalk[]
  areaWarnings: AreaWarning
  stayOptions: StayOption[]
  groceryNearby: string
  showerInfo: string
  type: StopType
  phase: RoutePhase
  routeLeg: RouteLegId
  routeStyle: RouteStyle
  status: "start" | "current" | "upcoming" | "future" | "completed"
  x: number
  y: number
  lat: number
  lng: number
  next: { label: string; stopId?: string }[]
  appleMapsQuery: string
}

export interface BaselineRouteDistance {
  step: number
  distanceMilesToNext: number
}

export const baselineRoute1: BaselineRouteStop[] = [
  { step: 1, name: "State College area", region: "Central Pennsylvania", type: "transit", driveHoursFromPrevious: 6.5, plannedStayDays: 1, dogPlan: "Farmland pull-offs, local parks, quiet walking roads", notes: "Push day to break out of Northeast congestion and start the trip cleanly." },
  { step: 2, name: "Shenandoah National Park", region: "Virginia", type: "scenic", driveHoursFromPrevious: 4, plannedStayDays: 2, dogPlan: "Dog-friendly walking available in and around the park", notes: "First major scenic payoff and an easy early-trip reset." },
  { step: 3, name: "Blue Ridge Parkway north section", region: "Virginia / North Carolina corridor", type: "scenic", driveHoursFromPrevious: 3.5, plannedStayDays: 1, dogPlan: "Overlooks, pull-offs, short nearby dog walks", notes: "Slow scenic driving day with flexible stop density." },
  { step: 4, name: "Great Smoky Mountains area", region: "Tennessee / North Carolina", type: "scenic", driveHoursFromPrevious: 4.5, plannedStayDays: 2, dogPlan: "Campgrounds, nearby towns, and fallback walk areas outside the main iconic zones", notes: "Drive-first scenic stop; dog logistics handled nearby if needed." },
  { step: 5, name: "Nashville", region: "Tennessee", type: "recovery", driveHoursFromPrevious: 4, plannedStayDays: 1, dogPlan: "City parks and greenway-style walks", notes: "Service reset and lighter day after the mountains." },
  { step: 6, name: "Memphis", region: "Tennessee", type: "transit", driveHoursFromPrevious: 3, plannedStayDays: 1, dogPlan: "Urban park stop or open green space walk", notes: "Shorter push to keep energy stable." },
  { step: 7, name: "Little Rock", region: "Arkansas", type: "transit", driveHoursFromPrevious: 2.75, plannedStayDays: 1, dogPlan: "River trails and local park walks", notes: "Low-pressure transition stop." },
  { step: 8, name: "Oklahoma City", region: "Oklahoma", type: "transit", driveHoursFromPrevious: 5, plannedStayDays: 1, dogPlan: "Local parks and open walking areas", notes: "Major westbound transit segment." },
  { step: 9, name: "Amarillo", region: "Texas Panhandle", type: "transit", driveHoursFromPrevious: 4.5, plannedStayDays: 1, dogPlan: "Open-space utility stop and dog break areas", notes: "Useful plains crossing stop." },
  { step: 10, name: "Santa Fe", region: "New Mexico", type: "scenic", driveHoursFromPrevious: 4.5, plannedStayDays: 2, dogPlan: "High-desert dog walks and nearby trail alternatives", notes: "First strong western-feel stop." },
  { step: 11, name: "Albuquerque / Northern NM buffer", region: "New Mexico", type: "transit", driveHoursFromPrevious: 1, plannedStayDays: 1, dogPlan: "Desert-edge walking and city-utility fallback", notes: "Intentional buffer before Utah rather than a forced long push." },
  { step: 12, name: "Moab area", region: "Utah", type: "scenic", driveHoursFromPrevious: 5.5, plannedStayDays: 2, dogPlan: "Nearby open land and fallback dog-walk areas", notes: "Big scenery stop with flexibility around stricter iconic zones." },
  { step: 13, name: "Capitol Reef / Central Utah", region: "Utah", type: "scenic", driveHoursFromPrevious: 3, plannedStayDays: 1, dogPlan: "Roadside scenic stops and nearby open walking areas", notes: "Bridges the Utah interior properly instead of jumping ahead." },
  { step: 14, name: "Bryce Canyon area", region: "Utah", type: "scenic", driveHoursFromPrevious: 2.5, plannedStayDays: 1, dogPlan: "Viewpoints plus nearby dog-walk fallback areas", notes: "Short scenic transition day." },
  { step: 15, name: "Zion / Kanab area", region: "Utah / Arizona border", type: "scenic", driveHoursFromPrevious: 2, plannedStayDays: 2, dogPlan: "Town-based walks and nearby dog-friendly alternatives", notes: "Strong scenic anchor with easier logistics if staying outside tighter zones." },
  { step: 16, name: "Las Vegas", region: "Nevada", type: "utility", driveHoursFromPrevious: 3, plannedStayDays: 1, dogPlan: "Hotel-area walks and utility stop parks", notes: "Intentional supply, shower, and service stop." },
  { step: 17, name: "Lone Pine / Eastern Sierra", region: "California", type: "scenic", driveHoursFromPrevious: 3.5, plannedStayDays: 1, dogPlan: "Open desert and mountain-view walking areas", notes: "Beautiful transition into California without forcing the coast too early." },
  { step: 18, name: "Northern California transition stop", region: "California interior", type: "transit", driveHoursFromPrevious: 5.5, plannedStayDays: 1, dogPlan: "Utility break areas and local park fallback", notes: "Critical bridge stop before Redwood; fixes the old broken jump." },
  { step: 19, name: "Redwood National and State Parks area", region: "Northern California coast", type: "scenic", driveHoursFromPrevious: 3.5, plannedStayDays: 3, dogPlan: "Beaches, developed areas, scenic roads, and nearby dog-walk options", notes: "Pacific turning point and main coastal reward." },
  { step: 20, name: "Southern Oregon coast", region: "Oregon", type: "scenic", driveHoursFromPrevious: 3, plannedStayDays: 1, dogPlan: "Beach walks and coastal pull-offs", notes: "Begins the inland-return transition without going straight home." },
  { step: 21, name: "Inland Oregon transition", region: "Oregon", type: "transit", driveHoursFromPrevious: 4.5, plannedStayDays: 1, dogPlan: "Open walking areas and utility stop backup", notes: "Moves east in a controlled way." },
  { step: 22, name: "Boise", region: "Idaho", type: "recovery", driveHoursFromPrevious: 4, plannedStayDays: 1, dogPlan: "River greenway and city parks", notes: "Comfortable recovery stop before the Wyoming corridor." },
  { step: 23, name: "Eastern Idaho / Wyoming corridor", region: "Idaho to Wyoming", type: "transit", driveHoursFromPrevious: 4.5, plannedStayDays: 1, dogPlan: "Open-space dog breaks and roadside utility walks", notes: "Required bridge toward Tetons." },
  { step: 24, name: "Grand Teton area", region: "Wyoming", type: "scenic", driveHoursFromPrevious: 2.5, plannedStayDays: 2, dogPlan: "Roadside and nearby dog-walk options outside stricter zones", notes: "Major inland icon with good scenic payoff." },
  { step: 25, name: "Yellowstone gateway stay", region: "Wyoming / Montana / Idaho gateway", type: "scenic", driveHoursFromPrevious: 1, plannedStayDays: 2, dogPlan: "Stay outside the park core, use parking/frontcountry rules plus nearby fallback walks", notes: "Controlled Yellowstone visit from a dog-practical base." },
  { step: 26, name: "Cody", region: "Wyoming", type: "transit", driveHoursFromPrevious: 2, plannedStayDays: 1, dogPlan: "Open-town walking and utility stop options", notes: "Clean eastbound exit from Yellowstone country." },
  { step: 27, name: "Rapid City / Badlands area", region: "South Dakota", type: "scenic", driveHoursFromPrevious: 5.5, plannedStayDays: 2, dogPlan: "Roadside scenic areas and nearby dog-walk fallback", notes: "High-payoff plains scenery stop." },
  { step: 28, name: "Sioux Falls", region: "South Dakota", type: "transit", driveHoursFromPrevious: 4, plannedStayDays: 1, dogPlan: "Parks and riverfront walking", notes: "Transit day that still gives a decent stop quality." },
  { step: 29, name: "Minneapolis", region: "Minnesota", type: "recovery", driveHoursFromPrevious: 3.5, plannedStayDays: 1, dogPlan: "Lakes, parks, and city walking options", notes: "Urban reset and recovery stop." },
  { step: 30, name: "Wisconsin to Michigan transition", region: "Upper Midwest corridor", type: "transit", driveHoursFromPrevious: 4.5, plannedStayDays: 1, dogPlan: "Parks and travel-corridor dog breaks", notes: "Bridge segment into the Great Lakes phase." },
  { step: 31, name: "Sleeping Bear Dunes area", region: "Michigan", type: "scenic", driveHoursFromPrevious: 3, plannedStayDays: 2, dogPlan: "Beaches, trails, and nearby dog-walk alternatives", notes: "Great Lakes decompression stop before final return." },
  { step: 32, name: "Chicago / Indiana corridor", region: "Illinois / Indiana", type: "transit", driveHoursFromPrevious: 4.5, plannedStayDays: 1, dogPlan: "Urban-edge parks and travel utility options", notes: "Efficient eastbound move." },
  { step: 33, name: "Ohio transition stop", region: "Ohio", type: "transit", driveHoursFromPrevious: 4.5, plannedStayDays: 1, dogPlan: "Park-based dog break stop", notes: "Keeps the home stretch realistic." },
  { step: 34, name: "Pennsylvania transition stop", region: "Pennsylvania", type: "transit", driveHoursFromPrevious: 4.5, plannedStayDays: 1, dogPlan: "Local park and open-space walk", notes: "Last sleep stop before home." },
  { step: 35, name: "Gloucester", region: "Massachusetts", type: "end", driveHoursFromPrevious: 4.5, plannedStayDays: 0, dogPlan: "Home", notes: "Trip complete." },
]

// Placeholder segment distances; replace with route-engine driving distances when available.
export const baselineRoute1WithDistance: BaselineRouteDistance[] = [
  { step: 1, distanceMilesToNext: 210 },
  { step: 2, distanceMilesToNext: 105 },
  { step: 3, distanceMilesToNext: 230 },
  { step: 4, distanceMilesToNext: 220 },
  { step: 5, distanceMilesToNext: 215 },
  { step: 6, distanceMilesToNext: 140 },
  { step: 7, distanceMilesToNext: 350 },
  { step: 8, distanceMilesToNext: 260 },
  { step: 9, distanceMilesToNext: 285 },
  { step: 10, distanceMilesToNext: 65 },
  { step: 11, distanceMilesToNext: 340 },
  { step: 12, distanceMilesToNext: 150 },
  { step: 13, distanceMilesToNext: 80 },
  { step: 14, distanceMilesToNext: 85 },
  { step: 15, distanceMilesToNext: 165 },
  { step: 16, distanceMilesToNext: 225 },
  { step: 17, distanceMilesToNext: 330 },
  { step: 18, distanceMilesToNext: 165 },
  { step: 19, distanceMilesToNext: 120 },
  { step: 20, distanceMilesToNext: 260 },
  { step: 21, distanceMilesToNext: 340 },
  { step: 22, distanceMilesToNext: 300 },
  { step: 23, distanceMilesToNext: 110 },
  { step: 24, distanceMilesToNext: 60 },
  { step: 25, distanceMilesToNext: 105 },
  { step: 26, distanceMilesToNext: 390 },
  { step: 27, distanceMilesToNext: 250 },
  { step: 28, distanceMilesToNext: 240 },
  { step: 29, distanceMilesToNext: 310 },
  { step: 30, distanceMilesToNext: 140 },
  { step: 31, distanceMilesToNext: 300 },
  { step: 32, distanceMilesToNext: 280 },
  { step: 33, distanceMilesToNext: 290 },
  { step: 34, distanceMilesToNext: 310 },
  { step: 35, distanceMilesToNext: 0 },
]

export function formatPlannedStay(days: number): string {
  if (days <= 0) return "planned stay - total 0 days"
  return `planned stay - total ${days} ${days === 1 ? "day" : "days"}`
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
    { label: "A", type: "Recommended Stay", name: `${stop.name} Camp/Stay A`, location: stop.region, dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", spaced: true, isRemote: false, notes: "Recommended baseline", rating: { safety: { level: "excellent", risk: "Low" }, convenience: 4, cost: 3, comfort: 4 } },
    { label: "B", type: "Fallback Stay", name: `${stop.name} Stay B`, location: stop.region, dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", spaced: true, isRemote: false, notes: "Fallback", rating: { safety: { level: "excellent", risk: "Moderate traffic" }, convenience: 4, cost: 3, comfort: 4 } },
    { label: "C", type: "Remote Option", name: `${stop.name} Remote C`, location: stop.region, dogFriendly: true, shower: "none", groceryNearby: "20-30 min", spaced: true, isRemote: true, notes: "Remote option", rating: { safety: { level: "good", risk: "Limited services" }, convenience: 2, cost: 5, comfort: 2 } },
    { label: "D", type: "Safety Fallback", name: `${stop.name} Hotel D`, location: stop.region, dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", spaced: false, isRemote: false, notes: "Safety fallback", rating: { safety: { level: "excellent", risk: "Controlled area" }, convenience: 5, cost: 2, comfort: 5 } },
  ]
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

export const stopsData: StopData[] = [
  {
    id: "0",
    order: 0,
    name: "Home - Gloucester, MA",
    shortName: "Home",
    state: "MA",
    subtitle: "New England home base",
    distance: "Start",
    totalMiles: 0,
    driveTimeFromPrev: "Start",
    stayDuration: "Home",
    plannedStayLabel: formatPlannedStay(0),
    plannedStayDays: 0,
    distanceMilesToNext: segmentDistanceByStep.get(1) ?? 0,
    highlights: ["launch point"],
    dogWalks: [{ name: "Good Harbor Beach", type: "beach" as const, leashRequired: true }],
    areaWarnings: { summary: "Check local seasonal dog rules", rating: 1 },
    stayOptions: buildStayOptions({ step: 0, name: "Home", region: "MA", type: "end", driveHoursFromPrevious: 0, plannedStayDays: 0, dogPlan: "Home", notes: "" }),
    groceryNearby: "Nearby",
    showerInfo: "Home facilities",
    type: "stay-friendly",
    phase: "outbound",
    routeLeg: "outbound",
    routeStyle: "scenic-outbound",
    status: "start",
    x: 93,
    y: 8,
    lat: 42.6159,
    lng: -70.662,
    next: [{ label: baselineRoute1[0].name, stopId: String(baselineRoute1[0].step) }],
    appleMapsQuery: "Gloucester, MA",
  },
  ...baselineRoute1.map((stop, index) => {
    const phase: RoutePhase = stop.step < 19 ? "outbound" : stop.step === 19 ? "turning-point" : "return"
    const routeLeg: RouteLegId = phase === "return" || phase === "turning-point" ? "return" : "outbound"
    const routeStyle: RouteStyle = routeLeg === "return" ? "scenic-return" : "scenic-outbound"
    const point = coords[stop.step] ?? { lat: 39.5, lng: -98.35, x: 50, y: 25 }
    const plannedStayLabel = formatPlannedStay(stop.plannedStayDays)

    const distanceMilesToNext = segmentDistanceByStep.get(stop.step) ?? 0
    const totalMiles = baselineRoute1
      .slice(0, index)
      .reduce((sum, priorStop) => sum + (segmentDistanceByStep.get(priorStop.step) ?? 0), 0)

    return {
      id: String(stop.step),
      order: stop.step,
      stepNumber: stop.step,
      name: stop.name,
      shortName: stop.name,
      state: stop.region,
      subtitle: `${stop.region} • ${plannedStayLabel}`,
      distance: `${totalMiles} mi`,
      totalMiles,
      driveTimeFromPrev: `${stop.driveHoursFromPrevious}h`,
      stayDuration: plannedStayLabel,
      plannedStayLabel,
      plannedStayDays: stop.plannedStayDays,
      distanceMilesToNext,
      highlights: [stop.type],
      dogWalks: [{ name: `${stop.name} dog walk area`, type: "trail" as const, leashRequired: true }],
      areaWarnings: { summary: stop.notes, rating: (stop.type === "transit" ? 2 : 3) as 2 | 3 },
      stayOptions: buildStayOptions(stop),
      groceryNearby: "Nearby",
      showerInfo: "Shower available on-site or nearby by option",
      type: mapStopType(stop.type),
      phase,
      routeLeg,
      routeStyle,
      status: "future" as const,
      x: point.x,
      y: point.y,
      lat: point.lat,
      lng: point.lng,
      next: index === baselineRoute1.length - 1 ? [{ label: "Home", stopId: "0" }] : [{ label: baselineRoute1[index + 1].name, stopId: String(baselineRoute1[index + 1].step) }],
      appleMapsQuery: `${stop.name}, ${stop.region}`,
    }
  }),
]

export function getStayOptions(stop: StopData): StayOption[] {
  return stop.stayOptions
}

export function getStopById(id: string): StopData | undefined {
  return stopsData.find((stop) => stop.id === id)
}

export function resolveStopId(input: string): string | null {
  const normalized = input.trim()
  if (!normalized) return null
  if (getStopById(normalized)) return normalized

  const numeric = Number.parseInt(normalized, 10)
  if (!Number.isNaN(numeric)) {
    const asId = String(numeric)
    if (getStopById(asId)) return asId
  }

  return null
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
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat * Math.PI) / 180) * Math.cos((stop.lat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    if (distance < minDistance) {
      minDistance = distance
      closestStop = stop
    }
  }
}
  if (closestStop) return { stop: closestStop, distanceMiles: Math.round(minDistance) }
  return null
}
