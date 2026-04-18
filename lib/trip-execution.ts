import type { StopData, StayOptionLabel } from "@/lib/stops-data"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

export type TripMode = "baseline" | "flex"

export interface CurrentLeg {
  fromStep: number
  toStep: number | null
  chosenStayOptionId: StayOptionLabel | null
  chosenDestinationName: string | null
  chosenManually: boolean
  departureAt: string
  estimatedDriveHours: number
  estimatedArrivalAt: string
  actualArrivalAt: string | null
  manualDelayHours: number
}

export interface StopHistoryEntry {
  actualArrivalAt: string | null
  actualDepartureAt: string | null
  actualChosenStayOptionId: StayOptionLabel | null
  chosenDestinationName: string | null
  skipped: boolean
  notes: string | null
}

export interface ManualAdjustmentEntry {
  manualStayAdjustmentDays: number
  manualDelayHours: number
  chosenDestinationOverride: string | null
  reason: string | null
}

export interface TripExecutionState {
  tripStarted: boolean
  tripStartAt: string | null
  currentStep: number
  currentLeg: CurrentLeg | null
  currentMode: TripMode
  historyByStep: Record<number, StopHistoryEntry>
  manualAdjustmentsByStep: Record<number, ManualAdjustmentEntry>
}

export type NormalizedStopData = Omit<StopData, "status"> & {
  plannedStayDays: number
  manualStayAdjustmentDays: number
  plannedDriveHoursToNext: number
  manualDelayHours: number
  skipped: boolean
  status: StopData["status"] | "skipped"
}

interface StartTripInput {
  state: TripExecutionState
  stops: StopData[]
  startAt: string
  fromStep: number
  chosenStayOptionId: StayOptionLabel | null
  chosenDestinationName?: string | null
  manualDelayHours?: number
}

interface StartLegInput extends StartTripInput {}

interface MarkArrivalInput {
  state: TripExecutionState
  arrivalAt: string
  destinationStep: number | null
}

