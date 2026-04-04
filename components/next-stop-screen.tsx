"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Tent, Dog, MapPin, AlertTriangle, ShoppingCart, Fuel } from "lucide-react"

interface NextStopScreenProps {
  onBack: () => void
}

export function NextStopScreen({ onBack }: NextStopScreenProps) {
  return (
    <main className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full overflow-y-auto">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,12px)] pb-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-9 w-9">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Central Pennsylvania</h1>
            <p className="text-xs text-muted-foreground">State College area - 380 mi from start</p>
          </div>
        </header>

        <div className="flex-1 px-4 pb-[env(safe-area-inset-bottom,8px)] space-y-5">
          {/* Stay Options */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Tent className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Stay</h2>
            </div>
            <div className="space-y-1.5">
              {[
                { letter: "A", name: "Bald Eagle State Park campground" },
                { letter: "B", name: "Bald Eagle State Forest dispersed" },
                { letter: "C", name: "Bellefonte / State College private" },
                { letter: "D", name: "Walmart Supercenter (State College)" },
              ].map((option) => (
                <button
                  key={option.letter}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-card border border-border/50 hover:bg-secondary/50 transition-colors text-left"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {option.letter}
                  </span>
                  <span className="text-xs text-foreground">{option.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Dog Options */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Dog className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Dog</h2>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border/50 space-y-1">
              <p className="text-xs text-foreground">Bald Eagle State Park trails</p>
              <p className="text-xs text-muted-foreground">State forest roads and lakes</p>
            </div>
          </section>

          {/* Next Destinations */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Next</h2>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 p-2.5 rounded-lg bg-card border border-border/50 hover:bg-secondary/50 transition-colors text-center">
                <span className="text-xs text-foreground">Shenandoah</span>
              </button>
              <button className="flex-1 p-2.5 rounded-lg bg-card border border-border/50 hover:bg-secondary/50 transition-colors text-center">
                <span className="text-xs text-foreground">Push forward</span>
              </button>
            </div>
          </section>

          {/* Emergency */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Emergency</h2>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors text-center">
                <span className="text-xs text-destructive">Pilot / Flying J (I-80)</span>
              </button>
              <button className="flex-1 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors text-center">
                <span className="text-xs text-destructive">Walmart overnight</span>
              </button>
            </div>
          </section>

          {/* Logistics */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Logistics</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Wegmans / Walmart</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">I-80 exits</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
