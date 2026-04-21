"use client"

import { useState, useCallback, useEffect } from "react"
import { MapPin, Maximize2 } from "lucide-react"
import { TripMap } from "@/components/trip-map"
import { LocationPrompt } from "@/components/location-prompt"
import { Button } from "@/components/ui/button"
import { WhatNowScreen } from "@/components/what-now-screen"
import { EmergencyScreen } from "@/components/emergency-screen"
import { StopDetailScreen } from "@/components/stop-detail-screen"
import { stopsData, getStopById } from "@/lib/stops-data"
import { createRouteDecisionContext, getNextStops, type RouteStrategy } from "@/lib/route-engine"
import { getMilesToNextStop, getMilesTraveled } from "@/lib/PASTE_YOUR_LIB_FILE_NAME_HERE"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Navigation, X, ChevronRight, MapPin as MapPinIcon, Clock, Dog } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"

type Screen = "map" | "what-now" | "emergency" | "stop-detail" | "select-location"


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
const currentStep = Number.parseInt(currentStopId, 10)

const isHomeStart = currentStopId === "0"
const activeRouteStep = Number.isNaN(currentStep) || currentStep < 1 ? 1 : currentStep

const milesToNextStop = tripCompleted
  ? 0
  : isHomeStart
    ? getMilesToNextStop(1)
    : getMilesToNextStop(activeRouteStep)

const milesTraveled = isHomeStart ? 0 : getMilesTraveled(activeRouteStep)


  // Request location on initial load (optional - can be triggered by button)
  useEffect(() => {
    // Automatically request location on first load
    requestLocation()
    setShowLocationPrompt(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  

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
<div>
  <div>
    <span className="text-sm text-muted-foreground">You are near </span>
    <span className="text-sm font-semibold text-foreground">{currentStop?.shortName || "Home"}</span>
  </div>
  <p className="text-xs text-muted-foreground">
    {milesToNextStop} miles to next stop / {milesTraveled} miles traveled
  </p>
</div>
  <p className="text-xs text-muted-foreground">
    {milesToNextStop} miles to next stop / {milesTraveled} miles traveled
  </p>
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
