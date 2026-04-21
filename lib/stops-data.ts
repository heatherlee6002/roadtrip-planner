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

const rec = (stopId: string, label: StayOptionLabel, rank: number, name: string, location: string, notes: string, verified = true): StayRecommendation => ({
  id: `${stopId}-${label}-${rank}`,
  name,
  location,
  appleMapsQuery: `${name} ${location}`,
  appleMapsUrl: `http://maps.apple.com/?q=${encodeURIComponent(`${name} ${location}`)}`,
  sourceType: verified ? "official" : "aggregator",
  notes,
  verified,
})

const makePlaceholderStop = (n: number): StopData => ({
  id: String(n),
  stepNumber: n,
  name: `Stop ${n}`,
  shortName: `Stop ${n}`,
  subtitle: `Route stop ${n}`,
  state: "Planned route stop",
  distance: "Route leg",
  totalMiles: n * 180,
  distanceMilesToNext: 180,
  driveTimeFromPrev: "3 hr",
  stayDuration: "1 night",
  plannedStayLabel: "TBD",
  phase: n < 18 ? "outbound" : n === 18 ? "turning-point" : "return",
  legId: n < 18 ? "outbound" : "return",
  type: "stay-friendly",
  appleMapsQuery: `Stop ${n}`,
  areaWarnings: { rating: 2, summary: "Placeholder route stop. Detailed verification still pending." },
  showerInfo: "Check final stop verification",
  groceryNearby: "Check final stop verification",
  dogWalks: [{ name: `Dog walk near Stop ${n}`, type: "mixed", leashRequired: true }],
  stayOptions: ["A","B","C","D"].map((label, idx) => ({
    label: label as StayOptionLabel,
    type: idx === 0 ? "Recommended" : idx === 1 ? "Fallback" : idx === 2 ? "Remote Option" : "Safety Fallback",
    name: idx === 2 ? "Not yet verified" : `Stop ${n} option ${label}`,
    location: `Stop ${n}`,
    dogFriendly: true,
    shower: idx === 2 ? "Unknown" : "Available or nearby",
    groceryNearby: "Nearby town services",
    notes: "Placeholder only. Final hard-check still pending.",
    rating: {
      safety: { level: "good", risk: "Final verification pending" },
      convenience: 3,
      cost: 3,
      comfort: 3,
    },
    recommendations: [
      rec(String(n), label as StayOptionLabel, 1, `Stop ${n} ${label} candidate 1`, `Stop ${n}`, "Placeholder only", false),
      rec(String(n), label as StayOptionLabel, 2, `Stop ${n} ${label} candidate 2`, `Stop ${n}`, "Placeholder only", false),
      rec(String(n), label as StayOptionLabel, 3, `Stop ${n} ${label} candidate 3`, `Stop ${n}`, "Placeholder only", false),
    ],
  })),
  next: [{ label: "Next", stopId: String(n + 1) }],
})

