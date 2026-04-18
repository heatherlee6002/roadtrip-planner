"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Dog, Tent, ArrowRight, Compass, AlertTriangle } from "lucide-react"
import { getStopById, type StopData } from "@/lib/stops-data"
import { createRouteDecisionContext, getNextStops } from "@/lib/route-engine"

interface WhatNowScreenProps {
  currentStopId: string
  onBack: () => void
  onNavigateToStop: (stopId: string) => void
  onShowEmergency: () => void
  onShowStopDetail: (stopId: string) => void
}

export function WhatNowScreen({ currentStopId, onBack, onNavigateToStop, onShowEmergency, onShowStopDetail }: WhatNowScreenProps) {
  const currentStop = getStopById(currentStopId)
  const routeContext = createRouteDecisionContext({ currentStopId, userLocation: null })
  const decision = getNextStops(routeContext, "fallback")
  const nextStopId = decision.primaryStop?.id
  const nextStop = nextStopId ? getStopById(nextStopId) : null

  if (!currentStop) {
    return <main className="h-[100dvh] bg-background flex items-center justify-center"><p className="text-muted-foreground">Stop not found</p></main>
  }

  const options = [
    { id: "dog", icon: Dog, label: "Dog Walk", description: currentStop.dogWalks[0]?.name || "Nearby dog walk", color: "bg-emerald-500/10 text-emerald-500", action: () => onShowStopDetail(currentStopId) },
    { id: "stay", icon: Tent, label: "Stay", description: `4 options ready (A-D), recommended: ${currentStop.stayOptions.A.name}`, color: "bg-blue-500/10 text-blue-500", action: () => onShowStopDetail(currentStopId) },
    { id: "move", icon: ArrowRight, label: "Move forward", description: nextStop ? `Continue to ${nextStop.shortName} (${nextStop.totalMiles - currentStop.totalMiles} mi)` : "View next stop", color: "bg-primary/10 text-primary", action: () => nextStopId && onNavigateToStop(nextStopId) },
    { id: "explore", icon: Compass, label: "Explore", description: getExploreDescription(currentStop), color: "bg-purple-500/10 text-purple-500", action: () => onShowStopDetail(currentStopId) },
    { id: "emergency", icon: AlertTriangle, label: "Emergency", description: `Warning ${currentStop.areaWarnings.rating}/5 - keep backup D ready`, color: "bg-destructive/10 text-destructive", action: onShowEmergency },
  ]

  return (
    <main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <header className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,12px)] pb-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-9 w-9"><ArrowLeft className="w-5 h-5" /></Button>
          <div><h1 className="text-lg font-semibold text-foreground">What now?</h1><p className="text-xs text-muted-foreground">Near {currentStop.shortName}</p></div>
        </header>
        <div className="flex-1 px-4 pb-[env(safe-area-inset-bottom,8px)] grid grid-cols-1 gap-2.5 content-start">
          {options.map((option) => (
            <button key={option.id} onClick={option.action} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-secondary/50 transition-colors text-left">
              <div className={`w-10 h-10 rounded-xl ${option.color} flex items-center justify-center shrink-0`}><option.icon className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground">{option.label}</p><p className="text-xs text-muted-foreground truncate">{option.description}</p></div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

function getExploreDescription(stop: StopData): string {
  if (stop.type === "scenic-only") return "Scenic viewpoints and photo opportunities"
  if (stop.type === "transit") return "Quick stops and rest areas"
  if (stop.phase === "turning-point") return "Decision point before return route"
  return "Discover local attractions and trails"
}
