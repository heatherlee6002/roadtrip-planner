"use client"

import { useState, useCallback, useEffect } from "react"
import {
  MapPin,
  Navigation,
  X,
  ChevronRight,
  MapPin as MapPinIcon,
  Route,
  Dog,
  BedSingle,
  List,
  Info,
  LocateFixed,
} from "lucide-react"
import { TripMap } from "@/components/trip-map"
import { LocationPrompt } from "@/components/location-prompt"
import { Button } from "@/components/ui/button"
import { WhatNowScreen } from "@/components/what-now-screen"
import { EmergencyScreen } from "@/components/emergency-screen"
import { StopDetailScreen } from "@/components/stop-detail-screen"
import {
  stopsData,
  calculateProgress,
  getStopById,
  getMilesToNextStop,
  getMilesTraveled,
} from "@/lib/stops-data"
import { createRouteDecisionContext, getNextStops, type RouteStrategy } from "@/lib/route-engine"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import StartTripDialog from "@/components/trip/StartTripDialog"
import LogArrivalDialog from "@/components/trip/LogArrivalDialog"
import {
  buildInitialTripProgressState,
  combineLocalDateAndTime,
  getExpectedStopDate,
  getNextUpcomingStopId,
  getTimingState,
} from "@/lib/trip-progress"
import type { TripProgressState } from "@/types/trip-progress"
type Screen = "map" | "what-now" | "emergency" | "stop-detail" | "select-location"

const BUILD_BRANCH = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? "work"
const BUILD_SHA = (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "8a7ed05").slice(0, 7)
const BUILD_MARKER = `BUILD MARKER: ${BUILD_BRANCH} ${BUILD_SHA}`

