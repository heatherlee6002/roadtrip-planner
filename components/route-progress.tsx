"use client"

import type { RoutePhase } from "@/lib/stops-data"

interface RouteProgressProps {
  from: string
  to: string
  progress: number
  phase: RoutePhase
  tripCompleted?: boolean
}

export function RouteProgress({ from, to, progress, phase, tripCompleted }: RouteProgressProps) {
  const phaseLabel = tripCompleted 
    ? "Complete" 
    : phase === "outbound" 
      ? "Outbound" 
      : phase === "turning-point" 
        ? "Turning Point" 
        : "Return"

  return (
    <div className="bg-card rounded-xl p-3 border border-border/50">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{from}</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${
            phase === "outbound" ? "bg-primary" : 
            phase === "turning-point" ? "bg-accent" : 
            "bg-emerald-500"
          }`} />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {phaseLabel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{to}</span>
      </div>
      <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
            phase === "outbound" ? "bg-primary" : 
            phase === "turning-point" ? "bg-accent" : 
            "bg-emerald-500"
          }`}
          style={{ width: `${Math.max(progress, 2)}%` }}
        />
        {/* Current position indicator */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-card shadow-sm transition-all duration-500 ${
            phase === "outbound" ? "bg-primary" : 
            phase === "turning-point" ? "bg-accent" : 
            "bg-emerald-500"
          }`}
          style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
      </div>
    </div>
  )
}