const firstFive: StopData[] = [
  {
    id: "1",
    stepNumber: 1,
    name: "State College, PA",
    shortName: "State College",
    subtitle: "State College, PA",
    state: "State College, PA",
    distance: "Verified stop",
    totalMiles: 210,
    distanceMilesToNext: 210,
    driveTimeFromPrev: "3–4 hr",
    stayDuration: "1 night",
    plannedStayLabel: "Safety-first stay",
    phase: "outbound",
    legId: "outbound",
    type: "stay-friendly",
    appleMapsQuery: "State College, PA",
    areaWarnings: { rating: 2, summary: "Safety-first filtered for dog-friendly stays and quieter options." },
    showerInfo: "Camp showers or nearby indoor fallback",
    groceryNearby: "Nearby town groceries available",
    dogWalks: [
      { name: "Black Moshannon State Park trails", type: "trail", leashRequired: true },
      { name: "Tudek Dog Park", type: "park", leashRequired: false },
    ],
    stayOptions: [
      {
        label: "A",
        type: "Recommended",
        name: "Black Moshannon State Park Campground",
        location: "State College, PA",
        dogFriendly: true,
        shower: "Available",
        groceryNearby: "Nearby town services",
        notes: "Primary quiet dog-friendly pick.",
        rating: { safety: { level: "excellent", risk: "Standard campground awareness" }, convenience: 4, cost: 3, comfort: 4 },
        recommendations: [
          rec("1", "A", 1, "Black Moshannon State Park Campground", "State College, PA", "Top verified candidate"),
          rec("1", "A", 2, "Poe Paddy State Park Campground", "State College, PA", "Second verified candidate"),
          rec("1", "A", 3, "The Penn Stater Hotel & Conference Center", "State College, PA", "Indoor fallback if weather or arrival timing shifts"),
        ],
      },
      {
        label: "B",
        type: "Fallback",
        name: "Poe Paddy State Park Campground",
        location: "State College, PA",
        dogFriendly: true,
        shower: "Available or nearby",
        groceryNearby: "Nearby town services",
        notes: "Backup if A is full.",
        rating: { safety: { level: "good", risk: "Check current availability and spacing" }, convenience: 4, cost: 3, comfort: 3 },
        recommendations: [
          rec("1", "B", 1, "Poe Paddy State Park Campground", "State College, PA", "Fallback verified candidate"),
          rec("1", "B", 2, "Black Moshannon State Park Campground", "State College, PA", "Use if fallback inventory changes"),
          rec("1", "B", 3, "The Penn Stater Hotel & Conference Center", "State College, PA", "Indoor fallback"),
        ],
      },
      {
        label: "C",
        type: "Remote Option",
        name: "Bald Eagle State Forest primitive camping",
        location: "State College, PA",
        dogFriendly: true,
        shower: "Usually none",
        groceryNearby: "Stock up first",
        notes: "Remote option only when verified comfortable on arrival.",
        rating: { safety: { level: "good", risk: "Lower services and weaker certainty" }, convenience: 2, cost: 5, comfort: 2 },
        recommendations: [
          rec("1", "C", 1, "Bald Eagle State Forest primitive camping", "State College, PA", "Remote-style option"),
          rec("1", "C", 2, "Black Moshannon State Park Campground", "State College, PA", "Use A instead if uncertainty remains"),
          rec("1", "C", 3, "The Penn Stater Hotel & Conference Center", "State College, PA", "Indoor fallback if needed"),
        ],
      },
      {
        label: "D",
        type: "Safety Fallback",
        name: "The Penn Stater Hotel & Conference Center",
        location: "State College, PA",
        dogFriendly: true,
        shower: "Private bathroom / hotel",
        groceryNearby: "Nearby town services",
        notes: "Best fallback for late arrival, weather, or safety concerns.",
        rating: { safety: { level: "excellent", risk: "Urban or lodge norms only" }, convenience: 5, cost: 2, comfort: 5 },
        recommendations: [
          rec("1", "D", 1, "The Penn Stater Hotel & Conference Center", "State College, PA", "Primary indoor fallback"),
          rec("1", "D", 2, "Black Moshannon State Park Campground", "State College, PA", "Return to campsite if conditions fit"),
          rec("1", "D", 3, "Poe Paddy State Park Campground", "State College, PA", "Second outdoor fallback"),
        ],
      },
    ],
    next: [{ label: "Next", stopId: "2" }],
  },
  {
    id: "2",
    stepNumber: 2,
    name: "Shenandoah NP, VA",
    shortName: "Shenandoah",
    subtitle: "Shenandoah NP, VA",
    state: "Shenandoah NP, VA",
    distance: "Verified stop",
    totalMiles: 420,
    distanceMilesToNext: 210,
    driveTimeFromPrev: "3–4 hr",
    stayDuration: "1 night",
    plannedStayLabel: "Safety-first stay",
    phase: "outbound",
    legId: "outbound",
    type: "stay-friendly",
    appleMapsQuery: "Shenandoah National Park, VA",
    areaWarnings: { rating: 2, summary: "Safety-first filtered for dog-friendly stays and quieter options." },
    showerInfo: "Camp showers or nearby indoor fallback",
    groceryNearby: "Nearby town groceries available",
    dogWalks: [
      { name: "Rose River Fire Road", type: "trail", leashRequired: true },
      { name: "Madison Run Fire Road", type: "trail", leashRequired: true },
    ],
    stayOptions: [
      {
        label: "A",
        type: "Recommended",
        name: "Loft Mountain Campground",
        location: "Shenandoah NP, VA",
        dogFriendly: true,
        shower: "Available",
        groceryNearby: "Nearby town services",
        notes: "Primary quiet dog-friendly pick.",
        rating: { safety: { level: "excellent", risk: "Standard campground awareness" }, convenience: 4, cost: 3, comfort: 4 },
        recommendations: [
          rec("2", "A", 1, "Loft Mountain Campground", "Shenandoah NP, VA", "Top verified candidate"),
          rec("2", "A", 2, "Big Meadows Campground", "Shenandoah NP, VA", "Second verified candidate"),
          rec("2", "A", 3, "Skyland Lodge", "Shenandoah NP, VA", "Indoor fallback if weather or arrival timing shifts"),
        ],
      },
      {
        label: "B",
        type: "Fallback",
        name: "Big Meadows Campground",
        location: "Shenandoah NP, VA",
        dogFriendly: true,
        shower: "Available or nearby",
        groceryNearby: "Nearby town services",
        notes: "Backup if A is full.",
        rating: { safety: { level: "good", risk: "Check current availability and spacing" }, convenience: 4, cost: 3, comfort: 3 },
        recommendations: [
          rec("2", "B", 1, "Big Meadows Campground", "Shenandoah NP, VA", "Fallback verified candidate"),
          rec("2", "B", 2, "Loft Mountain Campground", "Shenandoah NP, VA", "Use if fallback inventory changes"),
          rec("2", "B", 3, "Skyland Lodge", "Shenandoah NP, VA", "Indoor fallback"),
        ],
      },
      {
        label: "C",
        type: "Remote Option",
        name: "George Washington and Jefferson NF dispersed area",
        location: "Shenandoah NP, VA",
        dogFriendly: true,
        shower: "Usually none",
        groceryNearby: "Stock up first",
        notes: "Remote option only when verified comfortable on arrival.",
        rating: { safety: { level: "good", risk: "Lower services and weaker certainty" }, convenience: 2, cost: 5, comfort: 2 },
        recommendations: [
          rec("2", "C", 1, "George Washington and Jefferson NF dispersed area", "Shenandoah NP, VA", "Remote-style option"),
          rec("2", "C", 2, "Loft Mountain Campground", "Shenandoah NP, VA", "Use A instead if uncertainty remains"),
          rec("2", "C", 3, "Skyland Lodge", "Shenandoah NP, VA", "Indoor fallback if needed"),
        ],
      },
      {
        label: "D",
        type: "Safety Fallback",
        name: "Skyland Lodge",
        location: "Shenandoah NP, VA",
        dogFriendly: true,
        shower: "Private bathroom / hotel",
        groceryNearby: "Nearby town services",
        notes: "Best fallback for late arrival, weather, or safety concerns.",
        rating: { safety: { level: "excellent", risk: "Urban or lodge norms only" }, convenience: 5, cost: 2, comfort: 5 },
        recommendations: [
          rec("2", "D", 1, "Skyland Lodge", "Shenandoah NP, VA", "Primary indoor fallback"),
          rec("2", "D", 2, "Loft Mountain Campground", "Shenandoah NP, VA", "Return to campsite if conditions fit"),
          rec("2", "D", 3, "Big Meadows Campground", "Shenandoah NP, VA", "Second outdoor fallback"),
        ],
      },
    ],
    next: [{ label: "Next", stopId: "3" }],
  },
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