export default function RoadTripPlanner() {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [currentScreen, setCurrentScreen] = useState<Screen>("map")
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [stopPopupId, setStopPopupId] = useState<string | null>(null)
  const [showMobileRouteSheet, setShowMobileRouteSheet] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)

  const [currentStopId, setCurrentStopId] = useState("0")
  const [, setNextStopId] = useState("1")
  const [tripCompleted, setTripCompleted] = useState(false)
  const [routeStrategy] = useState<RouteStrategy>("fallback")

  const {
    latitude,
    longitude,
    accuracy,
    loading: geoLoading,
    error: geoError,
    nearestStop,
    requestLocation,
  } = useGeolocation()

  const currentStop = getStopById(currentStopId)
  const currentStopIndex = stopsData.findIndex((stop) => stop.id === currentStopId)
  const tripProgress = tripCompleted ? 100 : calculateProgress(currentStopId)

  const milesToNextStop = tripCompleted ? 0 : getMilesToNextStop(currentStopId)
  const milesTraveled = getMilesTraveled(currentStopId)

  useEffect(() => {
    requestLocation()
    setShowLocationPrompt(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetCurrentStop = useCallback(
    (stopId: string, completingTrip = false) => {
      setCurrentStopId(stopId)

      if (stopId === "0" && completingTrip) {
        setTripCompleted(true)
        setNextStopId("0")
      } else {
        const contextForStop = createRouteDecisionContext({ currentStopId: stopId, userLocation: null })
        const decision = getNextStops(contextForStop, routeStrategy)
        setNextStopId(decision.primaryStop?.id ?? "0")
      }
    },
    [routeStrategy]
  )

  const handleStopClick = useCallback((stopId: string) => {
    console.log("[v0] Stop clicked in page:", stopId)
    setStopPopupId(stopId)
  }, [])

  const handleBackToMap = useCallback(() => {
    setCurrentScreen("map")
    setSelectedStopId(null)
  }, [])

  const handleNavigateToStop = useCallback((stopId: string) => {
    setNextStopId(stopId)
    setSelectedStopId(stopId)
    setCurrentScreen("stop-detail")
  }, [])

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
    return <StopDetailScreen stopId={selectedStopId} onBack={handleBackToMap} onNavigateToStop={handleNavigateToStop} />
  }

  if (currentScreen === "select-location") {
    return (
      <main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
          <section className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
            <h1 className="text-lg font-semibold text-foreground">Select Your Location</h1>
            <Button variant="ghost" size="sm" onClick={handleBackToMap}>
              Cancel
            </Button>
          </section>

          <section className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              {stopsData.map((stop) => (
                <button
                  key={stop.id}
                  onClick={() => {
                    const wasOnReturn = currentStop?.phase === "return"
                    handleSetCurrentStop(stop.id, stop.id === "0" && wasOnReturn)
                    setCurrentScreen("map")
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    stop.id === currentStopId ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        stop.phase === "turning-point"
                          ? "bg-accent text-accent-foreground"
                          : stop.id === currentStopId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stop.stepNumber || "S"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{stop.shortName}</p>
                      <p className="text-xs text-muted-foreground">{stop.state}</p>
                      <p className="text-xs text-muted-foreground">
                        {getMilesToNextStop(stop.id)} mi to next stop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getMilesTraveled(stop.id)} mi traveled
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{stop.plannedStayLabel}</p>
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
    <main className="min-h-[100dvh] bg-background flex flex-col lg:h-[100dvh] lg:overflow-hidden">
      <section className="lg:hidden h-[100dvh] flex flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-[env(safe-area-inset-top,12px)] pb-2 border-b border-border/50 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">You are near</p>
              <p className="text-lg font-semibold text-foreground leading-tight">{currentStop?.shortName || "Home"}</p>
              <p className="text-xs text-muted-foreground">
                {milesToNextStop} mi to next stop • {milesTraveled} mi traveled
              </p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${Math.max(2, tripProgress)}%` }} />
          </div>
        </div>

        <div className="relative flex-1 min-h-0 border-b border-border/50">
          <TripMap
            currentStopId={currentStopId}
            selectedStop={selectedStopId}
            onStopClick={handleStopClick}
            userLocation={userLocation}
          />

          {stopPopupId && (() => {
            const stop = getStopById(stopPopupId)
            if (!stop) return null

            return (
              <div className="absolute bottom-[84px] left-0 right-0 mx-3 animate-in slide-in-from-bottom-4 duration-200 z-[1000]">
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-primary px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPinIcon className="w-5 h-5 text-primary-foreground shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-primary-foreground truncate">{stop.name}</h3>
                        <p className="text-xs text-primary-foreground/80">{stop.state}</p>
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

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">{stop.subtitle || stop.state}</p>

                    {stop.distanceMilesToNext > 0 && (
                      <div className="flex items-center gap-3">
                        <Route className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">{stop.distanceMilesToNext} mi to next stop</span>
                      </div>
                    )}

                    {stop.totalMiles >= 0 && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">{stop.totalMiles} mi traveled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

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
        </div>

        <div className="shrink-0 border-t border-border/70 bg-background/95 backdrop-blur px-3 py-2 pb-[max(env(safe-area-inset-bottom,8px),8px)]">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-10 text-xs gap-1.5" onClick={() => setShowMobileRouteSheet(true)}>
              <List className="w-4 h-4" />
              Route
            </Button>
            <Button
              variant="outline"
              className="h-10 text-xs gap-1.5"
              onClick={() => router.push(`/stops/${stopPopupId ?? selectedStopId ?? currentStopId}`)}
            >
              <Info className="w-4 h-4" />
              Details
            </Button>
            <Button
              variant="outline"
              className="h-10 text-xs gap-1.5 text-primary border-primary"
              onClick={() => {
                requestLocation()
                setShowLocationPrompt(true)
              }}
            >
              <LocateFixed className="w-4 h-4" />
              Locate Me
            </Button>
          </div>
        </div>

        <Sheet open={showMobileRouteSheet} onOpenChange={setShowMobileRouteSheet}>
          <SheetContent side="bottom" className="h-[80dvh] p-0 gap-0">
            <SheetHeader className="border-b border-border/60">
              <SheetTitle>Route Stops</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {stopsData.map((stop) => {
                const stopIndex = stopsData.findIndex((item) => item.id === stop.id)
                const isCurrent = stop.id === currentStopId
                const isCompleted = stopIndex >= 0 && stopIndex < currentStopIndex

                return (
                  <button
                    key={stop.id}
                    onClick={() => {
                      setSelectedStopId(stop.id)
                      handleStopClick(stop.id)
                      setShowMobileRouteSheet(false)
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/10"
                        : isCompleted
                          ? "border-border/50 bg-card/40 opacity-65"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold bg-secondary text-foreground border-border">
                        {stop.stepNumber || "S"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{stop.shortName}</p>
                        <p className="text-xs text-muted-foreground truncate">{stop.subtitle || stop.state}</p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">{stop.plannedStayLabel}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </section>

      <div className="hidden lg:grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[35%_65%] h-screen">
        <div className="hidden md:block lg:overflow-y-auto border-b lg:border-b-0 lg:border-r p-3 space-y-2">
          <div className="pb-2 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Route Stops</h2>
          </div>
          {stopsData.map((stop) => (
            (() => {
              const stopIndex = stopsData.findIndex((item) => item.id === stop.id)
              const isCurrent = stop.id === currentStopId
              const isCompleted = stopIndex >= 0 && stopIndex < currentStopIndex

              return (
                <button
                  key={stop.id}
                  onClick={() => {
                    setSelectedStopId(stop.id)
                    handleStopClick(stop.id)
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(45,212,191,0.45),0_0_24px_rgba(45,212,191,0.15)]"
                      : isCompleted
                        ? "border-border/50 bg-card/40 opacity-65 hover:opacity-80"
                        : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 shrink-0 rounded-full border text-sm font-semibold flex items-center justify-center ${
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary"
                          : isCompleted
                            ? "bg-muted/50 text-muted-foreground border-border/60"
                            : "bg-secondary text-foreground border-border"
                      }`}
                    >
                      {stop.stepNumber || "S"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{stop.shortName}</p>
                      <p className="text-xs text-muted-foreground truncate">{stop.subtitle || stop.state}</p>
                    </div>

                    <p className="text-xs text-muted-foreground shrink-0">{stop.plannedStayLabel}</p>
                  </div>
                </button>
              )
            })()
          ))}
        </div>

        <div className="min-h-0 flex flex-col h-full w-full">
          <section className="px-4 pt-[env(safe-area-inset-top,12px)] pb-2 border-b border-border/50 space-y-2">
            {tripCompleted ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <div>
                    <span className="text-sm font-semibold text-foreground">Trip Complete!</span>
                    <p className="text-xs text-muted-foreground">Back in Gloucester, MA</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div>
                      <span className="text-sm text-muted-foreground">You are near </span>
                      <span className="text-xl font-bold text-foreground">{currentStop?.shortName || "Home"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {milesToNextStop} mi to next stop • {milesTraveled} mi traveled
                    </p>
                  </div>
                </div>

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
            )}

            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(2, tripProgress)}%` }}
              />
            </div>
          </section>

          <section className="flex-1 relative min-h-0 h-full">
            <TripMap
              currentStopId={currentStopId}
              selectedStop={selectedStopId}
              onStopClick={handleStopClick}
              userLocation={userLocation}
            />

            {stopPopupId && (() => {
              const stop = getStopById(stopPopupId)
              if (!stop) return null

              return (
                <div className="absolute bottom-20 left-0 right-0 mx-4 animate-in slide-in-from-bottom-4 duration-200 z-[1000]">
                  <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-primary px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <MapPinIcon className="w-5 h-5 text-primary-foreground shrink-0" />
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-primary-foreground truncate">{stop.name}</h3>
                          <p className="text-xs text-primary-foreground/80">{stop.state}</p>
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

                    <div className="p-4 space-y-3">
                      <p className="text-xs text-muted-foreground">{stop.subtitle || stop.state}</p>

                      {stop.distanceMilesToNext > 0 && (
                        <div className="flex items-center gap-3">
                          <Route className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground">{stop.distanceMilesToNext} mi to next stop</span>
                        </div>
                      )}

                      {stop.totalMiles >= 0 && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground">{stop.totalMiles} mi traveled</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <BedSingle className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">{stop.plannedStayLabel}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Dog className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {stop.dogWalks[0]?.name ?? "Dog walk option"}
                        </span>
                      </div>

                      {stop.stayOptions[0] && (
                        <div className="flex items-center gap-3">
                          <MapPinIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground truncate">{stop.stayOptions[0].name}</span>
                        </div>
                      )}
                    </div>

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
                  className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-left ${
                    stop.id === currentStopId ? "border-primary bg-primary/10" : "border-border bg-background"
                  }`}
                >
                  <p className="text-xs font-medium">{stop.stepNumber || stop.shortName}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
