export type RoutePhase = "outbound" | "turning-point" | "return"
export type RouteLegId = "outbound" | "return"
export type RouteStyle = "scenic-outbound" | "scenic-return"
export type StopType = "stay-friendly" | "scenic-only" | "transit"

export type StayOptionLabel = "A" | "B" | "C" | "D"

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
  notes: string
}

export interface StayOptions {
  A: StayOption
  B: StayOption
  C: StayOption
  D: StayOption
}

export interface AreaWarning {
  summary: string
  rating: 1 | 2 | 3 | 4 | 5
}

interface RawStop {
  order: number
  name: string
  state: string
  driveTimeFromPrev: string
  stayDuration: string
  highlights: string[]
  dogWalks: DogWalk[]
  areaWarnings: AreaWarning
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
  stayOptions: StayOptions
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
  "Shenandoah National Park": { lat: 38.53, lng: -78.35, x: 77, y: 24 },
  "Blue Ridge Parkway": { lat: 36.2, lng: -81.7, x: 72, y: 30 },
  "Great Smoky Mountains": { lat: 35.6, lng: -83.5, x: 68, y: 34 },
  Tennessee: { lat: 35.8, lng: -86.4, x: 62, y: 37 },
  Arkansas: { lat: 34.7, lng: -92.3, x: 54, y: 39 },
  Oklahoma: { lat: 35.5, lng: -97.5, x: 48, y: 40 },
  Texas: { lat: 32.8, lng: -96.8, x: 44, y: 45 },
  "New Mexico": { lat: 35.1, lng: -106.6, x: 38, y: 42 },
  "Utah/Arizona Corridor": { lat: 34.9, lng: -111.8, x: 30, y: 39 },
  Nevada: { lat: 39.1, lng: -119.8, x: 19, y: 33 },
  "California Entry": { lat: 36.6, lng: -121.9, x: 12, y: 34 },
  "Redwood National Park": { lat: 41.2, lng: -124.0, x: 10, y: 23 },
  "Olympic National Park (Optional)": { lat: 47.8, lng: -123.7, x: 11, y: 10 },
  "California Inland": { lat: 36.8, lng: -119.4, x: 14, y: 36 },
  Wyoming: { lat: 43.1, lng: -107.6, x: 27, y: 20 },
  "Grand Teton": { lat: 43.7, lng: -110.7, x: 23, y: 17 },
  Yellowstone: { lat: 44.4, lng: -110.6, x: 23, y: 14 },
  Badlands: { lat: 43.8, lng: -102.3, x: 36, y: 17 },
  "Sleeping Bear Dunes": { lat: 44.9, lng: -86.0, x: 58, y: 16 },
  Michigan: { lat: 43.0, lng: -84.5, x: 63, y: 18 },
  "New York": { lat: 42.9, lng: -75.5, x: 78, y: 15 },
  "Massachusetts (Return)": { lat: 42.3, lng: -71.1, x: 92, y: 11 },
}

function toStayOptions(input: StayOption[]): StayOptions {
  const byLabel = Object.fromEntries(input.map((opt) => [opt.label, opt])) as Partial<Record<StayOptionLabel, StayOption>>
  if (!byLabel.A || !byLabel.B || !byLabel.C || !byLabel.D) throw new Error("Each stop must contain stay options A/B/C/D")
  return { A: byLabel.A, B: byLabel.B, C: byLabel.C, D: byLabel.D }
}

function makeShortName(name: string): string {
  return name.replace("National Park", "NP").replace("(Optional)", "").trim()
}

function makeType(stop: RawStop): StopType {
  if (stop.name === "Yellowstone") return "scenic-only"
  if (stop.stayDuration.toLowerCase().includes("transit")) return "transit"
  return "stay-friendly"
}

function makePhase(order: number): RoutePhase {
  if (order === 18) return "turning-point"
  return order >= 15 ? "return" : "outbound"
}

function makeShowerInfo(options: StayOptions): string {
  const set = new Set([options.A.shower, options.B.shower, options.C.shower, options.D.shower])
  return `Shower coverage: ${Array.from(set).join(", ")}`
}

