"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { MapPin, Maximize2 } from "lucide-react"
import { TripMap } from "@/components/trip-map"
import { RouteProgress } from "@/components/route-progress"
import { LocationPrompt } from "@/components/location-prompt"
import { Button } from "@/components/ui/button"
import { WhatNowScreen } from "@/components/what-now-screen"
import { EmergencyScreen } from "@/components/emergency-screen"
import { StopDetailScreen } from "@/components/stop-detail-screen"
import { stopsData, getStopById } from "@/lib/stops-data"
import { createRouteDecisionContext, getNextStops, type RouteStrategy } from "@/lib/route-engine"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Navigation, X, ChevronRight, MapPin as MapPinIcon, Clock, Dog } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"
import {
  DEFAULT_TRIP_EXECUTION_STATE,
  applyDelayAdjustment,
  applyStayAdjustment,
  calculateActualStayDuration,
  calculateEffectiveDriveHours,
  calculateEffectiveStayDays,
  calculateExpectedTripDayAtStep,
  calculateRouteProgress,
  calculateScheduleVariance,
  calculateTimeProgress,
  detectOffRouteStatus,
  formatEta,
  getNextActiveStop,
  getScheduleStatus,
  markArrived,
  markDeparted,
  normalizeStopData,
  skipStop,
  startLeg,
  startTrip,
  type TripExecutionState,
} from "@/lib/trip-execution"
import type { StayOptionLabel } from "@/lib/stops-data"

type Screen = "map" | "what-now" | "emergency" | "stop-detail" | "select-location"

const LEGACY_TRACKING_STORAGE_KEYS = [
  "roadtrip.execution.v1",
  "roadtrip.execution.v2",
  "roadtrip.liveTripState",
  "roadtrip.tripProgress",
]

function isLegacyTrackingKey(key: string) {
  if (LEGACY_TRACKING_STORAGE_KEYS.includes(key)) return true

  const normalized = key.toLowerCase()
  return (
    normalized.includes("roadtrip") ||
    normalized.includes("trip") ||
    normalized.includes("execution") ||
    normalized.includes("progress") ||
    normalized.includes("arrival") ||
    normalized.includes("departure") ||
    normalized.includes("manual") ||
    normalized.includes("stay") ||
    normalized.includes("delay") ||
    normalized.includes("eta")
  )
}

const BUILD_BRANCH = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? "work"
const BUILD_SHA = (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "8a7ed05").slice(0, 7)
const BUILD_MARKER = `BUILD MARKER: ${BUILD_BRANCH} ${BUILD_SHA}`

