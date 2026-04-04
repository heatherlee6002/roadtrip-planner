export type StopType = "stay-friendly" | "scenic-only" | "transit"
export type RoutePhase = "outbound" | "turning-point" | "return"

export interface StopData {
  id: string
  name: string
  shortName: string
  distance: string
  totalMiles: number
  subtitle: string
  x: number
  y: number
  lat: number
  lng: number
  status: "start" | "current" | "upcoming" | "future" | "completed"
  stepNumber?: number
  phase: RoutePhase
  type: StopType
  stay: { letter: string; name: string; appleMapsQuery?: string }[]
  dog: { primary: string; primaryQuery?: string; secondary?: string; secondaryQuery?: string; restrictions?: string }
  next: { label: string; stopId?: string }[]
  emergency: { label: string; appleMapsQuery?: string }[]
  logistics: { groceries: string; groceriesQuery?: string; gas: string; gasQuery?: string }
  notes?: string
  appleMapsQuery: string
}

export const stopsData: StopData[] = [
  // START
  {
    id: "0",
    name: "Gloucester, MA",
    shortName: "Gloucester",
    distance: "Start",
    totalMiles: 0,
    subtitle: "Starting point",
    x: 95,
    y: 8,
    lat: 42.6159,
    lng: -70.6620,
    status: "start",
    phase: "outbound",
    type: "stay-friendly",
    stay: [],
    dog: { primary: "Good Harbor Beach", primaryQuery: "Good Harbor Beach, Gloucester, MA", secondary: "Dogtown trails", secondaryQuery: "Dogtown Commons, Gloucester, MA" },
    next: [{ label: "Central PA", stopId: "1" }],
    emergency: [{ label: "Home base", appleMapsQuery: "Gloucester, MA" }],
    logistics: { groceries: "Market Basket", groceriesQuery: "Market Basket, Gloucester, MA", gas: "Route 128", gasQuery: "Gas Station, Route 128, MA" },
    appleMapsQuery: "Gloucester, MA",
  },
  // OUTBOUND STOPS (1-10)
  {
    id: "1",
    name: "Central Pennsylvania",
    shortName: "Central PA",
    distance: "380 mi",
    totalMiles: 380,
    subtitle: "State College area",
    x: 82,
    y: 14,
    lat: 40.7934,
    lng: -77.8600,
    status: "upcoming",
    stepNumber: 1,
    phase: "outbound",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Bald Eagle State Park campground", appleMapsQuery: "Bald Eagle State Park, PA" },
      { letter: "B", name: "Bald Eagle State Forest dispersed", appleMapsQuery: "Bald Eagle State Forest, PA" },
      { letter: "C", name: "Bellefonte / State College private", appleMapsQuery: "State College, PA" },
      { letter: "D", name: "Walmart Supercenter (State College)", appleMapsQuery: "Walmart Supercenter, State College, PA" },
    ],
    dog: { primary: "Bald Eagle State Park trails", primaryQuery: "Bald Eagle State Park, PA", secondary: "State forest roads and lakes", secondaryQuery: "Bald Eagle State Forest, PA" },
    next: [{ label: "Shenandoah", stopId: "2" }, { label: "Skip ahead", stopId: "3" }],
    emergency: [{ label: "Pilot / Flying J (I-80)", appleMapsQuery: "Pilot Travel Center, Bellefonte, PA" }, { label: "Walmart overnight", appleMapsQuery: "Walmart, State College, PA" }],
    logistics: { groceries: "Wegmans / Walmart", groceriesQuery: "Wegmans, State College, PA", gas: "I-80 exits", gasQuery: "Gas Station, I-80, PA" },
    appleMapsQuery: "State College, PA",
  },
  {
    id: "2",
    name: "Shenandoah / Harrisonburg",
    shortName: "Shenandoah",
    distance: "580 mi",
    totalMiles: 580,
    subtitle: "Blue Ridge Parkway access",
    x: 75,
    y: 20,
    lat: 38.4496,
    lng: -78.8689,
    status: "future",
    stepNumber: 2,
    phase: "outbound",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Shenandoah NP campground (Big Meadows)", appleMapsQuery: "Big Meadows Campground, Shenandoah National Park, VA" },
      { letter: "B", name: "George Washington NF dispersed", appleMapsQuery: "George Washington National Forest, VA" },
      { letter: "C", name: "Harrisonburg private campground", appleMapsQuery: "Campground, Harrisonburg, VA" },
      { letter: "D", name: "Walmart (Harrisonburg)", appleMapsQuery: "Walmart, Harrisonburg, VA" },
    ],
    dog: { primary: "Shenandoah NP trails (leashed)", primaryQuery: "Shenandoah National Park, VA", secondary: "George Washington NF off-leash areas", secondaryQuery: "George Washington National Forest, VA" },
    next: [{ label: "SW VA / E TN", stopId: "3" }, { label: "Smokies direct", stopId: "4" }],
    emergency: [{ label: "Pilot (I-81)", appleMapsQuery: "Pilot Travel Center, I-81, VA" }, { label: "Harrisonburg hotels", appleMapsQuery: "Hotels, Harrisonburg, VA" }],
    logistics: { groceries: "Kroger / Food Lion", groceriesQuery: "Kroger, Harrisonburg, VA", gas: "I-81 corridor", gasQuery: "Gas Station, I-81, Harrisonburg, VA" },
    appleMapsQuery: "Harrisonburg, VA",
  },
  {
    id: "3",
    name: "SW Virginia / E Tennessee",
    shortName: "SW VA / E TN",
    distance: "720 mi",
    totalMiles: 720,
    subtitle: "Appalachian transition",
    x: 68,
    y: 26,
    lat: 36.7088,
    lng: -82.0197,
    status: "future",
    stepNumber: 3,
    phase: "outbound",
    type: "transit",
    stay: [
      { letter: "A", name: "Jefferson NF campground", appleMapsQuery: "Jefferson National Forest Campground, VA" },
      { letter: "B", name: "Cherokee NF dispersed", appleMapsQuery: "Cherokee National Forest, TN" },
      { letter: "C", name: "Bristol / Abingdon private", appleMapsQuery: "Campground, Abingdon, VA" },
      { letter: "D", name: "Truck stop (I-81)", appleMapsQuery: "Pilot Travel Center, I-81, Abingdon, VA" },
    ],
    dog: { primary: "Jefferson NF trails", primaryQuery: "Jefferson National Forest, VA", secondary: "Creeper Trail sections", secondaryQuery: "Virginia Creeper Trail, VA" },
    next: [{ label: "Smokies Base", stopId: "4" }, { label: "Great Smokies", stopId: "5" }],
    emergency: [{ label: "Love's / Pilot (I-81)", appleMapsQuery: "Love's Travel Stop, I-81, VA" }, { label: "Bristol hotels", appleMapsQuery: "Hotels, Bristol, VA" }],
    logistics: { groceries: "Food City / Ingles", groceriesQuery: "Food City, Abingdon, VA", gas: "I-81 / US-19", gasQuery: "Gas Station, I-81, Abingdon, VA" },
    appleMapsQuery: "Abingdon, VA",
  },
  {
    id: "4",
    name: "Asheville / Pisgah",
    shortName: "Smokies Base",
    distance: "820 mi",
    totalMiles: 820,
    subtitle: "Pisgah NF gateway",
    x: 62,
    y: 32,
    lat: 35.5951,
    lng: -82.5515,
    status: "future",
    stepNumber: 4,
    phase: "outbound",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Pisgah NF campground (Davidson River)", appleMapsQuery: "Davidson River Campground, Pisgah Forest, NC" },
      { letter: "B", name: "Pisgah NF dispersed", appleMapsQuery: "Pisgah National Forest, NC" },
      { letter: "C", name: "Asheville area private", appleMapsQuery: "Campground, Asheville, NC" },
      { letter: "D", name: "Walmart (Asheville / Canton)", appleMapsQuery: "Walmart, Canton, NC" },
    ],
    dog: { primary: "Pisgah NF trails", primaryQuery: "Pisgah National Forest, NC", secondary: "Blue Ridge Parkway overlooks", secondaryQuery: "Blue Ridge Parkway, NC" },
    next: [{ label: "Great Smokies", stopId: "5" }, { label: "Midwest", stopId: "6" }],
    emergency: [{ label: "Asheville hospitals", appleMapsQuery: "Mission Hospital, Asheville, NC" }, { label: "I-40 truck stops", appleMapsQuery: "Pilot Travel Center, I-40, NC" }],
    logistics: { groceries: "Ingles / Earth Fare", groceriesQuery: "Ingles, Asheville, NC", gas: "I-40 / US-19", gasQuery: "Gas Station, I-40, Asheville, NC" },
    appleMapsQuery: "Asheville, NC",
  },
  {
    id: "5",
    name: "Great Smoky Mountains",
    shortName: "Great Smokies",
    distance: "920 mi",
    totalMiles: 920,
    subtitle: "National Park",
    x: 56,
    y: 36,
    lat: 35.6118,
    lng: -83.4895,
    status: "future",
    stepNumber: 5,
    phase: "outbound",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "GSMNP campground (Cades Cove / Elkmont)", appleMapsQuery: "Elkmont Campground, Great Smoky Mountains, TN" },
      { letter: "B", name: "Cherokee NF dispersed", appleMapsQuery: "Cherokee National Forest, TN" },
      { letter: "C", name: "Gatlinburg / Townsend private", appleMapsQuery: "Campground, Gatlinburg, TN" },
      { letter: "D", name: "Walmart (Sevierville)", appleMapsQuery: "Walmart, Sevierville, TN" },
    ],
    dog: { primary: "Gatlinburg Trail (only NP trail for dogs)", primaryQuery: "Gatlinburg Trail, Great Smoky Mountains, TN", secondary: "Cherokee NF trails", secondaryQuery: "Cherokee National Forest, TN", restrictions: "Dogs limited to 2 trails in GSMNP" },
    next: [{ label: "Midwest transit", stopId: "6" }],
    emergency: [{ label: "LeConte Medical Center", appleMapsQuery: "LeConte Medical Center, Sevierville, TN" }, { label: "Sevierville hotels", appleMapsQuery: "Hotels, Sevierville, TN" }],
    logistics: { groceries: "Food City / Kroger", groceriesQuery: "Food City, Gatlinburg, TN", gas: "Gatlinburg / Pigeon Forge", gasQuery: "Gas Station, Pigeon Forge, TN" },
    notes: "Dogs restricted in most of GSMNP - plan Cherokee NF alternatives",
    appleMapsQuery: "Gatlinburg, TN",
  },
  {
    id: "6",
    name: "Midwest Transit",
    shortName: "Missouri / Iowa",
    distance: "1,400 mi",
    totalMiles: 1400,
    subtitle: "Fast pass - minimal stop",
    x: 45,
    y: 32,
    lat: 38.9517,
    lng: -92.3341,
    status: "future",
    stepNumber: 6,
    phase: "outbound",
    type: "transit",
    stay: [
      { letter: "A", name: "Mark Twain NF campground", appleMapsQuery: "Mark Twain National Forest Campground, MO" },
      { letter: "B", name: "Mark Twain NF dispersed", appleMapsQuery: "Mark Twain National Forest, MO" },
      { letter: "C", name: "I-70 / I-80 corridor private", appleMapsQuery: "Campground, Columbia, MO" },
      { letter: "D", name: "Pilot / Flying J overnight", appleMapsQuery: "Pilot Travel Center, Columbia, MO" },
    ],
    dog: { primary: "Mark Twain NF brief stops", primaryQuery: "Mark Twain National Forest, MO", secondary: "Rest areas", secondaryQuery: "Rest Area, I-70, MO" },
    next: [{ label: "Badlands", stopId: "7" }],
    emergency: [{ label: "I-70 / I-80 truck stops", appleMapsQuery: "Pilot Travel Center, I-70, MO" }, { label: "Walmart (Columbia / Des Moines)", appleMapsQuery: "Walmart, Columbia, MO" }],
    logistics: { groceries: "Hy-Vee / Walmart", groceriesQuery: "Hy-Vee, Columbia, MO", gas: "Interstate exits", gasQuery: "Gas Station, I-70, Columbia, MO" },
    notes: "Transit zone - keep moving toward Badlands",
    appleMapsQuery: "Columbia, MO",
  },
  {
    id: "7",
    name: "Badlands / Black Hills",
    shortName: "Badlands",
    distance: "1,800 mi",
    totalMiles: 1800,
    subtitle: "South Dakota",
    x: 35,
    y: 22,
    lat: 43.8554,
    lng: -102.3397,
    status: "future",
    stepNumber: 7,
    phase: "outbound",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Badlands NP campground (Sage Creek)", appleMapsQuery: "Sage Creek Campground, Badlands National Park, SD" },
      { letter: "B", name: "Buffalo Gap NG dispersed", appleMapsQuery: "Buffalo Gap National Grassland, SD" },
      { letter: "C", name: "Wall / Rapid City private", appleMapsQuery: "Campground, Rapid City, SD" },
      { letter: "D", name: "Walmart (Rapid City)", appleMapsQuery: "Walmart, Rapid City, SD" },
    ],
    dog: { primary: "Buffalo Gap National Grassland", primaryQuery: "Buffalo Gap National Grassland, SD", secondary: "Black Hills NF trails", secondaryQuery: "Black Hills National Forest, SD" },
    next: [{ label: "Yellowstone", stopId: "8" }],
    emergency: [{ label: "Rapid City Regional Hospital", appleMapsQuery: "Rapid City Regional Hospital, SD" }, { label: "Wall truck stops", appleMapsQuery: "Travel Center, Wall, SD" }],
    logistics: { groceries: "Safeway (Rapid City)", groceriesQuery: "Safeway, Rapid City, SD", gas: "I-90 corridor", gasQuery: "Gas Station, I-90, Rapid City, SD" },
    appleMapsQuery: "Badlands National Park, SD",
  },
  {
    id: "8",
    name: "Yellowstone",
    shortName: "Yellowstone",
    distance: "2,200 mi",
    totalMiles: 2200,
    subtitle: "Scenic only - dog restrictions",
    x: 25,
    y: 18,
    lat: 44.4280,
    lng: -110.5885,
    status: "future",
    stepNumber: 8,
    phase: "outbound",
    type: "scenic-only",
    stay: [
      { letter: "A", name: "Yellowstone NP campground (limited)", appleMapsQuery: "Madison Campground, Yellowstone National Park, WY" },
      { letter: "B", name: "Gallatin / Shoshone NF dispersed", appleMapsQuery: "Gallatin National Forest, MT" },
      { letter: "C", name: "West Yellowstone / Cody private", appleMapsQuery: "Campground, West Yellowstone, MT" },
      { letter: "D", name: "Walmart (West Yellowstone)", appleMapsQuery: "Walmart, West Yellowstone, MT" },
    ],
    dog: { primary: "Dogs NOT allowed on trails/boardwalks", primaryQuery: "Yellowstone National Park, WY", secondary: "Gallatin NF outside park", secondaryQuery: "Gallatin National Forest, MT", restrictions: "Dogs restricted to parking lots, campgrounds, roads only" },
    next: [{ label: "Utah", stopId: "9" }],
    emergency: [{ label: "West Yellowstone clinic", appleMapsQuery: "Clinic, West Yellowstone, MT" }, { label: "Bozeman hospital", appleMapsQuery: "Bozeman Health, Bozeman, MT" }],
    logistics: { groceries: "Albertsons (West Yellowstone)", groceriesQuery: "Albertsons, West Yellowstone, MT", gas: "Park entrances", gasQuery: "Gas Station, West Yellowstone, MT" },
    notes: "SCENIC ONLY - dogs cannot hike. Drive through for views, stay in national forest outside.",
    appleMapsQuery: "West Yellowstone, MT",
  },
  {
    id: "9",
    name: "Utah Parks",
    shortName: "Utah",
    distance: "2,600 mi",
    totalMiles: 2600,
    subtitle: "Zion / Bryce / Escalante",
    x: 18,
    y: 42,
    lat: 37.0474,
    lng: -111.9429,
    status: "future",
    stepNumber: 9,
    phase: "outbound",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Dixie NF campground", appleMapsQuery: "Dixie National Forest Campground, UT" },
      { letter: "B", name: "BLM land dispersed (Escalante)", appleMapsQuery: "Grand Staircase-Escalante, UT" },
      { letter: "C", name: "Springdale / Kanab private", appleMapsQuery: "Campground, Kanab, UT" },
      { letter: "D", name: "Walmart (St. George / Cedar City)", appleMapsQuery: "Walmart, St. George, UT" },
    ],
    dog: { primary: "BLM land - wide open", primaryQuery: "Grand Staircase-Escalante, UT", secondary: "Dixie NF trails", secondaryQuery: "Dixie National Forest, UT", restrictions: "Dogs limited in Zion/Bryce NPs" },
    next: [{ label: "Nevada transit", stopId: "10" }, { label: "California", stopId: "11" }],
    emergency: [{ label: "St. George hospital", appleMapsQuery: "St. George Regional Hospital, UT" }, { label: "Cedar City hotels", appleMapsQuery: "Hotels, Cedar City, UT" }],
    logistics: { groceries: "Smith's / Walmart", groceriesQuery: "Smith's, Kanab, UT", gas: "I-15 corridor", gasQuery: "Gas Station, I-15, UT" },
    notes: "BLM land = best dog freedom of the trip. National parks restrict dogs.",
    appleMapsQuery: "Kanab, UT",
  },
  {
    id: "10",
    name: "Nevada Transit",
    shortName: "Nevada",
    distance: "2,900 mi",
    totalMiles: 2900,
    subtitle: "Fast pass to coast",
    x: 10,
    y: 50,
    lat: 39.5296,
    lng: -119.8138,
    status: "future",
    stepNumber: 10,
    phase: "outbound",
    type: "transit",
    stay: [
      { letter: "A", name: "Humboldt-Toiyabe NF campground", appleMapsQuery: "Humboldt-Toiyabe National Forest Campground, NV" },
      { letter: "B", name: "BLM dispersed (many options)", appleMapsQuery: "BLM Land, Nevada" },
      { letter: "C", name: "Reno area private", appleMapsQuery: "Campground, Reno, NV" },
      { letter: "D", name: "Casino parking (many allow overnight)", appleMapsQuery: "Casino, Reno, NV" },
    ],
    dog: { primary: "BLM land - open desert", primaryQuery: "BLM Land, Nevada", secondary: "Humboldt NF trails", secondaryQuery: "Humboldt-Toiyabe National Forest, NV" },
    next: [{ label: "N California", stopId: "11" }],
    emergency: [{ label: "Reno hospitals", appleMapsQuery: "Renown Regional Medical Center, Reno, NV" }, { label: "I-80 truck stops", appleMapsQuery: "Pilot Travel Center, I-80, Reno, NV" }],
    logistics: { groceries: "Raley's / Walmart (Reno)", groceriesQuery: "Raley's, Reno, NV", gas: "I-80 corridor", gasQuery: "Gas Station, I-80, Reno, NV" },
    notes: "Transit zone - push through to coast",
    appleMapsQuery: "Reno, NV",
  },
  // TURNING POINT (11)
  {
    id: "11",
    name: "Northern California Coast",
    shortName: "N California",
    distance: "3,200 mi",
    totalMiles: 3200,
    subtitle: "TURNING POINT - dog beaches",
    x: 5,
    y: 58,
    lat: 39.4457,
    lng: -123.8053,
    status: "future",
    stepNumber: 11,
    phase: "turning-point",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "State park campgrounds (reservations)", appleMapsQuery: "MacKerricher State Park, Fort Bragg, CA" },
      { letter: "B", name: "National forest dispersed", appleMapsQuery: "Mendocino National Forest, CA" },
      { letter: "C", name: "Mendocino / Fort Bragg private", appleMapsQuery: "Campground, Fort Bragg, CA" },
      { letter: "D", name: "Walmart (Ukiah)", appleMapsQuery: "Walmart, Ukiah, CA" },
    ],
    dog: { primary: "Dog-friendly beaches - Fort Bragg, Mendocino", primaryQuery: "Glass Beach, Fort Bragg, CA", secondary: "Redwood forest trails (leashed)", secondaryQuery: "Jackson Demonstration State Forest, CA" },
    next: [{ label: "Oregon Coast", stopId: "12" }],
    emergency: [{ label: "Mendocino Coast Hospital", appleMapsQuery: "Mendocino Coast District Hospital, Fort Bragg, CA" }, { label: "Fort Bragg hotels", appleMapsQuery: "Hotels, Fort Bragg, CA" }],
    logistics: { groceries: "Harvest Market / Safeway", groceriesQuery: "Harvest Market, Fort Bragg, CA", gas: "Highway 1 towns", gasQuery: "Gas Station, Fort Bragg, CA" },
    notes: "TURNING POINT - relax here. Dog beaches, redwoods, coastal views.",
    appleMapsQuery: "Fort Bragg, CA",
  },
  // RETURN ROUTE (12-17) - Pushed North for variety
  {
    id: "12",
    name: "Oregon Coast",
    shortName: "Oregon Coast",
    distance: "3,600 mi",
    totalMiles: 3600,
    subtitle: "Coastal route north",
    x: 5,
    y: 40,
    lat: 43.3665,
    lng: -124.2179,
    status: "future",
    stepNumber: 12,
    phase: "return",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Oregon Dunes NRA campground", appleMapsQuery: "Oregon Dunes National Recreation Area, OR" },
      { letter: "B", name: "Siuslaw NF dispersed", appleMapsQuery: "Siuslaw National Forest, OR" },
      { letter: "C", name: "Florence / Coos Bay private", appleMapsQuery: "Campground, Florence, OR" },
      { letter: "D", name: "Walmart (Coos Bay)", appleMapsQuery: "Walmart, Coos Bay, OR" },
    ],
    dog: { primary: "Oregon beaches - most dog-friendly", primaryQuery: "Oregon Dunes Beach, OR", secondary: "Oregon Dunes hiking", secondaryQuery: "Oregon Dunes National Recreation Area, OR", restrictions: "Some seasonal bird nesting closures" },
    next: [{ label: "Idaho", stopId: "13" }],
    emergency: [{ label: "Bay Area Hospital (Coos Bay)", appleMapsQuery: "Bay Area Hospital, Coos Bay, OR" }, { label: "Florence hotels", appleMapsQuery: "Hotels, Florence, OR" }],
    logistics: { groceries: "Fred Meyer / Safeway", groceriesQuery: "Fred Meyer, Florence, OR", gas: "Highway 101", gasQuery: "Gas Station, Highway 101, Florence, OR" },
    notes: "Beautiful coastal drive - dogs allowed on most Oregon beaches",
    appleMapsQuery: "Coos Bay, OR",
  },
  {
    id: "13",
    name: "Idaho Panhandle",
    shortName: "Idaho",
    distance: "4,100 mi",
    totalMiles: 4100,
    subtitle: "Coeur d'Alene area",
    x: 15,
    y: 18,
    lat: 47.6777,
    lng: -116.7805,
    status: "future",
    stepNumber: 13,
    phase: "return",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Idaho Panhandle NF campground", appleMapsQuery: "Idaho Panhandle National Forest Campground, ID" },
      { letter: "B", name: "Idaho Panhandle NF dispersed", appleMapsQuery: "Idaho Panhandle National Forest, ID" },
      { letter: "C", name: "Coeur d'Alene area private", appleMapsQuery: "Campground, Coeur d'Alene, ID" },
      { letter: "D", name: "Walmart (Post Falls)", appleMapsQuery: "Walmart, Post Falls, ID" },
    ],
    dog: { primary: "Idaho Panhandle NF trails", primaryQuery: "Idaho Panhandle National Forest, ID", secondary: "Coeur d'Alene lakefront", secondaryQuery: "Coeur d'Alene Lake, ID" },
    next: [{ label: "Montana", stopId: "14" }],
    emergency: [{ label: "Kootenai Health (Coeur d'Alene)", appleMapsQuery: "Kootenai Health, Coeur d'Alene, ID" }, { label: "I-90 truck stops", appleMapsQuery: "Pilot Travel Center, I-90, ID" }],
    logistics: { groceries: "WinCo / Safeway", groceriesQuery: "WinCo Foods, Coeur d'Alene, ID", gas: "I-90 corridor", gasQuery: "Gas Station, I-90, Coeur d'Alene, ID" },
    appleMapsQuery: "Coeur d'Alene, ID",
  },
  {
    id: "14",
    name: "Montana Glacier Area",
    shortName: "Montana",
    distance: "4,400 mi",
    totalMiles: 4400,
    subtitle: "Flathead NF / Glacier Gateway",
    x: 25,
    y: 10,
    lat: 48.3118,
    lng: -114.3533,
    status: "future",
    stepNumber: 14,
    phase: "return",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Flathead NF campground", appleMapsQuery: "Flathead National Forest Campground, MT" },
      { letter: "B", name: "Flathead NF dispersed", appleMapsQuery: "Flathead National Forest, MT" },
      { letter: "C", name: "Kalispell / Whitefish private", appleMapsQuery: "Campground, Whitefish, MT" },
      { letter: "D", name: "Walmart (Kalispell)", appleMapsQuery: "Walmart, Kalispell, MT" },
    ],
    dog: { primary: "Flathead NF trails (no grizzly closures)", primaryQuery: "Flathead National Forest, MT", secondary: "Whitefish town trails", secondaryQuery: "Whitefish Trail, MT", restrictions: "Dogs limited in Glacier NP" },
    next: [{ label: "North Dakota", stopId: "15" }],
    emergency: [{ label: "Kalispell Regional Medical", appleMapsQuery: "Kalispell Regional Medical Center, MT" }, { label: "US-2 hotels", appleMapsQuery: "Hotels, Kalispell, MT" }],
    logistics: { groceries: "Safeway / Super 1", groceriesQuery: "Safeway, Kalispell, MT", gas: "US-2 / US-93", gasQuery: "Gas Station, US-93, Kalispell, MT" },
    notes: "Stay in Flathead NF - Glacier NP restricts dogs significantly",
    appleMapsQuery: "Kalispell, MT",
  },
  {
    id: "15",
    name: "North Dakota / Minnesota",
    shortName: "ND / MN",
    distance: "5,000 mi",
    totalMiles: 5000,
    subtitle: "Theodore Roosevelt NP area",
    x: 45,
    y: 12,
    lat: 46.9769,
    lng: -103.5387,
    status: "future",
    stepNumber: 15,
    phase: "return",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Theodore Roosevelt NP campground", appleMapsQuery: "Cottonwood Campground, Theodore Roosevelt National Park, ND" },
      { letter: "B", name: "Dakota Prairie NG dispersed", appleMapsQuery: "Dakota Prairie National Grassland, ND" },
      { letter: "C", name: "Medora / Dickinson private", appleMapsQuery: "Campground, Medora, ND" },
      { letter: "D", name: "Walmart (Dickinson)", appleMapsQuery: "Walmart, Dickinson, ND" },
    ],
    dog: { primary: "Dakota Prairie National Grassland", primaryQuery: "Dakota Prairie National Grassland, ND", secondary: "Theodore Roosevelt NP (leashed)", secondaryQuery: "Theodore Roosevelt National Park, ND", restrictions: "Dogs on leash in NP" },
    next: [{ label: "Wisconsin", stopId: "16" }],
    emergency: [{ label: "CHI St. Alexius (Dickinson)", appleMapsQuery: "CHI St. Alexius Health, Dickinson, ND" }, { label: "I-94 truck stops", appleMapsQuery: "Pilot Travel Center, I-94, Dickinson, ND" }],
    logistics: { groceries: "Cashwise Foods / Walmart", groceriesQuery: "Cashwise Foods, Dickinson, ND", gas: "I-94 corridor", gasQuery: "Gas Station, I-94, Dickinson, ND" },
    appleMapsQuery: "Medora, ND",
  },
  {
    id: "16",
    name: "Wisconsin / Upper Michigan",
    shortName: "WI / UP",
    distance: "5,600 mi",
    totalMiles: 5600,
    subtitle: "Great Lakes route",
    x: 62,
    y: 14,
    lat: 46.5436,
    lng: -87.3953,
    status: "future",
    stepNumber: 16,
    phase: "return",
    type: "stay-friendly",
    stay: [
      { letter: "A", name: "Hiawatha NF campground", appleMapsQuery: "Hiawatha National Forest Campground, MI" },
      { letter: "B", name: "National forest dispersed", appleMapsQuery: "Hiawatha National Forest, MI" },
      { letter: "C", name: "Marquette area private", appleMapsQuery: "Campground, Marquette, MI" },
      { letter: "D", name: "Walmart (Marquette)", appleMapsQuery: "Walmart, Marquette, MI" },
    ],
    dog: { primary: "Hiawatha NF trails", primaryQuery: "Hiawatha National Forest, MI", secondary: "Lake Superior shoreline", secondaryQuery: "Lake Superior, Marquette, MI" },
    next: [{ label: "Northeast", stopId: "17" }],
    emergency: [{ label: "UP Health System (Marquette)", appleMapsQuery: "UP Health System, Marquette, MI" }, { label: "US-2 / US-41 hotels", appleMapsQuery: "Hotels, Marquette, MI" }],
    logistics: { groceries: "Tadych's Econo Foods / Walmart", groceriesQuery: "Walmart, Marquette, MI", gas: "US-2 / US-41", gasQuery: "Gas Station, US-41, Marquette, MI" },
    notes: "Beautiful Great Lakes scenery - different from outbound route",
    appleMapsQuery: "Marquette, MI",
  },
  {
    id: "17",
    name: "Upstate NY / Vermont",
    shortName: "NY / VT",
    distance: "6,100 mi",
    totalMiles: 6100,
    subtitle: "Final stretch - Adirondacks",
    x: 85,
    y: 10,
    lat: 44.0012,
    lng: -73.7503,
    status: "future",
    stepNumber: 17,
    phase: "return",
    type: "transit",
    stay: [
      { letter: "A", name: "Green Mountain NF campground", appleMapsQuery: "Green Mountain National Forest Campground, VT" },
      { letter: "B", name: "Adirondack Park dispersed", appleMapsQuery: "Adirondack Park, NY" },
      { letter: "C", name: "Lake Placid / Burlington private", appleMapsQuery: "Campground, Lake Placid, NY" },
      { letter: "D", name: "Walmart (Plattsburgh)", appleMapsQuery: "Walmart, Plattsburgh, NY" },
    ],
    dog: { primary: "Adirondack trails", primaryQuery: "Adirondack Park, NY", secondary: "Green Mountain NF", secondaryQuery: "Green Mountain National Forest, VT" },
    next: [{ label: "Gloucester", stopId: "0" }],
    emergency: [{ label: "UVM Medical Center (Burlington)", appleMapsQuery: "UVM Medical Center, Burlington, VT" }, { label: "I-87 / I-89 hotels", appleMapsQuery: "Hotels, Lake Placid, NY" }],
    logistics: { groceries: "Hannaford / Price Chopper", groceriesQuery: "Hannaford, Lake Placid, NY", gas: "I-87 / I-89", gasQuery: "Gas Station, I-87, Lake Placid, NY" },
    notes: "Almost home - beautiful New England finish through mountains",
    appleMapsQuery: "Lake Placid, NY",
  },
]

export function getStopById(id: string): StopData | undefined {
  return stopsData.find((stop) => stop.id === id)
}

export function getNextStopIndex(currentIndex: number): number {
  return Math.min(currentIndex + 1, stopsData.length - 1)
}

export function getStopsByPhase(phase: RoutePhase): StopData[] {
  return stopsData.filter((stop) => stop.phase === phase)
}

export function calculateProgress(currentStopId: string): number {
  const currentStop = getStopById(currentStopId)
  if (!currentStop) return 0
  const totalMiles = stopsData[stopsData.length - 1].totalMiles
  return Math.round((currentStop.totalMiles / totalMiles) * 100)
}

export function findNearestStop(lat: number, lng: number): { stop: StopData; distanceMiles: number } | null {
  const R = 3959 // Earth's radius in miles
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
