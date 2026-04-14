"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Tent, Dog, MapPin, AlertTriangle, ShoppingCart, Fuel, Navigation, Info } from "lucide-react"
import { getStopById, type StopData } from "@/lib/stops-data"

interface StopDetailScreenProps {
  stopId: string
  onBack: () => void
  onNavigateToStop?: (stopId: string) => void
}

export function StopDetailScreen({ stopId, onBack, onNavigateToStop }: StopDetailScreenProps) {
  const stop = getStopById(stopId)

  if (!stop) {
    return (
      <main className="h-[100dvh] bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Stop not found</p>
      </main>
    )
  }

  const openAppleMaps = () => {
    const url = `http://maps.apple.com/?daddr=${encodeURIComponent(stop.appleMapsQuery)}`
    window.open(url, '_blank')
  }

  return (
    <main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full overflow-y-auto">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,12px)] pb-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{stop.name}</h1>
            <p className="text-xs text-muted-foreground">{stop.distance} from start - {stop.phase}</p>
          </div>
          {/* Navigate button */}
          <Button 
            size="sm" 
            className="shrink-0 gap-1.5 bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.50_0.18_150)]"
            onClick={openAppleMaps}
          >
            <Navigation className="w-3.5 h-3.5" />
            Navigate
          </Button>
        </header>

        <div className="flex-1 px-4 pb-[env(safe-area-inset-bottom,8px)] space-y-4">
          {/* Stop Type Badge & Notes */}
          {(stop.notes || stop.type !== "stay-friendly") && (
            <div className={`p-3 rounded-lg border ${
              stop.type === "scenic-only" 
                ? "bg-amber-500/10 border-amber-500/30" 
                : stop.type === "transit"
                  ? "bg-muted border-border"
                  : "bg-primary/10 border-primary/30"
            }`}>
              <div className="flex items-start gap-2">
                <Info className={`w-4 h-4 mt-0.5 shrink-0 ${
                  stop.type === "scenic-only" ? "text-amber-500" : "text-muted-foreground"
                }`} />
                <div>
                  {stop.type !== "stay-friendly" && (
                    <p className="text-xs font-medium text-foreground mb-1">
                      {stop.type === "scenic-only" ? "Scenic Only Stop" : "Transit Zone"}
                    </p>
                  )}
                  {stop.notes && (
                    <p className="text-xs text-muted-foreground">{stop.notes}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stay candidate options (static planning data) */}
          {stop.stay.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Tent className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Stay (Planning)</h2>
              </div>
              <div className="space-y-1.5">
                {stop.stay.map((option) => (
                  <div
                    key={option.letter}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border/50"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      option.letter === "A" ? "bg-emerald-500/20 text-emerald-500" :
                      option.letter === "B" ? "bg-blue-500/20 text-blue-500" :
                      option.letter === "C" ? "bg-purple-500/20 text-purple-500" :
                      "bg-amber-500/20 text-amber-500"
                    }`}>
                      {option.letter}
                    </span>
                    <span className="text-xs text-foreground flex-1 min-w-0">{option.name}</span>
                    {option.appleMapsQuery && (
                      <button
                        onClick={() => window.open(`http://maps.apple.com/?daddr=${encodeURIComponent(option.appleMapsQuery!)}`, '_blank')}
                        className="shrink-0 w-7 h-7 rounded-full bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.50_0.18_150)] flex items-center justify-center transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dog walk candidate options (static planning data) */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Dog className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Dog Walk (Planning)</h2>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-foreground flex-1">{stop.dog.primary}</p>
                {stop.dog.primaryQuery && (
                  <button
                    onClick={() => window.open(`http://maps.apple.com/?daddr=${encodeURIComponent(stop.dog.primaryQuery!)}`, '_blank')}
                    className="shrink-0 w-7 h-7 rounded-full bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.50_0.18_150)] flex items-center justify-center transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
              {stop.dog.secondary && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground flex-1">{stop.dog.secondary}</p>
                  {stop.dog.secondaryQuery && (
                    <button
                      onClick={() => window.open(`http://maps.apple.com/?daddr=${encodeURIComponent(stop.dog.secondaryQuery!)}`, '_blank')}
                      className="shrink-0 w-7 h-7 rounded-full bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.50_0.18_150)] flex items-center justify-center transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </div>
              )}
              {stop.dog.restrictions && (
                <p className="text-xs text-amber-500 mt-1.5 pt-1.5 border-t border-border/50">
                  {stop.dog.restrictions}
                </p>
              )}
            </div>
          </section>

          {/* Next Destinations */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Next</h2>
            </div>
            <div className="flex gap-2">
              {stop.next.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => option.stopId && onNavigateToStop?.(option.stopId)}
                  className="flex-1 p-2.5 rounded-lg bg-card border border-border/50 hover:bg-secondary/50 transition-colors text-center"
                >
                  <span className="text-xs text-foreground">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Emergency candidate options (static planning data) */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Emergency (Planning)</h2>
            </div>
            <div className="space-y-1.5">
              {stop.emergency.map((option, idx) => (
                <div
                  key={idx}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <span className="text-xs text-destructive flex-1">{option.label}</span>
                  {option.appleMapsQuery && (
                    <button
                      onClick={() => window.open(`http://maps.apple.com/?daddr=${encodeURIComponent(option.appleMapsQuery!)}`, '_blank')}
                      className="shrink-0 w-7 h-7 rounded-full bg-destructive hover:bg-destructive/80 flex items-center justify-center transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-destructive-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Logistics */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Logistics</h2>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border/50">
                <ShoppingCart className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground flex-1">{stop.logistics.groceries}</span>
                {stop.logistics.groceriesQuery && (
                  <button
                    onClick={() => window.open(`http://maps.apple.com/?daddr=${encodeURIComponent(stop.logistics.groceriesQuery!)}`, '_blank')}
                    className="shrink-0 w-7 h-7 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border/50">
                <Fuel className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground flex-1">{stop.logistics.gas}</span>
                {stop.logistics.gasQuery && (
                  <button
                    onClick={() => window.open(`http://maps.apple.com/?daddr=${encodeURIComponent(stop.logistics.gasQuery!)}`, '_blank')}
                    className="shrink-0 w-7 h-7 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-foreground" />
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