export default function RoadTripPlanner() {
  const router = useRouter()
  const isMobile = useIsMobile()

  // State management
  const [currentScreen, setCurrentScreen] = useState<Screen>("map")
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [stopPopupId, setStopPopupId] = useState<string | null>(null) // For stop marker panel
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
  const [offRoutePromptSnoozedUntil, setOffRoutePromptSnoozedUntil] = useState<number | null>(null)
  const [offRoutePromptDismissed, setOffRoutePromptDismissed] = useState(false)
  const [tripExecution, setTripExecution] = useState<TripExecutionState>(DEFAULT_TRIP_EXECUTION_STATE)
  const [kickoffStartAt, setKickoffStartAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [kickoffStayOption, setKickoffStayOption] = useState<StayOptionLabel | "custom">("A")
  const [kickoffCustomDestination, setKickoffCustomDestination] = useState("")
  const [kickoffManualDelayHours, setKickoffManualDelayHours] = useState(0)
  const [arrivalCustomAt, setArrivalCustomAt] = useState("")
  const [departureCustomAt, setDepartureCustomAt] = useState("")
  const [nextLegOption, setNextLegOption] = useState<StayOptionLabel | "custom">("A")
  const [nextLegCustomDestination, setNextLegCustomDestination] = useState("")
  const [nextLegDelayHours, setNextLegDelayHours] = useState(0)
  const [stayAdjustDays, setStayAdjustDays] = useState(1)
  
  // Trip state
  const [currentStopId, setCurrentStopId] = useState("0") // Start at Gloucester
  const [nextStopId, setNextStopId] = useState("1") // Central PA
  const [tripCompleted, setTripCompleted] = useState(false) // Track if trip is complete
  const [routeStrategy] = useState<RouteStrategy>("fallback")
  
  // Geolocation
  const { 
    latitude,
    longitude,
    accuracy,
    loading: geoLoading, 
    error: geoError, 
    nearestStop, 
    requestLocation 
  } = useGeolocation()

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TRIP_EXECUTION_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as TripExecutionState
      setTripExecution({ ...DEFAULT_TRIP_EXECUTION_STATE, ...parsed })
    } catch (error) {
      console.warn("[roadtrip] failed to hydrate trip execution state", error)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(TRIP_EXECUTION_STORAGE_KEY, JSON.stringify(tripExecution))
  }, [tripExecution])

  useEffect(() => {
    if (tripExecution.tripStarted && tripExecution.currentStep > 0) {
      setCurrentStopId(String(tripExecution.currentStep))
    }
  }, [tripExecution.currentStep, tripExecution.tripStarted])

  const currentStop = getStopById(currentStopId)
  const currentStep = Number.parseInt(currentStopId, 10)
  const tripNow = new Date()
  const normalizedStops = useMemo(
    () => normalizeStopData(stopsData.filter((stop) => stop.id !== "0"), tripExecution),
    [tripExecution]
  )
  const normalizedCurrentStop = normalizedStops.find((stop) => (stop.stepNumber ?? stop.order) === currentStep) ?? null
  const nextActiveStop = useMemo(
    () => getNextActiveStop(normalizedStops, currentStep),
    [normalizedStops, currentStep]
  )
  const timeProgress = useMemo(
    () => calculateTimeProgress(tripExecution.tripStartAt, normalizedStops, tripNow),
    [tripExecution.tripStartAt, normalizedStops, tripNow]
  )
  const routeProgressData = useMemo(
    () => calculateRouteProgress(normalizedStops, currentStep),
    [normalizedStops, currentStep]
  )
  const expectedTripDayAtCurrentStop = useMemo(
    () => calculateExpectedTripDayAtStep(normalizedStops, currentStep),
    [normalizedStops, currentStep]
  )
  const scheduleVarianceDays = useMemo(
    () => calculateScheduleVariance(timeProgress.tripDay, expectedTripDayAtCurrentStop),
    [timeProgress.tripDay, expectedTripDayAtCurrentStop]
  )
  const scheduleStatus = getScheduleStatus(scheduleVarianceDays)
  const currentStopHistory = currentStep > 0 ? tripExecution.historyByStep[currentStep] : undefined
  const currentStopActualStayDays = calculateActualStayDuration(
    currentStopHistory?.actualArrivalAt ?? null,
    currentStopHistory?.actualDepartureAt ?? null,
    tripNow
  )
  const adjustedPlannedStayDays = calculateEffectiveStayDays(
    normalizedCurrentStop?.plannedStayDays ?? 0,
    normalizedCurrentStop?.manualStayAdjustmentDays ?? 0
  )
  const stayingTooLong = currentStopActualStayDays > adjustedPlannedStayDays && adjustedPlannedStayDays > 0
  const driveHoursBase = normalizedCurrentStop?.plannedDriveHoursToNext ?? 0
  const driveHoursDelay = normalizedCurrentStop?.manualDelayHours ?? 0
  const driveHoursEffective = calculateEffectiveDriveHours(driveHoursBase, driveHoursDelay)
  const routeContext = useMemo(
    () =>
      createRouteDecisionContext({
        currentStopId,
        userLocation: userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null,
      }),
    [currentStopId, userLocation]
  )
  const nextStopDecision = useMemo(() => getNextStops(routeContext, routeStrategy), [routeContext, routeStrategy])
  const nextStop = getStopById(nextStopId) ?? nextStopDecision.primaryStop
  const progress = calculateProgress(currentStopId)
  const isReturn = currentStop?.phase === "return"
  const destinationLabel = isReturn ? "Home / New England" : "Yellowstone / Tetons"

  useEffect(() => {
    // Safety migration: remove legacy trip-tracking state so planning mode always opens cleanly.
    for (const key of LEGACY_TRACKING_STORAGE_KEYS) {
      window.localStorage.removeItem(key)
      window.sessionStorage.removeItem(key)
    }

    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const key = window.localStorage.key(i)
      if (key && isLegacyTrackingKey(key)) {
        window.localStorage.removeItem(key)
      }
    }

    for (let i = window.sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = window.sessionStorage.key(i)
      if (key && isLegacyTrackingKey(key)) {
        window.sessionStorage.removeItem(key)
      }
    }

    for (const cookie of document.cookie.split(";")) {
      const rawName = cookie.split("=")[0]?.trim()
      if (rawName && isLegacyTrackingKey(rawName)) {
        document.cookie = `${rawName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    }
  }, [])

  // Request location on initial load (optional - can be triggered by button)
  useEffect(() => {
    // Automatically request location on first load
    requestLocation()
    setShowLocationPrompt(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tripCompleted) return
    const engineNextId = nextStopDecision.primaryStop?.id ?? "0"
    if (engineNextId !== nextStopId) {
      setNextStopId(engineNextId)
    }
  }, [nextStopDecision.primaryStop?.id, nextStopId, tripCompleted])

  const handleSetCurrentStop = useCallback((stopId: string, completingTrip = false) => {
    // When user arrives at a stop or confirms location
    setCurrentStopId(stopId)
    
    // Check if trip is complete (back at Gloucester after going through return route)
    if (stopId === "0" && completingTrip) {
      setTripCompleted(true)
      setNextStopId("0") // No next stop
    } else {
      const contextForStop = createRouteDecisionContext({ currentStopId: stopId, userLocation: null })
      const decision = getNextStops(contextForStop, routeStrategy)
      setNextStopId(decision.primaryStop?.id ?? "0")
    }
  }, [routeStrategy])

  const handleStopClick = useCallback((stopId: string) => {
    console.log("[v0] Stop clicked in page:", stopId)
    // Show stop popup panel instead of going directly to detail
    setStopPopupId(stopId)
  }, [])

  const handleBackToMap = useCallback(() => {
    setCurrentScreen("map")
    setSelectedStopId(null)
  }, [])

  const handleNavigateToStop = useCallback((stopId: string) => {
    // Update next stop when user chooses to move forward
    setNextStopId(stopId)
    setSelectedStopId(stopId)
    setCurrentScreen("stop-detail")
  }, [])

  const handleSkipStop = useCallback((stopId: string) => {
    const contextAfterSkip = createRouteDecisionContext({ currentStopId: stopId, userLocation: null })
    const alternatives = getNextStops(contextAfterSkip, routeStrategy).alternatives
    if (alternatives[0]) {
      setNextStopId(alternatives[0].id)
    }
  }, [routeStrategy])

  // Location prompt handlers
  const handleLocationConfirm = useCallback(() => {
    if (latitude !== null && longitude !== null) {
      setUserLocation({
        lat: latitude,
        lng: longitude,
        accuracy: accuracy ?? undefined,
      })
    }
    if (nearestStop.stop) {
      handleSetCurrentStop(nearestStop.stop.id)
    }
    setShowLocationPrompt(false)
  }, [nearestStop.stop, handleSetCurrentStop, latitude, longitude, accuracy])

  const handleLocationDismiss = useCallback(() => {
    setShowLocationPrompt(false)
  }, [])

  const handleManualLocationSelect = useCallback(() => {
    setShowLocationPrompt(false)
    setCurrentScreen("select-location")
  }, [])

  const handleLocationRetry = useCallback(() => {
    requestLocation()
  }, [requestLocation])

  const handleStartNewTrip = useCallback(() => {
    setTripCompleted(false)
    setCurrentStopId("0")
    setNextStopId("1")
    setUserLocation(null)
    setCurrentScreen("map")
  }, [])

  const handleViewFullTrip = useCallback(() => {
    setSelectedStopId("0")
    setCurrentScreen("stop-detail")
  }, [])

  const handleKickoffTrip = useCallback(() => {
    const fromStep = Number.isNaN(currentStep) || currentStep < 1 ? 1 : currentStep
    const chosenDestinationName = kickoffStayOption === "custom" ? kickoffCustomDestination.trim() || null : null
    setTripExecution((prev) =>
      startTrip({
        state: prev,
        stops: stopsData.filter((stop) => stop.id !== "0"),
        startAt: new Date(kickoffStartAt || new Date().toISOString()).toISOString(),
        fromStep,
        chosenStayOptionId: kickoffStayOption === "custom" ? null : kickoffStayOption,
        chosenDestinationName,
        manualDelayHours: kickoffManualDelayHours,
      })
    )
  }, [currentStep, kickoffCustomDestination, kickoffManualDelayHours, kickoffStartAt, kickoffStayOption])

  const handleMarkArrived = useCallback((arrivalAtIso?: string) => {
    const arrivalAt = arrivalAtIso ?? new Date().toISOString()
    setTripExecution((prev) =>
      markArrived({
        state: prev,
        arrivalAt,
        destinationStep: prev.currentLeg?.toStep ?? null,
      })
    )
    const destination = tripExecution.currentLeg?.toStep
    if (destination) {
      const destinationId = String(destination)
      setCurrentStopId(destinationId)
      setSelectedStopId(destinationId)
    }
  }, [tripExecution.currentLeg?.toStep])

  const handleMarkDeparted = useCallback((departureAtIso?: string) => {
    const departureAt = departureAtIso ?? new Date().toISOString()
    const step = Number.isNaN(currentStep) || currentStep < 1 ? 1 : currentStep
    setTripExecution((prev) =>
      markDeparted({
        state: prev,
        departureAt,
        step,
      })
    )
  }, [currentStep])

  const handleStartNextLeg = useCallback(() => {
    const step = Number.isNaN(currentStep) || currentStep < 1 ? 1 : currentStep
    const chosenDestinationName = nextLegOption === "custom" ? nextLegCustomDestination.trim() || null : null
    const departureAt = departureCustomAt
      ? new Date(departureCustomAt).toISOString()
      : new Date().toISOString()
    setTripExecution((prev) => {
      const withDelay = applyDelayAdjustment(prev, step, nextLegDelayHours)
      return startLeg({
        state: withDelay,
        stops: stopsData.filter((stop) => stop.id !== "0"),
        startAt: departureAt,
        fromStep: step,
        chosenStayOptionId: nextLegOption === "custom" ? null : nextLegOption,
        chosenDestinationName,
        manualDelayHours: nextLegDelayHours,
      })
    })
  }, [currentStep, departureCustomAt, nextLegCustomDestination, nextLegDelayHours, nextLegOption])

  const handleSkipCurrentStop = useCallback(() => {
    if (Number.isNaN(currentStep) || currentStep < 1) return
    setTripExecution((prev) => skipStop(prev, currentStep))
  }, [currentStep])

  const handleSkipNextStop = useCallback(() => {
    if (!nextActiveStop) return
    const nextStep = nextActiveStop.stepNumber ?? nextActiveStop.order
    setTripExecution((prev) => skipStop(prev, nextStep))
  }, [nextActiveStop])

  const handleAddStayDay = useCallback(() => {
    if (Number.isNaN(currentStep) || currentStep < 1) return
    setTripExecution((prev) => applyStayAdjustment(prev, currentStep, 1, "Added one day"))
  }, [currentStep])

  const handleAddCustomStayDays = useCallback(() => {
    if (Number.isNaN(currentStep) || currentStep < 1) return
    setTripExecution((prev) => applyStayAdjustment(prev, currentStep, stayAdjustDays, "Custom adjustment"))
  }, [currentStep, stayAdjustDays])

  const handleLeaveEarly = useCallback(() => {
    if (!currentStopHistory?.actualArrivalAt) return
    handleMarkDeparted(new Date().toISOString())
  }, [currentStopHistory?.actualArrivalAt, handleMarkDeparted])

  // Screen routing
  if (currentScreen === "what-now") {
    return (
      <WhatNowScreen 
        currentStopId={currentStopId}
        onBack={handleBackToMap}
        onNavigateToStop={handleNavigateToStop}
        onShowEmergency={() => setCurrentScreen("emergency")}
        onShowStopDetail={(id) => {
          setSelectedStopId(id)
          setCurrentScreen("stop-detail")
        }}
      />
    )
  }

  if (currentScreen === "emergency") {
    return <EmergencyScreen currentStopId={currentStopId} onBack={handleBackToMap} />
  }

  if (currentScreen === "stop-detail" && selectedStopId) {
    return (
      <StopDetailScreen 
        stopId={selectedStopId} 
        onBack={handleBackToMap}
        onNavigateToStop={handleNavigateToStop}
      />
    )
  }

  if (currentScreen === "select-location") {
    return (
      <main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Header */}
          <section className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
            <h1 className="text-lg font-semibold text-foreground">Select Your Location</h1>
            <Button variant="ghost" size="sm" onClick={handleBackToMap}>
              Cancel
            </Button>
          </section>
          
          {/* Stop list */}
          <section className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              {stopsData.map((stop) => (
                <button
                  key={stop.id}
                  onClick={() => {
                    // If selecting Gloucester and we were on return phase, complete the trip
                    const wasOnReturn = currentStop?.phase === "return"
                    handleSetCurrentStop(stop.id, stop.id === "0" && wasOnReturn)
                    setCurrentScreen("map")
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    stop.id === currentStopId
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      stop.phase === "turning-point"
                        ? "bg-accent text-accent-foreground"
                        : stop.id === currentStopId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {stop.stepNumber || "S"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{stop.shortName}</p>
                      <p className="text-xs text-muted-foreground">{stop.subtitle}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-muted-foreground">{stop.distance}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[35%_65%] h-screen">
        <div className="hidden md:block lg:overflow-y-auto border-b lg:border-b-0 lg:border-r p-3 space-y-2">
          {stopsData.map((stop) => (
            <button
              key={stop.id}
              onClick={() => {
                setSelectedStopId(stop.id)
                handleStopClick(stop.id)
              }}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                stop.id === currentStopId ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{stop.shortName}</p>
              <p className="text-xs text-muted-foreground">{stop.state} • {stop.distance}</p>
              <p className="text-xs text-muted-foreground">{stop.plannedStayLabel}</p>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex flex-col h-full w-full">
          {/* Top Section - Current Location Header */}
          <section className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
            {tripCompleted ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <div>
                    <span className="text-sm font-semibold text-foreground">Trip Complete!</span>
                    <p className="text-xs text-muted-foreground">Back in Gloucester, MA</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Overview
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm text-muted-foreground">You are near </span>
                    <span className="text-sm font-semibold text-foreground">{currentStop?.shortName || "Home"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                    <Maximize2 className="w-3.5 h-3.5" />
                    Overview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-primary border-primary h-8"
                    onClick={() => {
                      requestLocation()
                      setShowLocationPrompt(true)
                    }}
                  >
                    Locate Me
                  </Button>
                </div>
              </>
            )}
          </section>

          {/* Route Progress Bar */}
          <div className="px-4 pb-2">
            <RouteProgress
              from={tripCompleted ? "Home" : (userLocation ? "Your location (GPS)" : (currentStop?.shortName || "Home"))}
              to={tripCompleted ? "Trip Complete" : destinationLabel}
              progress={tripCompleted ? 100 : progress}
              phase={tripCompleted ? "return" : (currentStop?.phase || "outbound")}
              tripCompleted={tripCompleted}
            />
          </div>
          <div className="px-4 pb-2 space-y-2">
            <div className="rounded-xl border border-border/50 bg-card p-3">
              <p className="text-xs text-muted-foreground">
                Day {timeProgress.tripDay || 1} of {timeProgress.totalPlannedDays} days
              </p>
              <p className="text-sm font-medium text-foreground">Trip progress: {timeProgress.percent}%</p>
              <p className="text-xs text-muted-foreground">
                Distance: {routeProgressData.completedDistance} / {routeProgressData.totalRouteDistance} miles
              </p>
              <p className="text-xs text-muted-foreground">Next leg: {routeProgressData.currentToNextDistance} miles</p>
              <p className="text-xs text-muted-foreground">Remaining miles: {routeProgressData.remainingDistance}</p>
              <p className="text-xs text-muted-foreground">
                Schedule: {scheduleStatus} ({scheduleVarianceDays > 0 ? "+" : ""}
                {scheduleVarianceDays.toFixed(1)} days)
              </p>
            </div>

            {!tripExecution.tripStarted && (
              <div className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">Kick off roadtrip</p>
                <label className="text-xs text-muted-foreground block">
                  Started at
                  <input
                    type="datetime-local"
                    value={kickoffStartAt}
                    onChange={(event) => setKickoffStartAt(event.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
                <label className="text-xs text-muted-foreground block">
                  Chosen stay
                  <select
                    value={kickoffStayOption}
                    onChange={(event) => setKickoffStayOption(event.target.value as StayOptionLabel | "custom")}
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                    <option value="custom">Another destination</option>
                  </select>
                </label>
                {kickoffStayOption === "custom" && (
                  <label className="text-xs text-muted-foreground block">
                    Destination name
                    <input
                      value={kickoffCustomDestination}
                      onChange={(event) => setKickoffCustomDestination(event.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  </label>
                )}
                <label className="text-xs text-muted-foreground block">
                  Manual delay hours
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={kickoffManualDelayHours}
                    onChange={(event) => setKickoffManualDelayHours(Number(event.target.value) || 0)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
                <Button size="sm" className="w-full" onClick={handleKickoffTrip}>Start Roadtrip</Button>
              </div>
            )}

            {tripExecution.tripStarted && tripExecution.currentLeg && (
              <div className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Roadtrip started {formatEta(tripExecution.tripStartAt ?? tripExecution.currentLeg.departureAt, tripNow)}
                </p>
                <p className="text-xs text-muted-foreground">Heading to {tripExecution.currentLeg.chosenDestinationName ?? "Next stop"}</p>
                <p className="text-xs text-muted-foreground">
                  Chosen stay: {tripExecution.currentLeg.chosenStayOptionId ? `Option ${tripExecution.currentLeg.chosenStayOptionId}` : "Custom destination"}
                </p>
                <p className="text-xs text-muted-foreground">ETA: {formatEta(tripExecution.currentLeg.estimatedArrivalAt, tripNow)}</p>
                <p className="text-xs text-muted-foreground">
                  Drive: {driveHoursBase.toFixed(1)}h + {driveHoursDelay.toFixed(1)}h delay = {driveHoursEffective.toFixed(1)}h
                </p>
              </div>
            )}

            {stayingTooLong && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                You are staying longer than planned. This may delay your schedule.
              </div>
            )}

            {canShowOffRoutePrompt && (
              <div className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-2">
                <p className="text-xs text-foreground">You seem to be off route. Switch to Flex Mode?</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setOffRoutePromptDismissed(true)}>
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setOffRoutePromptSnoozedUntil(Date.now() + 60 * 60 * 1000)}
                  >
                    Snooze 1h
                  </Button>
                </div>
              </div>
            )}

            {tripExecution.tripStarted && (
              <div className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">Current stop actions</p>
                <p className="text-xs text-muted-foreground">
                  Planned stay: {normalizedCurrentStop?.plannedStayDays ?? 0}d • Adjusted: {adjustedPlannedStayDays}d • Actual: {currentStopActualStayDays.toFixed(1)}d
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleMarkArrived()}>Mark arrived now</Button>
                  <Button size="sm" variant="outline" onClick={() => handleMarkDeparted()}>Mark departed now</Button>
                  <Button size="sm" variant="outline" onClick={handleAddStayDay}>Add 1 day here</Button>
                  <Button size="sm" variant="outline" onClick={handleLeaveEarly}>Leave early</Button>
                </div>
                <label className="text-xs text-muted-foreground block">
                  Arrive with custom time
                  <input
                    type="datetime-local"
                    value={arrivalCustomAt}
                    onChange={(event) => setArrivalCustomAt(event.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => arrivalCustomAt && handleMarkArrived(new Date(arrivalCustomAt).toISOString())}
                >
                  Confirm custom arrival
                </Button>
                <label className="text-xs text-muted-foreground block">
                  Add custom stay days
                  <input
                    type="number"
                    step={0.5}
                    value={stayAdjustDays}
                    onChange={(event) => setStayAdjustDays(Number(event.target.value) || 0)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
                <Button size="sm" variant="outline" className="w-full" onClick={handleAddCustomStayDays}>
                  Apply stay adjustment
                </Button>

                <div className="rounded-md border border-border p-2 space-y-2">
                  <p className="text-xs font-medium text-foreground">Start next leg</p>
                  <label className="text-xs text-muted-foreground block">
                    Next stay choice
                    <select
                      value={nextLegOption}
                      onChange={(event) => setNextLegOption(event.target.value as StayOptionLabel | "custom")}
                      className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                      <option value="custom">Another destination</option>
                    </select>
                  </label>
                  {nextLegOption === "custom" && (
                    <input
                      value={nextLegCustomDestination}
                      onChange={(event) => setNextLegCustomDestination(event.target.value)}
                      placeholder="Destination name"
                      className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  )}
                  <label className="text-xs text-muted-foreground block">
                    Manual delay hours
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={nextLegDelayHours}
                      onChange={(event) => setNextLegDelayHours(Number(event.target.value) || 0)}
                      className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground block">
                    Depart with custom time
                    <input
                      type="datetime-local"
                      value={departureCustomAt}
                      onChange={(event) => setDepartureCustomAt(event.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  </label>
                  <Button size="sm" className="w-full" onClick={handleStartNextLeg}>
                    Start next leg
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={handleSkipCurrentStop}>Skip this stop</Button>
                  <Button size="sm" variant="outline" onClick={handleSkipNextStop}>Skip next stop</Button>
                </div>
              </div>
            </>
          )}
        </section>


        {/* Route Progress Bar */}
        <div className="px-4 pb-2">
          <RouteProgress 
            from={tripCompleted ? "Home" : (userLocation ? "Your location (GPS)" : (currentStop?.shortName || "Home"))}
            to={tripCompleted ? "Trip Complete" : destinationLabel}
            progress={tripCompleted ? 100 : progress}
            phase={tripCompleted ? "return" : (currentStop?.phase || "outbound")}
            tripCompleted={tripCompleted}
          />
        </div>

        {/* Map Section - fills remaining space */}
        <section className="flex-1 relative min-h-0 h-full">
          <TripMap 
            currentStopId={currentStopId}
            selectedStop={selectedStopId}
            onStopClick={handleStopClick}
            userLocation={userLocation}
          />

          {/* Stop Marker Popup Panel */}
          {stopPopupId && (() => {
            const stop = getStopById(stopPopupId)
            if (!stop) return null
            const recommendedStay = getStayOptions(stop).find((option) => option.label === "A")
            return (
              <div className="absolute bottom-20 left-0 right-0 mx-4 animate-in slide-in-from-bottom-4 duration-200 z-[1000]">
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-primary px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPinIcon className="w-5 h-5 text-primary-foreground shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-primary-foreground truncate">{stop.name}</h3>
                        <p className="text-xs text-primary-foreground/80">{stop.subtitle}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0"
                      onClick={() => setStopPopupId(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Basic info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{stop.distance} from start</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{stop.plannedStayLabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Dog className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">{stop.dogWalks[0]?.name ?? "Dog walk option"}</span>
                    </div>
                    {stop.stayOptions[0] && (
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{stop.stayOptions[0].name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex border-t border-border">
                    <button
                      onClick={() => {
                        if (stop.appleMapsQuery) {
                          const url = `http://maps.apple.com/?daddr=${encodeURIComponent(stop.appleMapsQuery)}`
                          window.open(url, "_blank")
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.50_0.18_150)] transition-colors"
                    >
                      <Navigation className="w-4 h-4 text-white" />
                      <span className="text-sm font-medium text-white">Navigate</span>
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation()
                        if (isMobile) {
                          router.push(`/stops/${stopPopupId}`)
                          setStopPopupId(null)
                          return
                        }
                        setSelectedStopId(stopPopupId)
                        setCurrentScreen("stop-detail")
                        setStopPopupId(null)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors border-l border-border"
                    >
                      <span className="text-sm font-medium text-primary">Full details</span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Location Prompt */}
          {showLocationPrompt && (geoLoading || geoError || nearestStop.stop) && (
            <LocationPrompt
              nearestStop={nearestStop.stop}
              distanceMiles={nearestStop.distanceMiles}
              loading={geoLoading}
              error={geoError}
              onConfirm={handleLocationConfirm}
              onDismiss={handleLocationDismiss}
              onManualSelect={handleManualLocationSelect}
              onRetry={handleLocationRetry}
            />
          )}
        </section>
        {/* Route stop list */}
        <section className="border-t bg-card/60 px-4 py-2 pb-[max(env(safe-area-inset-bottom,8px),8px)]">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Route stops</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/80">{BUILD_MARKER}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stopsData.map((stop) => (
              <button
                key={stop.id}
                onClick={() => setStopPopupId(stop.id)}
                className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-left ${stop.id === currentStopId ? "border-primary bg-primary/10" : "border-border bg-background"}`}
              >
                <p className="text-xs font-medium">{stop.shortName}</p>
                <p className="text-[10px] text-muted-foreground">{stop.distance}</p>
              </button>
            ))}
          </div>
        </section>
        </div>
      </div>
    </main>
  )
}
