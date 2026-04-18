"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { MapPin, Maximize2 } from "lucide-react"
import { TripMap } from "@/components/trip-map"
import { RouteProgress } from "@/components/route-progress"
import { ActionButtons } from "@/components/action-buttons"
import { PopupPreview } from "@/components/popup-preview"
import { LocationPrompt } from "@/components/location-prompt"
import { Button } from "@/components/ui/button"
import { WhatNowScreen } from "@/components/what-now-screen"
import { EmergencyScreen } from "@/components/emergency-screen"
import { StopDetailScreen } from "@/components/stop-detail-screen"
import { stopsData, getStopById, calculateProgress } from "@/lib/stops-data"
import { createRouteDecisionContext, getNextStops, type RouteStrategy } from "@/lib/route-engine"
import { useGeolocation } from "@/hooks/use-geolocation"
import { ChatPanel } from "@/components/chat-panel"
import { Navigation, X, ChevronRight, MapPin as MapPinIcon, Clock, Dog } from "lucide-react"

type Screen = "map" | "what-now" | "emergency" | "stop-detail" | "select-location"
type Popup = "what-now" | "next-stop" | "emergency" | null

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

export default function RoadTripPlanner() {
  // State management
  const [currentScreen, setCurrentScreen] = useState<Screen>("map")
  const [activePopup, setActivePopup] = useState<Popup>(null)
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [stopPopupId, setStopPopupId] = useState<string | null>(null) // For stop marker panel
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
  
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

  const currentStop = getStopById(currentStopId)
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

  // Determine destination for progress bar
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

  const handleButtonClick = useCallback((type: "what-now" | "next-stop" | "emergency") => {
    console.log("[v0] Button clicked:", type)
    if (type === "next-stop") {
      // Check if this is the final leg back to Gloucester
      if (nextStopId === "0" && currentStopId === String(stopsData.length - 1)) {
        // Complete the trip
        handleSetCurrentStop("0", true)
      } else if (nextStop?.appleMapsQuery) {
        // Open Apple Maps with directions to next stop
        const url = `http://maps.apple.com/?daddr=${encodeURIComponent(nextStop.appleMapsQuery)}`
        window.open(url, "_blank")
      }
    } else {
      if (activePopup === type) {
        setCurrentScreen(type)
        setActivePopup(null)
      } else {
        setActivePopup(type)
      }
    }
  }, [activePopup, nextStop, nextStopId, currentStopId, handleSetCurrentStop])

  const handlePopupExpand = useCallback(() => {
    if (activePopup === "next-stop") {
      setSelectedStopId(nextStopId)
      setCurrentScreen("stop-detail")
      setActivePopup(null)
    } else if (activePopup) {
      setCurrentScreen(activePopup)
      setActivePopup(null)
    }
  }, [activePopup, nextStopId])

  const handleStopClick = useCallback((stopId: string) => {
    console.log("[v0] Stop clicked in page:", stopId)
    // Show stop popup panel instead of going directly to detail
    setStopPopupId(stopId)
    setActivePopup(null)
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
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
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

        {/* Map Section - fills remaining space */}
        <section className="flex-1 relative min-h-0">
          <TripMap 
            currentStopId={currentStopId}
            selectedStop={selectedStopId}
            onStopClick={handleStopClick}
            userLocation={userLocation}
          />
          
          {/* Popup Preview */}
          {activePopup && (
            <div className="z-[1000]">
            <PopupPreview
              type={activePopup}
              currentStopId={currentStopId}
              nextStopId={nextStopId}
              onClose={() => setActivePopup(null)}
              onExpand={handlePopupExpand}
            />
            </div>
          )}

          {/* Stop Marker Popup Panel */}
          {stopPopupId && (() => {
            const stop = getStopById(stopPopupId)
            if (!stop) return null
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
                      onClick={() => {
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

        {/* Bottom Action Buttons */}
        <section className="px-4 pt-2 pb-[max(env(safe-area-inset-bottom,8px),8px)]">
          <ActionButtons 
            onWhatNow={() => handleButtonClick("what-now")}
            onNextStop={() => handleButtonClick("next-stop")}
            onEmergency={() => handleButtonClick("emergency")}
            activeButton={activePopup}
            tripCompleted={tripCompleted}
            onViewFullTrip={handleViewFullTrip}
            onStartNewTrip={handleStartNewTrip}
          />
        </section>
      </div>

      {/* Chat Panel */}
      <ChatPanel currentStopId={currentStopId} nextStopId={nextStopId} />
    </main>
  )
}
