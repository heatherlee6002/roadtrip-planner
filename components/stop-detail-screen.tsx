"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Dog, MapPin, Navigation, ShieldAlert, ShowerHead, ShoppingCart } from "lucide-react"
import { getStayOptions, getStopById, stopsData, type StayOption, type StopData } from "@/lib/stops-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface StopDetailScreenProps {
  stopId: string
  onBack: () => void
  onNavigateToStop?: (stopId: string) => void
}

const warningColors: Record<number, string> = {
  1: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  2: "bg-lime-500/15 text-lime-700 border-lime-500/30",
  3: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  4: "bg-orange-500/15 text-orange-700 border-orange-500/30",
  5: "bg-red-500/15 text-red-700 border-red-500/30",
}

function StayOptionCard({ option, selected, onSelect, decisionMode }: { option: StayOption; selected: boolean; onSelect: () => void; decisionMode: boolean }) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl border p-3 text-left transition ${selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"} ${option.label === "A" ? "ring-1 ring-emerald-400/40" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{option.label}</span>
          <p className="text-sm font-semibold text-foreground">{option.type}</p>
        </div>
        {option.label === "A" && <Badge className="bg-emerald-600 text-white">Recommended</Badge>}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{option.name}</p>
      <p className="text-xs text-muted-foreground">{option.location}</p>

      <div className={`mt-3 ${decisionMode ? "grid grid-cols-2 gap-2" : "space-y-1.5"}`}>
        <p className="text-xs text-muted-foreground">🐕 {option.dogFriendly ? "Dog friendly" : "Not dog friendly"}</p>
        <p className="text-xs text-muted-foreground">🚿 Shower: {option.shower}</p>
        <p className="text-xs text-muted-foreground col-span-full">🛒 Grocery: {option.groceryNearby}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{option.notes}</p>
    </button>
  )
}

function StopDetails({ stop, onNavigateToStop }: { stop: StopData; onNavigateToStop?: (stopId: string) => void }) {
  const [selectedStay, setSelectedStay] = useState<"A" | "B" | "C" | "D">("A")
  const [decisionMode, setDecisionMode] = useState(true)
  const stayOptions = useMemo(() => getStayOptions(stop), [stop])

  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">{stop.name}</h2>
            <p className="text-sm text-muted-foreground">{stop.state} • {stop.driveTimeFromPrev} from previous • {stop.stayDuration}</p>
          </div>
          <Badge className={warningColors[stop.areaWarnings.rating]}>
            <ShieldAlert className="mr-1 h-3.5 w-3.5" />
            Warning {stop.areaWarnings.rating}/5
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{stop.areaWarnings.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1"><Dog className="h-3.5 w-3.5" /> Dog friendly options available</span>
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1"><ShowerHead className="h-3.5 w-3.5" /> {stop.showerInfo}</span>
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1"><ShoppingCart className="h-3.5 w-3.5" /> {stop.groceryNearby}</span>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide">Decision Mode</h3>
          <Button size="sm" variant={decisionMode ? "default" : "outline"} onClick={() => setDecisionMode((v) => !v)}>
            {decisionMode ? "Compare On" : "Compare Off"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {stayOptions.map((option) => (
            <StayOptionCard
              key={option.label}
              option={option}
              selected={selectedStay === option.label}
              onSelect={() => setSelectedStay(option.label)}
              decisionMode={decisionMode}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">Nearby Dog Walks</h3>
        <div className="space-y-2">
          {stop.dogWalks.map((walk) => (
            <div key={walk.name} className="rounded-lg border bg-background p-3">
              <p className="text-sm font-medium">{walk.name}</p>
              <p className="text-xs text-muted-foreground">Type: {walk.type}</p>
              <p className="text-xs font-medium text-amber-700">Leash required: {walk.leashRequired ? "Yes" : "No"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">Next</h3>
        <div className="flex flex-wrap gap-2">
          {stop.next.map((option, idx) => (
            <Button key={idx} variant="outline" onClick={() => option.stopId && onNavigateToStop?.(option.stopId)}>
              <MapPin className="mr-1 h-4 w-4" />
              {option.label}
            </Button>
          ))}
          <Button onClick={() => window.open(`http://maps.apple.com/?daddr=${encodeURIComponent(stop.appleMapsQuery)}`, "_blank")}> 
            <Navigation className="mr-1 h-4 w-4" /> Navigate
          </Button>
        </div>
      </section>
    </div>
  )
}

export function StopDetailScreen({ stopId, onBack, onNavigateToStop }: StopDetailScreenProps) {
  const [selectedStopId, setSelectedStopId] = useState(stopId)
  const selectedStop = getStopById(selectedStopId)

  if (!selectedStop) {
    return (
      <main className="h-[100dvh] bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Stop not found</p>
      </main>
    )
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-background">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col lg:flex-row">
        <aside className="border-b lg:w-[340px] lg:border-b-0 lg:border-r overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-3 py-2">
            <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
            <p className="text-sm font-semibold">Route Stops</p>
          </div>

          <div className="hidden lg:block space-y-2 p-3">
            {stopsData.map((stop) => (
              <button
                key={stop.id}
                onClick={() => setSelectedStopId(stop.id)}
                className={`w-full rounded-lg border p-3 text-left ${selectedStopId === stop.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <p className="text-sm font-medium">{stop.shortName}</p>
                <p className="text-xs text-muted-foreground">{stop.state} • {stop.distance}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2 p-3 lg:hidden">
            {stopsData.map((stop) => (
              <Collapsible key={stop.id} open={selectedStopId === stop.id} onOpenChange={(open) => open && setSelectedStopId(stop.id)}>
                <CollapsibleTrigger className="w-full rounded-lg border bg-card p-3 text-left">
                  <p className="text-sm font-medium">{stop.shortName}</p>
                  <p className="text-xs text-muted-foreground">{stop.state} • {stop.distance}</p>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="rounded-md border bg-muted/20 p-2 text-xs text-muted-foreground">Tap cards below to compare A/B/C/D options.</div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto p-4">
          <StopDetails stop={selectedStop} onNavigateToStop={onNavigateToStop} />
        </section>
      </div>
    </main>
  )
}