// TODO: replace static data with LLM-generated data
export const baseRoute: { start: string; duration: string; avgDrive: string; stops: RawStop[] } = {
  start: "Gloucester, MA",
  duration: "30–45 days",
  avgDrive: "4 hrs/day",
  stops: [
    { order: 1, name: "Central Pennsylvania", state: "PA", driveTimeFromPrev: "6–6.5h", stayDuration: "1 night", highlights: ["farmland reset", "quiet rural"], dogWalks: [{ name: "Rothrock State Forest", type: "trail", leashRequired: true }], areaWarnings: { summary: "Very quiet, limited night services", rating: 2 }, stayOptions: [{ label: "A", type: "Scenic Camp", name: "Seven Mountains Campground", location: "Spring Mills", dogFriendly: true, shower: "on-site", groceryNearby: "Weis Markets (15 min)", notes: "Quiet wooded" }, { label: "B", type: "Comfort Stay", name: "Keller House B&B", location: "Centre Hall", dogFriendly: true, shower: "on-site", groceryNearby: "Local store", notes: "Cozy" }, { label: "C", type: "Budget", name: "Super 8", location: "State College", dogFriendly: true, shower: "on-site", groceryNearby: "Walmart", notes: "Cheap" }, { label: "D", type: "Backup", name: "Rest Area", location: "I-80", dogFriendly: true, shower: "nearby", groceryNearby: "Gas", notes: "Emergency" }] },
    { order: 2, name: "Shenandoah National Park", state: "VA", driveTimeFromPrev: "4h", stayDuration: "2–3 nights", highlights: ["Skyline Drive"], dogWalks: [{ name: "Stony Man Trail", type: "trail", leashRequired: true }], areaWarnings: { summary: "Bears + strict leash rules", rating: 3 }, stayOptions: [{ label: "A", type: "Scenic Camp", name: "Big Meadows", location: "Park", dogFriendly: true, shower: "on-site", groceryNearby: "Park store", notes: "Best" }, { label: "B", type: "Comfort Stay", name: "Skyland Lodge", location: "Park", dogFriendly: true, shower: "on-site", groceryNearby: "Park", notes: "Views" }, { label: "C", type: "Budget", name: "Quality Inn", location: "Front Royal", dogFriendly: true, shower: "on-site", groceryNearby: "Food Lion", notes: "Easy" }, { label: "D", type: "Backup", name: "Forest Camp", location: "Nearby", dogFriendly: true, shower: "none", groceryNearby: "Town", notes: "Remote" }] },
    { order: 3, name: "Blue Ridge Parkway", state: "VA/NC", driveTimeFromPrev: "scenic", stayDuration: "1–2 nights", highlights: ["scenic drive"], dogWalks: [{ name: "Julian Price Trails", type: "trail", leashRequired: true }], areaWarnings: { summary: "Fog + slow roads", rating: 2 }, stayOptions: [{ label: "A", type: "Scenic Camp", name: "Julian Price", location: "Parkway", dogFriendly: true, shower: "on-site", groceryNearby: "Boone", notes: "Nature" }, { label: "B", type: "Comfort Stay", name: "Blowing Rock Inn", location: "Town", dogFriendly: true, shower: "on-site", groceryNearby: "Local", notes: "Nice town" }, { label: "C", type: "Budget", name: "Boone Motel", location: "Boone", dogFriendly: true, shower: "on-site", groceryNearby: "Walmart", notes: "Cheap" }, { label: "D", type: "Backup", name: "Pull-off", location: "Parkway", dogFriendly: true, shower: "none", groceryNearby: "None", notes: "Emergency" }] },
    { order: 4, name: "Great Smoky Mountains", state: "TN/NC", driveTimeFromPrev: "3–4h", stayDuration: "2 nights", highlights: ["forest"], dogWalks: [{ name: "Gatlinburg Trail", type: "trail", leashRequired: true }], areaWarnings: { summary: "Dogs restricted heavily", rating: 4 }, stayOptions: [{ label: "A", type: "Scenic Camp", name: "Elkmont", location: "Park", dogFriendly: true, shower: "nearby", groceryNearby: "Town", notes: "Best" }, { label: "B", type: "Comfort Stay", name: "Cabin", location: "Gatlinburg", dogFriendly: true, shower: "on-site", groceryNearby: "Kroger", notes: "Comfort" }, { label: "C", type: "Budget", name: "Motel 6", location: "Town", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "Cheap" }, { label: "D", type: "Backup", name: "KOA", location: "Edge", dogFriendly: true, shower: "on-site", groceryNearby: "Town", notes: "Reliable" }] },
    { order: 5, name: "Tennessee", state: "TN", driveTimeFromPrev: "varies", stayDuration: "transit", highlights: [], dogWalks: [{ name: "City Park", type: "park", leashRequired: true }], areaWarnings: { summary: "Hot summers", rating: 2 }, stayOptions: [{ label: "A", type: "Camp", name: "KOA", location: "TN", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Hilton", location: "TN", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "TN", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "TN", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 6, name: "Arkansas", state: "AR", driveTimeFromPrev: "varies", stayDuration: "transit", highlights: [], dogWalks: [{ name: "State Park", type: "trail", leashRequired: true }], areaWarnings: { summary: "Humidity + bugs", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "State Park Camp", location: "AR", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Local Hotel", location: "AR", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "AR", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Area", location: "AR", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 7, name: "Oklahoma", state: "OK", driveTimeFromPrev: "varies", stayDuration: "transit", highlights: [], dogWalks: [{ name: "Lake Walk", type: "park", leashRequired: true }], areaWarnings: { summary: "Flat + windy", rating: 2 }, stayOptions: [{ label: "A", type: "Camp", name: "Lake Camp", location: "OK", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Inn", location: "OK", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "OK", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "OK", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 8, name: "Texas", state: "TX", driveTimeFromPrev: "varies", stayDuration: "transit", highlights: [], dogWalks: [{ name: "City Park", type: "park", leashRequired: true }], areaWarnings: { summary: "Extreme heat", rating: 4 }, stayOptions: [{ label: "A", type: "Camp", name: "RV Park", location: "TX", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Hotel TX", location: "TX", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel TX", location: "TX", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Area", location: "TX", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 9, name: "New Mexico", state: "NM", driveTimeFromPrev: "varies", stayDuration: "1 night", highlights: ["desert"], dogWalks: [{ name: "Petroglyph Trails", type: "trail", leashRequired: true }], areaWarnings: { summary: "Extreme heat", rating: 4 }, stayOptions: [{ label: "A", type: "Camp", name: "White Sands", location: "NM", dogFriendly: true, shower: "none", groceryNearby: "Town", notes: "" }, { label: "B", type: "Hotel", name: "Hotel Albuquerque", location: "NM", dogFriendly: true, shower: "on-site", groceryNearby: "Whole Foods", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "NM", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "NM", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 10, name: "Utah/Arizona Corridor", state: "UT/AZ", driveTimeFromPrev: "varies", stayDuration: "2–3 nights", highlights: ["red rocks"], dogWalks: [{ name: "Sedona Trails", type: "trail", leashRequired: true }], areaWarnings: { summary: "Heat + exposure", rating: 4 }, stayOptions: [{ label: "A", type: "Camp", name: "BLM Land", location: "Sedona", dogFriendly: true, shower: "none", groceryNearby: "Town", notes: "" }, { label: "B", type: "Hotel", name: "Sedona Resort", location: "Sedona", dogFriendly: true, shower: "on-site", groceryNearby: "Whole Foods", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "Sedona", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Truck Stop", location: "AZ", dogFriendly: true, shower: "nearby", groceryNearby: "Gas", notes: "" }] },
    { order: 11, name: "Nevada", state: "NV", driveTimeFromPrev: "varies", stayDuration: "transit", highlights: [], dogWalks: [{ name: "Desert Stop", type: "park", leashRequired: true }], areaWarnings: { summary: "Very remote", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "RV Park", location: "NV", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Casino Hotel", location: "NV", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "NV", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "NV", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 12, name: "California Entry", state: "CA", driveTimeFromPrev: "varies", stayDuration: "1–2 nights", highlights: ["coast entry"], dogWalks: [{ name: "Coastal Trail", type: "beach", leashRequired: true }], areaWarnings: { summary: "Traffic + fog", rating: 2 }, stayOptions: [{ label: "A", type: "Camp", name: "State Park Camp", location: "CA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Coastal Hotel", location: "CA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "CA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Beach Parking", location: "CA", dogFriendly: true, shower: "none", groceryNearby: "Nearby", notes: "" }] },
    { order: 13, name: "Redwood National Park", state: "CA", driveTimeFromPrev: "varies", stayDuration: "2–3 nights", highlights: ["giant trees"], dogWalks: [{ name: "Prairie Creek", type: "trail", leashRequired: true }], areaWarnings: { summary: "Wet + fog", rating: 2 }, stayOptions: [{ label: "A", type: "Camp", name: "Elk Prairie", location: "Redwood", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby town", notes: "" }, { label: "B", type: "Hotel", name: "Cabin", location: "Nearby", dogFriendly: true, shower: "on-site", groceryNearby: "Local", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "Crescent City", dogFriendly: true, shower: "on-site", groceryNearby: "Walmart", notes: "" }, { label: "D", type: "Backup", name: "Beach Camp", location: "Coast", dogFriendly: true, shower: "none", groceryNearby: "Town", notes: "" }] },
    { order: 14, name: "Olympic National Park (Optional)", state: "WA", driveTimeFromPrev: "varies", stayDuration: "optional", highlights: ["rainforest"], dogWalks: [{ name: "Beach Walk", type: "beach", leashRequired: true }], areaWarnings: { summary: "Rain + isolation", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "Kalaloch Camp", location: "WA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Lodge", location: "WA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "WA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Forest Camp", location: "WA", dogFriendly: true, shower: "none", groceryNearby: "Nearby", notes: "" }] },
    { order: 15, name: "California Inland", state: "CA", driveTimeFromPrev: "varies", stayDuration: "transit", highlights: [], dogWalks: [{ name: "Park", type: "park", leashRequired: true }], areaWarnings: { summary: "Heat inland", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "RV Camp", location: "CA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Hotel", location: "CA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel", location: "CA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "CA", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 16, name: "Wyoming", state: "WY", driveTimeFromPrev: "varies", stayDuration: "1 night", highlights: ["plains"], dogWalks: [{ name: "Open Fields", type: "trail", leashRequired: true }], areaWarnings: { summary: "Very remote", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "Camp WY", location: "WY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Inn WY", location: "WY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel WY", location: "WY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "WY", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 17, name: "Grand Teton", state: "WY", driveTimeFromPrev: "short", stayDuration: "2 nights", highlights: ["mountains"], dogWalks: [{ name: "Jenny Lake Area", type: "park", leashRequired: true }], areaWarnings: { summary: "Wildlife proximity", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "Jenny Lake Camp", location: "WY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Jackson Lodge", location: "WY", dogFriendly: true, shower: "on-site", groceryNearby: "Jackson", notes: "" }, { label: "C", type: "Budget", name: "Motel Jackson", location: "WY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Forest Camp", location: "WY", dogFriendly: true, shower: "none", groceryNearby: "Nearby", notes: "" }] },
    { order: 18, name: "Yellowstone", state: "WY", driveTimeFromPrev: "short", stayDuration: "2–3 nights", highlights: ["geysers"], dogWalks: [{ name: "Roadside Areas Only", type: "park", leashRequired: true }], areaWarnings: { summary: "Dogs restricted almost everywhere", rating: 5 }, stayOptions: [{ label: "A", type: "Camp", name: "Madison Campground", location: "Park", dogFriendly: true, shower: "on-site", groceryNearby: "Park store", notes: "" }, { label: "B", type: "Hotel", name: "West Yellowstone Hotel", location: "Town", dogFriendly: true, shower: "on-site", groceryNearby: "Town", notes: "" }, { label: "C", type: "Budget", name: "Motel 6", location: "Town", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "RV Stop", location: "Outside", dogFriendly: true, shower: "nearby", groceryNearby: "Town", notes: "" }] },
    { order: 19, name: "Badlands", state: "SD", driveTimeFromPrev: "varies", stayDuration: "1 night", highlights: ["rock formations"], dogWalks: [{ name: "Badlands Trail", type: "trail", leashRequired: true }], areaWarnings: { summary: "Extreme exposure", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "Badlands Camp", location: "SD", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Inn SD", location: "SD", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel SD", location: "SD", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "SD", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 20, name: "Sleeping Bear Dunes", state: "MI", driveTimeFromPrev: "varies", stayDuration: "2 nights", highlights: ["great lakes dunes"], dogWalks: [{ name: "Dune Climb Area", type: "park", leashRequired: true }], areaWarnings: { summary: "Steep dunes + wind", rating: 3 }, stayOptions: [{ label: "A", type: "Camp", name: "Dunes Camp", location: "MI", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Lake Hotel", location: "MI", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel MI", location: "MI", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Beach Camp", location: "MI", dogFriendly: true, shower: "none", groceryNearby: "Nearby", notes: "" }] },
    { order: 21, name: "Michigan", state: "MI", driveTimeFromPrev: "varies", stayDuration: "transit", highlights: [], dogWalks: [{ name: "City Park", type: "park", leashRequired: true }], areaWarnings: { summary: "None significant", rating: 1 }, stayOptions: [{ label: "A", type: "Camp", name: "Camp MI", location: "MI", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "Hotel MI", location: "MI", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "Motel MI", location: "MI", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "MI", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 22, name: "New York", state: "NY", driveTimeFromPrev: "varies", stayDuration: "1 night", highlights: [], dogWalks: [{ name: "State Park", type: "park", leashRequired: true }], areaWarnings: { summary: "Traffic heavy", rating: 2 }, stayOptions: [{ label: "A", type: "Camp", name: "NY Camp", location: "NY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Hotel", name: "NY Hotel", location: "NY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Budget", name: "NY Motel", location: "NY", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Rest Stop", location: "NY", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" }] },
    { order: 23, name: "Massachusetts (Return)", state: "MA", driveTimeFromPrev: "varies", stayDuration: "end", highlights: ["home"], dogWalks: [{ name: "Local Trails", type: "trail", leashRequired: true }], areaWarnings: { summary: "None", rating: 1 }, stayOptions: [{ label: "A", type: "Home", name: "Home", location: "MA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "B", type: "Backup", name: "Hotel", location: "MA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "C", type: "Backup", name: "Motel", location: "MA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" }, { label: "D", type: "Backup", name: "Emergency", location: "MA", dogFriendly: true, shower: "none", groceryNearby: "Nearby", notes: "" }] },
  ],
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
  stayOptions: {
    A: { label: "A", type: "Home", name: "Home", location: "Gloucester", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "Recommended" },
    B: { label: "B", type: "Backup", name: "North Shore Hotel", location: "MA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" },
    C: { label: "C", type: "Backup", name: "Motel", location: "MA", dogFriendly: true, shower: "on-site", groceryNearby: "Nearby", notes: "" },
    D: { label: "D", type: "Backup", name: "Emergency", location: "MA", dogFriendly: true, shower: "none", groceryNearby: "Gas", notes: "" },
  },
  groceryNearby: "Nearby",
  showerInfo: "Shower coverage: on-site, none",
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

export const stopsData: StopData[] = [
  homeStop,
  ...baseRoute.stops.map((raw) => {
    const stayOptions = toStayOptions(raw.stayOptions)
    const pos = coords[raw.name] ?? { lat: 39, lng: -96, x: 50, y: 25 }
    const phase = makePhase(raw.order)
    const type = makeType(raw)
    const routeLeg: RouteLegId = phase === "return" || phase === "turning-point" ? "return" : "outbound"
    const routeStyle: RouteStyle = phase === "return" || phase === "turning-point" ? "scenic-return" : "scenic-outbound"
    return {
      id: String(raw.order),
      order: raw.order,
      stepNumber: raw.order,
      name: raw.name,
      shortName: makeShortName(raw.name),
      state: raw.state,
      subtitle: raw.highlights.length > 0 ? raw.highlights.join(" • ") : `${raw.stayDuration} stop`,
      distance: `${raw.order * 210} mi`,
      totalMiles: raw.order * 210,
      driveTimeFromPrev: raw.driveTimeFromPrev,
      stayDuration: raw.stayDuration,
      highlights: raw.highlights,
      dogWalks: raw.dogWalks,
      areaWarnings: raw.areaWarnings,
      stayOptions,
      groceryNearby: stayOptions.A.groceryNearby,
      showerInfo: makeShowerInfo(stayOptions),
      type,
      phase,
      routeLeg,
      routeStyle,
      status: "future" as const,
      x: pos.x,
      y: pos.y,
      lat: pos.lat,
      lng: pos.lng,
      next: raw.order === baseRoute.stops.length ? [{ label: "Home", stopId: "0" }] : [{ label: makeShortName(baseRoute.stops[raw.order].name), stopId: String(raw.order + 1) }],
      appleMapsQuery: `${raw.name}, ${raw.state}`,
    }
  }),
]

export function getStayOptions(stop: StopData): StayOption[] {
  return [stop.stayOptions.A, stop.stayOptions.B, stop.stayOptions.C, stop.stayOptions.D]
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
