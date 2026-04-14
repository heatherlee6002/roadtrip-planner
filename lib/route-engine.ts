import { findNearestStop, getStopById, stopsData, type RouteLegId, type RouteStyle, type StopData } from "@/lib/stops-data"

export type RouteStrategy = "fallback" | "future-ai"

export type CurrentLocationContext =
  | { type: "gps"; lat: number; lng: number }
  | { type: "stop"; stopId: string }

export interface RouteDecisionContext {
  currentLocation: CurrentLocationContext
  currentLeg: RouteLegId
  routeStyle: RouteStyle
  completedStops: string[]
  remainingStops: string[]
}

export interface NextStopsResult {
  primaryStop: StopData | null
  alternatives: StopData[]
  reason: string
}

export function createRouteDecisionContext(params: {
  currentStopId: string
  userLocation?: { lat: number; lng: number } | null
}): RouteDecisionContext {
  const currentStop = getStopById(params.currentStopId)
  const currentLeg: RouteLegId = currentStop?.phase === "return" ? "return" : "outbound"
  const routeStyle: RouteStyle = currentLeg === "outbound" ? "coastal" : "inland"

  const currentIndex = stopsData.findIndex((stop) => stop.id === params.currentStopId)
  const completedStops = currentIndex >= 0 ? stopsData.slice(0, currentIndex + 1).map((s) => s.id) : []
  const remainingStops = currentIndex >= 0 ? stopsData.slice(currentIndex + 1).map((s) => s.id) : stopsData.map((s) => s.id)

  return {
    currentLocation: params.userLocation
      ? { type: "gps", lat: params.userLocation.lat, lng: params.userLocation.lng }
      : { type: "stop", stopId: params.currentStopId },
    currentLeg,
    routeStyle,
    completedStops,
    remainingStops,
  }
}

export function getNextStops(context: RouteDecisionContext, routeStrategy: RouteStrategy = "fallback"): NextStopsResult {
  if (routeStrategy === "future-ai") {
    // TODO(ai): Route this context into an AI/agent planner when smart mode is enabled.
    // Intentionally falls back for now to keep behavior deterministic.
  }

  const locationStopId =
    context.currentLocation.type === "stop"
      ? context.currentLocation.stopId
      : findNearestStop(context.currentLocation.lat, context.currentLocation.lng)?.stop.id

  const currentIndex = locationStopId ? stopsData.findIndex((stop) => stop.id === locationStopId) : -1
  const primaryIndex = currentIndex >= 0 ? currentIndex + 1 : 0

  if (primaryIndex >= stopsData.length) {
    return {
      primaryStop: stopsData[0] ?? null,
      alternatives: [],
      reason: "You are at the end of the fallback route, so the next stop loops back to home.",
    }
  }

  const primaryStop = stopsData[primaryIndex] ?? null
  const alternatives = stopsData.slice(primaryIndex + 1, primaryIndex + 4)

  const reason = `This keeps you on the ${context.routeStyle} ${context.currentLeg} fallback corridor from your current direction.`

  return {
    primaryStop,
    alternatives,
    reason,
  }
}