interface MarkDepartureInput {
  state: TripExecutionState
  departureAt: string
  step: number
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

export const DEFAULT_TRIP_EXECUTION_STATE: TripExecutionState = {
  tripStarted: false,
  tripStartAt: null,
  currentStep: 1,
  currentLeg: null,
  currentMode: "baseline",
  historyByStep: {},
  manualAdjustmentsByStep: {},
}

export function normalizeStopData(stops: StopData[], state?: TripExecutionState): NormalizedStopData[] {
  return stops.map((stop, index) => {
    const step = stop.stepNumber ?? stop.order
    const manual = state?.manualAdjustmentsByStep[step]
    const history = state?.historyByStep[step]

    const parsedDrive = parseNumberFromHours(stop.driveTimeFromPrev)
    const nextStop = stops[index + 1]
    const nextDriveHours = nextStop ? parseNumberFromHours(nextStop.driveTimeFromPrev) : 0

    return {
      ...stop,
      plannedStayDays: stop.plannedStayDays ?? 1,
      manualStayAdjustmentDays: manual?.manualStayAdjustmentDays ?? 0,
      plannedDriveHoursToNext: nextDriveHours || parsedDrive || 0,
      manualDelayHours: manual?.manualDelayHours ?? 0,
      skipped: history?.skipped ?? false,
      status: history?.skipped ? "skipped" : (stop.status ?? "future"),
    }
  })
}

export function getNextActiveStop(stops: NormalizedStopData[], currentStep: number): NormalizedStopData | null {
  return stops.find((stop) => (stop.stepNumber ?? stop.order) > currentStep && !stop.skipped) ?? null
}

export function calculateEffectiveStayDays(plannedStayDays: number, manualStayAdjustmentDays = 0): number {
  return Math.max(0, plannedStayDays + manualStayAdjustmentDays)
}

export function calculateEffectiveDriveHours(plannedDriveHoursToNext: number, manualDelayHours = 0): number {
  return Math.max(0, plannedDriveHoursToNext + manualDelayHours)
}

export function calculateTripDay(tripStartAt: string | null, now = new Date()): number {
  if (!tripStartAt) return 0
  const startMs = new Date(tripStartAt).getTime()
  const nowMs = new Date(now).getTime()
  const diff = Math.max(0, nowMs - startMs)
  return Math.floor(diff / ONE_DAY_MS) + 1
}

export function calculateEstimatedArrival(departureAt: string, effectiveDriveHours: number): string {
  const departureMs = new Date(departureAt).getTime()
  return new Date(departureMs + effectiveDriveHours * ONE_HOUR_MS).toISOString()
}

export function calculateActualStayDuration(arrivalAt: string | null, departureAt: string | null, now = new Date()): number {
  if (!arrivalAt) return 0
  const arrivalMs = new Date(arrivalAt).getTime()
  const endMs = departureAt ? new Date(departureAt).getTime() : new Date(now).getTime()
  return Math.max(0, (endMs - arrivalMs) / ONE_DAY_MS)
}

export function calculateExpectedTripDayAtStep(stops: NormalizedStopData[], step: number): number {
  let expectedDays = 1
  for (const stop of stops) {
    const stopStep = stop.stepNumber ?? stop.order
    if (stopStep >= step) break
    if (stop.skipped) continue
    expectedDays += calculateEffectiveStayDays(stop.plannedStayDays, stop.manualStayAdjustmentDays)
  }
  return expectedDays
}

export function calculateScheduleVariance(actualTripDay: number, expectedTripDayAtCurrentStop: number): number {
  return actualTripDay - expectedTripDayAtCurrentStop
}

export function getScheduleStatus(varianceDays: number): "ahead with buffer" | "on track" | "slightly behind" | "behind" {
  if (varianceDays > 1.5) return "behind"
  if (varianceDays > 0.5) return "slightly behind"
  if (varianceDays < -0.5) return "ahead with buffer"
  return "on track"
}

export function calculateRouteProgress(stops: NormalizedStopData[], currentStep: number) {
  const activeStops = stops.filter((stop) => !stop.skipped)
  const totalRouteDistance = activeStops.reduce((sum, stop) => sum + (stop.distanceMilesToNext || 0), 0)
  const completedDistance = activeStops
    .filter((stop) => (stop.stepNumber ?? stop.order) < currentStep)
    .reduce((sum, stop) => sum + (stop.distanceMilesToNext || 0), 0)
  const currentToNextDistance =
    activeStops.find((stop) => (stop.stepNumber ?? stop.order) === currentStep)?.distanceMilesToNext ?? 0
  const remainingDistance = Math.max(0, totalRouteDistance - completedDistance)
  const percent = totalRouteDistance > 0 ? Math.round((completedDistance / totalRouteDistance) * 100) : 0

  return {
    totalRouteDistance,
    completedDistance,
    remainingDistance,
    currentToNextDistance,
    percent,
  }
}

export function calculateTimeProgress(
  tripStartAt: string | null,
  stops: NormalizedStopData[],
  now = new Date()
) {
  const tripDay = calculateTripDay(tripStartAt, now)
  const totalPlannedDays = Math.max(
    1,
    stops.reduce((sum, stop) => {
      if (stop.skipped) return sum
      return sum + calculateEffectiveStayDays(stop.plannedStayDays, stop.manualStayAdjustmentDays)
    }, 0)
  )

  return {
    tripDay,
    totalPlannedDays,
    percent: Math.min(100, Math.round((tripDay / totalPlannedDays) * 100)),
  }
}

export function formatEta(etaIso: string, now = new Date()): string {
  const eta = new Date(etaIso)
  const sameDay = eta.toDateString() === new Date(now).toDateString()
  if (sameDay) {
    return `today at ${eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }
  return eta.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function startTrip({
  state,
  stops,
  startAt,
  fromStep,
  chosenStayOptionId,
  chosenDestinationName,
  manualDelayHours = 0,
}: StartTripInput): TripExecutionState {
  const withStart = {
    ...state,
    tripStarted: true,
    tripStartAt: startAt,
    currentStep: fromStep,
  }

  return startLeg({
    state: withStart,
    stops,
    startAt,
    fromStep,
    chosenStayOptionId,
    chosenDestinationName,
    manualDelayHours,
  })
}

export function startLeg({
  state,
  stops,
  startAt,
  fromStep,
  chosenStayOptionId,
  chosenDestinationName,
  manualDelayHours = 0,
}: StartLegInput): TripExecutionState {
  const normalized = normalizeStopData(stops, state)
  const nextStop = getNextActiveStop(normalized, fromStep)
  const fromStop = normalized.find((stop) => (stop.stepNumber ?? stop.order) === fromStep)
  const plannedDriveHoursToNext = fromStop?.plannedDriveHoursToNext ?? 0
  const effectiveDriveHours = calculateEffectiveDriveHours(plannedDriveHoursToNext, manualDelayHours)
  const estimatedArrivalAt = calculateEstimatedArrival(startAt, effectiveDriveHours)

  const leg: CurrentLeg = {
    fromStep,
    toStep: nextStop ? nextStop.stepNumber ?? nextStop.order : null,
    chosenStayOptionId,
    chosenDestinationName: chosenDestinationName ?? nextStop?.name ?? null,
    chosenManually: Boolean(chosenDestinationName),
    departureAt: startAt,
    estimatedDriveHours: effectiveDriveHours,
    estimatedArrivalAt,
    actualArrivalAt: null,
    manualDelayHours,
  }

  const stepAdjustment = state.manualAdjustmentsByStep[fromStep] ?? {
    manualStayAdjustmentDays: 0,
    manualDelayHours: 0,
    chosenDestinationOverride: null,
    reason: null,
  }

  return {
    ...state,
    tripStarted: true,
    tripStartAt: state.tripStartAt ?? startAt,
    currentStep: fromStep,
    currentLeg: leg,
    manualAdjustmentsByStep: {
      ...state.manualAdjustmentsByStep,
      [fromStep]: {
        ...stepAdjustment,
        manualDelayHours,
        chosenDestinationOverride: chosenDestinationName ?? null,
      },
    },
  }
}

export function markArrived({ state, arrivalAt, destinationStep }: MarkArrivalInput): TripExecutionState {
  if (!destinationStep) return state
  const history = state.historyByStep[destinationStep] ?? {
    actualArrivalAt: null,
    actualDepartureAt: null,
    actualChosenStayOptionId: null,
    chosenDestinationName: null,
    skipped: false,
    notes: null,
  }

  return {
    ...state,
    currentStep: destinationStep,
    currentLeg: state.currentLeg
      ? {
          ...state.currentLeg,
          actualArrivalAt: arrivalAt,
        }
      : null,
    historyByStep: {
      ...state.historyByStep,
      [destinationStep]: {
        ...history,
        actualArrivalAt: arrivalAt,
        actualChosenStayOptionId: state.currentLeg?.chosenStayOptionId ?? history.actualChosenStayOptionId,
        chosenDestinationName: state.currentLeg?.chosenDestinationName ?? history.chosenDestinationName,
      },
    },
  }
}

export function markDeparted({ state, departureAt, step }: MarkDepartureInput): TripExecutionState {
  const history = state.historyByStep[step] ?? {
    actualArrivalAt: null,
    actualDepartureAt: null,
    actualChosenStayOptionId: null,
    chosenDestinationName: null,
    skipped: false,
    notes: null,
  }

  return {
    ...state,
    historyByStep: {
      ...state.historyByStep,
      [step]: {
        ...history,
        actualDepartureAt: departureAt,
      },
    },
  }
}

export function skipStop(state: TripExecutionState, step: number): TripExecutionState {
  const history = state.historyByStep[step] ?? {
    actualArrivalAt: null,
    actualDepartureAt: null,
    actualChosenStayOptionId: null,
    chosenDestinationName: null,
    skipped: false,
    notes: null,
  }
  return {
    ...state,
    historyByStep: {
      ...state.historyByStep,
      [step]: {
        ...history,
        skipped: true,
      },
    },
  }
}

export function applyStayAdjustment(
  state: TripExecutionState,
  step: number,
  adjustmentDays: number,
  reason?: string
): TripExecutionState {
  const existing = state.manualAdjustmentsByStep[step] ?? {
    manualStayAdjustmentDays: 0,
    manualDelayHours: 0,
    chosenDestinationOverride: null,
    reason: null,
  }

  return {
    ...state,
    manualAdjustmentsByStep: {
      ...state.manualAdjustmentsByStep,
      [step]: {
        ...existing,
        manualStayAdjustmentDays: existing.manualStayAdjustmentDays + adjustmentDays,
        reason: reason ?? existing.reason,
      },
    },
  }
}

export function applyDelayAdjustment(
  state: TripExecutionState,
  step: number,
  delayHours: number,
  reason?: string
): TripExecutionState {
  const existing = state.manualAdjustmentsByStep[step] ?? {
    manualStayAdjustmentDays: 0,
    manualDelayHours: 0,
    chosenDestinationOverride: null,
    reason: null,
  }

  return {
    ...state,
    manualAdjustmentsByStep: {
      ...state.manualAdjustmentsByStep,
      [step]: {
        ...existing,
        manualDelayHours: delayHours,
        reason: reason ?? existing.reason,
      },
    },
  }
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

function parseNumberFromHours(raw: string): number {
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 0
}
