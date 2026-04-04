"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Tent, Car, Phone, Navigation } from "lucide-react"
import { getStopById } from "@/lib/stops-data"

interface EmergencyScreenProps {
  currentStopId: string
  onBack: () => void
}

export function EmergencyScreen({ currentStopId, onBack }: EmergencyScreenProps) {
  const currentStop = getStopById(currentStopId)

  const emergencyOptions = [
    { 
      icon: Car, 
      label: "Safe Parking", 
      description: currentStop?.emergency[0]?.label || "Truck stops, Walmart",
      urgent: false,
      searchQuery: "truck stop near me"
    },
    { 
      icon: Tent, 
      label: "Emergency Overnight", 
      description: currentStop?.stay.find(s => s.letter === "D")?.name || "Walmart, rest areas",
      urgent: false,
      searchQuery: "walmart near me"
    },
    { 
      icon: MapPin, 
      label: "Nearest Hospital", 
      description: "Find emergency medical care",
      urgent: true,
      searchQuery: "hospital emergency room near me"
    },
    { 
      icon: Phone, 
      label: "Call 911", 
      description: "Life-threatening emergency",
      urgent: true,
      action: "tel:911"
    },
  ]

  const openMaps = (query: string) => {
    const url = `http://maps.apple.com/?q=${encodeURIComponent(query)}`
    window.open(url, '_blank')
  }

  return (
    <main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Emergency</h1>
            <p className="text-xs text-muted-foreground">
              Near {currentStop?.shortName || "your location"}
            </p>
          </div>
        </header>

        {/* Emergency Options */}
        <div className="flex-1 px-4 pb-[env(safe-area-inset-bottom,8px)] space-y-3">
          {emergencyOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => {
                if (option.action) {
                  window.location.href = option.action
                } else if (option.searchQuery) {
                  openMaps(option.searchQuery)
                }
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${
                option.urgent 
                  ? "bg-destructive/10 border-destructive/30 hover:bg-destructive/20" 
                  : "bg-card border-border/50 hover:bg-secondary/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                option.urgent ? "bg-destructive/20" : "bg-amber-500/10"
              }`}>
                <option.icon className={`w-6 h-6 ${
                  option.urgent ? "text-destructive" : "text-amber-500"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  option.urgent ? "text-destructive" : "text-foreground"
                }`}>{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <Navigation className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}

          {/* Location-specific emergency info */}
          {currentStop && currentStop.emergency.length > 1 && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Nearby Options
              </p>
              <div className="space-y-1">
                {currentStop.emergency.map((item, i) => (
                  <p key={i} className="text-xs text-foreground">{item.label}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
