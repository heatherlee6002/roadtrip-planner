import type { StopData } from "@/lib/stops-data"

export const TRIP_DAY_RANGE = {
  minDays: 28,
  maxDays: 42,
} as const

export type ScheduleRisk = "on-track" | "watch" | "delayed"

export interface LiveTripState {
  tripStartDate: string
  currentStep: number
  currentStopArrivalDate: string
  now: string
  currentLat: number | null
  currentLng: number | null
  offRouteMinutes: number
}

export const liveTripStateMock: LiveTripState = {
  tripStartDate: "2026-06-01T09:00:00.000Z",
  currentStep: 8,
  currentStopArrivalDate: "2026-06-12T18:00:00.000Z",
  now: "2026-06-14T10:00:00.000Z",
  currentLat: null,
  currentLng: null,
  offRouteMinutes: 0,
}

export function getElapsedTripDays(tripStartDate: string, now: Date = new Date()): number {
  const start = new Date(tripStartDate).getTime()
  const end = new Date(now).getTime()
  const diffMs = Math.max(0, end - start)
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
}

export function getHoursStayedAtCurrentStop(currentStopArrivalDate: string, now: Date = new Date()): number {
  const arrival = new Date(currentStopArrivalDate).getTime()
  const end = new Date(now).getTime()
  const diffMs = Math.max(0, end - arrival)
  return diffMs / (1000 * 60 * 60)
}

export function getDaysStayedAtCurrentStop(currentStopArrivalDate: string, now: Date = new Date()): number {
  return getHoursStayedAtCurrentStop(currentStopArrivalDate, now) / 24
}

export function getTotalRouteDistance(routeStops: StopData[]): number {
  return routeStops.reduce((sum, stop) => sum + (stop.distanceMilesToNext || 0), 0)
}

export function getCompletedRouteDistance(routeStops: StopData[], currentStep: number): number {
  return routeStops
    .filter((stop) => (stop.stepNumber ?? stop.order) < currentStep)
    .reduce((sum, stop) => sum + (stop.distanceMilesToNext || 0), 0)
}

export function getCurrentLegDistance(routeStops: StopData[], currentStep: number): number {
  const current = routeStops.find((stop) => (stop.stepNumber ?? stop.order) === currentStep)
  return current?.distanceMilesToNext || 0
}

export function getRemainingRouteDistance(routeStops: StopData[], currentStep: number): number {
  return routeStops
    .filter((stop) => (stop.stepNumber ?? stop.order) >= currentStep)
    .reduce((sum, stop) => sum + (stop.distanceMilesToNext || 0), 0)
}

