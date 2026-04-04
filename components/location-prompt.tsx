"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Navigation, X, Loader2 } from "lucide-react"
import { StopData } from "@/lib/stops-data"

interface LocationPromptProps {
  nearestStop: StopData | null
  distanceMiles: number | null
  loading: boolean
  error: string | null
  onConfirm: () => void
  onDismiss: () => void
  onManualSelect: () => void
  onRetry: () => void
}

export function LocationPrompt({
  nearestStop,
  distanceMiles,
  loading,
  error,
  onConfirm,
  onDismiss,
  onManualSelect,
  onRetry,
}: LocationPromptProps) {
  // Loading state
  if (loading) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl p-6 mx-4 shadow-xl max-w-sm w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Finding your location...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl p-6 mx-4 shadow-xl max-w-sm w-full">
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                You can try again or select your location manually
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" onClick={onRetry} className="flex-1">
                Try again
              </Button>
              <Button variant="default" size="sm" onClick={onManualSelect} className="flex-1">
                Select manually
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Found nearest stop
  if (nearestStop) {
    const isClose = distanceMiles !== null && distanceMiles < 100

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl p-6 mx-4 shadow-xl max-w-sm w-full">
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isClose ? "You seem to be near" : "Closest stop to you is"}
              </p>
              <p className="text-lg font-semibold text-foreground mt-1">{nearestStop.shortName}</p>
              {distanceMiles !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  ~{distanceMiles} miles away
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {isClose ? "Update your current location?" : "Set this as your current location?"}
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" onClick={onManualSelect} className="flex-1">
                Select other
              </Button>
              <Button variant="default" size="sm" onClick={onConfirm} className="flex-1">
                Yes, update
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
