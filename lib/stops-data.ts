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

interface RawStop {
  order: number
  name: string
  stayOptions: StayOption[]
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

const coords: Record<string, { lat: number; lng: number; x: number; y: number }> = {
  "Central Pennsylvania": { lat: 40.9, lng: -77.7, x: 84, y: 17 },
  Shenandoah: { lat: 38.53, lng: -78.35, x: 77, y: 24 },
  "Blue Ridge Parkway": { lat: 36.2, lng: -81.7, x: 72, y: 30 },
  "Smoky Mountains": { lat: 35.6, lng: -83.5, x: 68, y: 34 },
  "Transit Tennessee": { lat: 35.8, lng: -86.4, x: 62, y: 37 },
  Arkansas: { lat: 34.7, lng: -92.3, x: 54, y: 39 },
  Oklahoma: { lat: 35.5, lng: -97.5, x: 48, y: 40 },
  Texas: { lat: 32.8, lng: -96.8, x: 44, y: 45 },
  "New Mexico": { lat: 35.1, lng: -106.6, x: 38, y: 42 },
  "Utah / Zion": { lat: 37.3, lng: -113.0, x: 28, y: 36 },
  Redwood: { lat: 41.2, lng: -124.0, x: 10, y: 23 },
  Yellowstone: { lat: 44.4, lng: -110.6, x: 23, y: 14 },
}

// TODO: replace static data with LLM-generated data
export const baseRoute: { start: string; stops: RawStop[] } = {
  start: "Gloucester, MA",
  stops: [
    { order: 1, name: "Central Pennsylvania", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Seven Mountains Campground", location:"PA", dogFriendly:true, shower:"on-site", groceryNearby:"Weis Markets", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Quiet rural"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin Rental", location:"PA", dogFriendly:true, shower:"on-site", groceryNearby:"Local store", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Residential"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"Rothrock State Forest", location:"PA", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"No signal"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hampton Inn", location:"PA", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Controlled area"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 2, name: "Shenandoah", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Big Meadows", location:"VA", dogFriendly:true, shower:"on-site", groceryNearby:"Park store", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Wildlife present"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Skyland Lodge", location:"VA", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Tourist area"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"George Washington NF", location:"VA", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Remote roads"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Front Royal Hotel", location:"VA", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 3, name: "Blue Ridge Parkway", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Julian Price Campground", location:"NC", dogFriendly:true, shower:"on-site", groceryNearby:"Boone", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Fog driving"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Blowing Rock Cabin", location:"NC", dogFriendly:true, shower:"on-site", groceryNearby:"Town", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"Pisgah NF", location:"NC", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Limited signal"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Boone Hotel", location:"NC", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 4, name: "Smoky Mountains", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Elkmont", location:"TN", dogFriendly:true, shower:"nearby", groceryNearby:"Town", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"good", risk:"Dog restrictions"}, convenience:3, cost:4, comfort:3 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin Gatlinburg", location:"TN", dogFriendly:true, shower:"on-site", groceryNearby:"Kroger", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Busy tourist"}, convenience:5, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"Cherokee NF", location:"TN", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Remote"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Gatlinburg Hotel", location:"TN", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Tourist density"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 5, name: "Transit Tennessee", stayOptions: [
      { label:"A", type:"Premium Campground", name:"KOA", location:"TN", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin", location:"TN", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"National Forest", location:"TN", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Remote"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel", location:"TN", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 6, name: "Arkansas", stayOptions: [
      { label:"A", type:"Premium Campground", name:"State Park Camp", location:"AR", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Humidity"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin", location:"AR", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"Ouachita NF", location:"AR", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Isolation"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel", location:"AR", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 7, name: "Oklahoma", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Lake Camp", location:"OK", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Wind"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin", location:"OK", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"Public Land", location:"OK", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Limited options"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel", location:"OK", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 8, name: "Texas", stayOptions: [
      { label:"A", type:"Premium Campground", name:"RV Park", location:"TX", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Heat"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin", location:"TX", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Heat"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"Public Land", location:"TX", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Heat + exposure"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel", location:"TX", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 9, name: "New Mexico", stayOptions: [
      { label:"A", type:"Premium Campground", name:"State Park Camp", location:"NM", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Heat"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin", location:"NM", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"BLM Land", location:"NM", dogFriendly:true, shower:"none", groceryNearby:"20min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Remote desert"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel", location:"NM", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 10, name: "Utah / Zion", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Watchman Campground", location:"UT", dogFriendly:true, shower:"on-site", groceryNearby:"Springdale", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Tourist crowd"}, convenience:4, cost:3, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Zion Cabin", location:"UT", dogFriendly:true, shower:"on-site", groceryNearby:"Town", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"BLM Land Zion", location:"UT", dogFriendly:true, shower:"none", groceryNearby:"20min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"No facilities"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel Springdale", location:"UT", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 13, name: "Redwood", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Elk Prairie Campground", location:"CA", dogFriendly:true, shower:"on-site", groceryNearby:"Town", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Fog"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"Cabin", location:"CA", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"National Forest", location:"CA", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Remote forest"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel", location:"CA", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
    { order: 18, name: "Yellowstone", stayOptions: [
      { label:"A", type:"Premium Campground", name:"Madison Campground", location:"WY", dogFriendly:true, shower:"on-site", groceryNearby:"Park", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"Wildlife"}, convenience:3, cost:4, comfort:4 } },
      { label:"B", type:"Private Campground / Cabin", name:"West Yellowstone Cabin", location:"WY", dogFriendly:true, shower:"on-site", groceryNearby:"Town", spaced:true, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:4, cost:3, comfort:5 } },
      { label:"C", type:"Dispersed Camping", name:"National Forest", location:"WY", dogFriendly:true, shower:"none", groceryNearby:"30min", spaced:true, isRemote:true, notes:"", rating:{ safety:{level:"good", risk:"Wildlife + remote"}, convenience:2, cost:5, comfort:2 } },
      { label:"D", type:"Guaranteed Overnight", name:"Hotel West Yellowstone", location:"WY", dogFriendly:true, shower:"on-site", groceryNearby:"Nearby", spaced:false, isRemote:false, notes:"", rating:{ safety:{level:"excellent", risk:"None"}, convenience:5, cost:2, comfort:5 } },
    ]},
  ],
}

function makePhase(order: number): RoutePhase {
  if (order === 18) return "turning-point"
  return order > 13 ? "return" : "outbound"
}

function makeShowerInfo(options: StayOption[]): string {
  return `Shower coverage: ${Array.from(new Set(options.map((option) => option.shower))).join(", ")}`
}

function getAreaWarning(options: StayOption[]): AreaWarning {
  const hasGoodSafety = options.some((option) => option.rating.safety.level === "good")
  const rating = hasGoodSafety ? 3 : 2
  const summary = options.find((option) => option.label === "C")?.rating.safety.risk || "Standard travel caution"
  return { summary, rating: rating as 2 | 3 }
}

const homeStop: StopData = {
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
  highlights: ["launch point"],
  dogWalks: [{ name: "Good Harbor Beach", type: "beach", leashRequired: true }],
  areaWarnings: { summary: "Check local seasonal dog rules", rating: 1 },
  stayOptions: [],
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
  next: [{ label: "Central Pennsylvania", stopId: "1" }],
  appleMapsQuery: "Gloucester, MA",
}

const routeStops = baseRoute.stops

export const stopsData: StopData[] = [
  homeStop,
  ...routeStops.map((raw, index) => {
    const pos = coords[raw.name] ?? { lat: 39, lng: -96, x: 50, y: 25 }
    const phase = makePhase(raw.order)
    const routeType: StopType = "stay-friendly"
    const routeLeg: RouteLegId = phase === "return" || phase === "turning-point" ? "return" : "outbound"
    const routeStyle: RouteStyle = phase === "return" || phase === "turning-point" ? "scenic-return" : "scenic-outbound"
    return {
      id: String(raw.order),
      order: raw.order,
      stepNumber: raw.order,
      name: raw.name,
      shortName: raw.name,
      state: raw.stayOptions[0]?.location ?? "US",
      subtitle: `Decision stop with ${raw.stayOptions.length} options`,
      distance: `${(index + 1) * 220} mi`,
      totalMiles: (index + 1) * 220,
      driveTimeFromPrev: "varies",
      stayDuration: "1–2 nights",
      highlights: ["decision mode"],
      dogWalks: [{ name: `${raw.name} Dog Trail`, type: "trail" as const, leashRequired: true }],
      areaWarnings: getAreaWarning(raw.stayOptions),
      stayOptions: raw.stayOptions,
      groceryNearby: raw.stayOptions.find((option) => option.label === "A")?.groceryNearby ?? "Nearby",
      showerInfo: makeShowerInfo(raw.stayOptions),
      type: routeType,
      phase,
      routeLeg,
      routeStyle,
      status: "future" as const,
      x: pos.x,
      y: pos.y,
      lat: pos.lat,
      lng: pos.lng,
      next:
        index === routeStops.length - 1
          ? [{ label: "Home", stopId: "0" }]
          : [{ label: routeStops[index + 1].name, stopId: String(routeStops[index + 1].order) }],
      appleMapsQuery: `${raw.name} ${raw.stayOptions[0]?.location ?? "USA"}`,
    }
  }),
]

export function getStayOptions(stop: StopData): StayOption[] {
  return stop.stayOptions
}

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
      Math.cos((lat * Math.PI) / 180) * Math.cos((stop.lat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    if (distance < minDistance) {
      minDistance = distance
      closestStop = stop
    }
  }

  if (closestStop) return { stop: closestStop, distanceMiles: Math.round(minDistance) }
  return null
}