export function getDistanceProgressPercent(routeStops: StopData[], currentStep: number): number {
  const total = getTotalRouteDistance(routeStops)
  const completed = getCompletedRouteDistance(routeStops, currentStep)
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

export function getTripDayProgressPercent(elapsedDays: number, maxDays = TRIP_DAY_RANGE.maxDays): number {
  if (!maxDays) return 0
  return Math.min(100, Math.round((elapsedDays / maxDays) * 100))
}

export function isStayingTooLong(currentStopArrivalDate: string, plannedStayDays: number, now: Date = new Date()): boolean {
  const stayedDays = getDaysStayedAtCurrentStop(currentStopArrivalDate, now)
  return stayedDays > plannedStayDays
}

export function getScheduleRisk(currentStopArrivalDate: string, plannedStayDays: number, now: Date = new Date()): ScheduleRisk {
  const overflowDays = getDaysStayedAtCurrentStop(currentStopArrivalDate, now) - plannedStayDays
  if (overflowDays <= 0) return "on-track"
  if (overflowDays < 1.5) return "watch"
  return "delayed"
}

interface OffRouteDetectionInput {
  currentLat: number | null
  currentLng: number | null
  currentStopLat: number
  currentStopLng: number
  nextStopLat: number
  nextStopLng: number
  offRouteThresholdMiles?: number
  offRouteDurationMinutes?: number
  currentDistanceFromExpectedCorridorMiles?: number
  minutesOffRoute?: number
}

export function detectOffRouteStatus({
  currentLat,
  currentLng,
  currentStopLat,
  currentStopLng,
  nextStopLat,
  nextStopLng,
  offRouteThresholdMiles = 25,
  offRouteDurationMinutes = 180,
  currentDistanceFromExpectedCorridorMiles = 0,
  minutesOffRoute = 0,
}: OffRouteDetectionInput) {
  const hasLocationSignal = currentLat !== null && currentLng !== null
  const hasRouteContext = [currentStopLat, currentStopLng, nextStopLat, nextStopLng].every((value) => Number.isFinite(value))

  const offRoute =
    hasLocationSignal &&
    hasRouteContext &&
    currentDistanceFromExpectedCorridorMiles >= offRouteThresholdMiles &&
    minutesOffRoute >= offRouteDurationMinutes

  return {
    offRoute,
    offRouteThresholdMiles,
    offRouteDurationMinutes,
    currentDistanceFromExpectedCorridorMiles,
    minutesOffRoute,
    prompt: offRoute ? "You seem to be off route. Switch to Flex Mode?" : null,
  }
}

interface BuildTripProgressSummaryInput {
  routeStops: StopData[]
  currentStep: number
  tripStartDate: string
  currentStopArrivalDate: string
  plannedStayDays: number
  now?: string | Date
}

export function buildTripProgressSummary({
  routeStops,
  currentStep,
  tripStartDate,
  currentStopArrivalDate,
  plannedStayDays,
  now = new Date(),
}: BuildTripProgressSummaryInput) {
  const resolvedNow = now instanceof Date ? now : new Date(now)
  const elapsedDays = getElapsedTripDays(tripStartDate, resolvedNow)
  const totalDistance = getTotalRouteDistance(routeStops)
  const completedDistance = getCompletedRouteDistance(routeStops, currentStep)
  const nextLegDistance = getCurrentLegDistance(routeStops, currentStep)
  const remainingDistance = getRemainingRouteDistance(routeStops, currentStep)
  const distanceProgressPercent = getDistanceProgressPercent(routeStops, currentStep)
  const dayProgressPercent = getTripDayProgressPercent(elapsedDays)
  const stayedTooLong = isStayingTooLong(currentStopArrivalDate, plannedStayDays, resolvedNow)

  return {
    elapsedDays,
    minTripDays: TRIP_DAY_RANGE.minDays,
    maxTripDays: TRIP_DAY_RANGE.maxDays,
    dayLabel: `Day ${elapsedDays} of ${TRIP_DAY_RANGE.minDays}-${TRIP_DAY_RANGE.maxDays} days`,
    dayProgressPercent,
    totalDistance,
    completedDistance,
    remainingDistance,
    nextLegDistance,
    distanceProgressPercent,
    distanceLabel: `Distance: ${completedDistance} / ${totalDistance} miles`,
    nextLegLabel: `Next leg: ${nextLegDistance} miles`,
    scheduleRisk: getScheduleRisk(currentStopArrivalDate, plannedStayDays, resolvedNow),
    stayedTooLong,
    stayWarning: stayedTooLong ? "You are staying longer than planned. This may delay your schedule." : null,
  }
}
export function getNowPrefill() {
  const now = new Date()

  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  const day = `${now.getDate()}`.padStart(2, "0")
  const hours = `${now.getHours()}`.padStart(2, "0")
  const minutes = `${now.getMinutes()}`.padStart(2, "0")

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }
}

export function combineLocalDateAndTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function getExpectedStopDate(
  actualDepartureAt: string | undefined,
  plannedDayOffset: number
) {
  if (!actualDepartureAt) return null

  const start = new Date(actualDepartureAt)
  const expected = new Date(start)
  expected.setDate(expected.getDate() + plannedDayOffset)
  return expected
}

export function getNextUpcomingStopId<
  T extends { id: string; order: number }
>(
  stops: T[],
  progress: {
    stopProgress: Record<string, { stopId: string; userState: "upcoming" | "done" | "skipped" }>
  }
) {
  const sorted = [...stops].sort((a, b) => a.order - b.order)

  const next = sorted.find((stop) => {
    const state = progress.stopProgress[stop.id]?.userState ?? "upcoming"
    return state === "upcoming"
  })

  return next?.id
}

export function getTimingState(params: {
  runtimeStarted: boolean
  actualDepartureAt?: string
  stopProgress?: { stopId: string; userState: "upcoming" | "done" | "skipped" }
  stopArrival?: { stopId: string; arrivedAt: string; actualStay?: string; notes?: string }
  plannedDayOffset: number
  now?: Date
}): "ahead" | "on_track" | "due_today" | "delayed" {
  const {
    runtimeStarted,
    actualDepartureAt,
    stopProgress,
    stopArrival,
    plannedDayOffset,
    now = new Date(),
  } = params

  if (stopProgress?.userState === "skipped") return "on_track"
  if (!runtimeStarted || !actualDepartureAt) return "on_track"

  const expected = getExpectedStopDate(actualDepartureAt, plannedDayOffset)
  if (!expected) return "on_track"

  if (stopProgress?.userState === "done" && stopArrival?.arrivedAt) {
    const arrived = new Date(stopArrival.arrivedAt).getTime()
    const expectedTime = expected.getTime()
    const diffMs = arrived - expectedTime

    if (diffMs < -12 * 60 * 60 * 1000) return "ahead"
    if (diffMs > 12 * 60 * 60 * 1000) return "delayed"
    return "on_track"
  }

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)

  const expectedTime = expected.getTime()

  if (expectedTime < todayStart.getTime()) return "delayed"
  if (expectedTime <= todayEnd.getTime()) return "due_today"

  return "on_track"
}
