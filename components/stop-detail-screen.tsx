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
  const openStayOnMap = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${option.name} ${option.location}`)}`,
      "_blank"
    )
  }

  return (
    <button
      onClick={() => {
        onSelect()
        openStayOnMap()
      }}
      className={`rounded-xl border p-3 text-left transition ${selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"} ${option.label === "A" ? "border-emerald-400/60 bg-emerald-50/40 shadow-sm" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{option.label}</span>
          <p className="text-sm font-semibold text-foreground">{option.type}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {option.dogFriendly && <Badge variant="secondary">Dog Friendly</Badge>}
          {option.label === "A" && <Badge className="bg-emerald-600 text-white">Recommended</Badge>}
          {option.label === "B" && <Badge variant="outline">Fallback</Badge>}
          {option.label === "C" && <Badge variant="outline">Remote Option</Badge>}
          {option.label === "D" && <Badge variant="outline">Safety Fallback</Badge>}
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{option.name}</p>
      <p className="text-xs text-muted-foreground">{option.location}</p>

      <div className={`mt-3 ${decisionMode ? "grid grid-cols-2 gap-2" : "space-y-1.5"}`}>
        <p className="text-xs text-muted-foreground">🐕 {option.dogFriendly ? "Dog friendly" : "Not dog friendly"}</p>
        <p className="text-xs text-muted-foreground">🚿 Shower: {option.shower}</p>
        <p className="text-xs text-muted-foreground col-span-full">🛒 Grocery: {option.groceryNearby}</p>
        <p className="text-xs text-muted-foreground col-span-full">Safety: {option.rating.safety.level} ({option.rating.safety.risk})</p>
        <p className="text-xs text-muted-foreground">Convenience: {option.rating.convenience}/5</p>
        <p className="text-xs text-muted-foreground">Cost: {option.rating.cost}/5</p>
        <p className="text-xs text-muted-foreground col-span-full">Comfort: {option.rating.comfort}/5</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{option.notes}</p>
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation()
            openStayOnMap()
          }}
        >
          View on Map
        </Button>
      </div>
    </button>
  )
}

function StopDetails({ stop, onNavigateToStop }: { stop: StopData; onNavigateToStop?: (stopId: string) => void }) {
  const [selectedStay, setSelectedStay] = useState<"A" | "B" | "C" | "D">("A")
  const [decisionMode, setDecisionMode] = useState(true)
  const [showCompare, setShowCompare] = useState(false)
  const stayOptions = useMemo(() => getStayOptions(stop), [stop])
  console.log("Stay options:", stayOptions)
  if (!stayOptions || stayOptions.length !== 4) {
    console.warn("Missing stay options", stop.name, stayOptions)
  }
  const maxConvenience = Math.max(...stayOptions.map((option) => option.rating.convenience), 0)
  const maxCost = Math.max(...stayOptions.map((option) => option.rating.cost), 0)
  const maxComfort = Math.max(...stayOptions.map((option) => option.rating.comfort), 0)

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
          <div className="flex items-center gap-2">
            <Button size="sm" variant={decisionMode ? "default" : "outline"} onClick={() => setDecisionMode((v) => !v)}>
              {decisionMode ? "Compare On" : "Compare Off"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCompare((value) => !value)}>
              Compare
            </Button>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
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
        {showCompare && (
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-2 text-left">Option</th>
                  <th className="p-2 text-left">Safety</th>
                  <th className="p-2 text-left">Convenience</th>
                  <th className="p-2 text-left">Cost</th>
                  <th className="p-2 text-left">Comfort</th>
                </tr>
              </thead>
              <tbody>
                {(["A", "B", "C", "D"] as const).map((label) => {
                  const option = stayOptions.find((item) => item.label === label)
                  if (!option) return null
                  return (
                    <tr key={option.label} className="border-t">
                      <td className="p-2 font-medium">{option.label}</td>
                      <td className="p-2">{option.rating.safety.level} — {option.rating.safety.risk}</td>
                      <td className={`p-2 ${option.rating.convenience === maxConvenience ? "font-semibold text-emerald-600" : ""}`}>{option.rating.convenience}</td>
                      <td className={`p-2 ${option.rating.cost === maxCost ? "font-semibold text-emerald-600" : ""}`}>{option.rating.cost}</td>
                      <td className={`p-2 ${option.rating.comfort === maxComfort ? "font-semibold text-emerald-600" : ""}`}>{option.rating.comfort}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">Nearby Dog Walks</h3>
        <div className="space-y-2">
          {stop.dogWalks.map((walk) => (
            <button
              key={walk.name}
              type="button"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(walk.name)}`,
                  "_blank"
                )
              }
              className="w-full rounded-lg border bg-background p-3 text-left cursor-pointer hover:border-primary/40"
            >
              <p className="text-sm font-medium">{walk.name}</p>
              <p className="text-xs text-muted-foreground">Type: {walk.type}</p>
              <p className="text-xs font-medium text-amber-700">Leash required: {walk.leashRequired ? "Yes" : "No"}</p>
            </button>
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
      <div className="mx-auto h-full w-full max-w-7xl grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[35%_65%] gap-4">
        <aside className="border-b lg:border-b-0 lg:border-r lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
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

        <section className="overflow-y-auto p-4">
          <StopDetails stop={selectedStop} onNavigateToStop={onNavigateToStop} />
        </section>
      </div>
    </main>
  )
}
