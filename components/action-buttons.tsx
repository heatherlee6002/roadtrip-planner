"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle, Navigation, AlertCircle } from "lucide-react"

interface ActionButtonsProps {
  onWhatNow?: () => void
  onNextStop?: () => void
  onEmergency?: () => void
  activeButton?: "what-now" | "next-stop" | "emergency" | null
  tripCompleted?: boolean
  onViewFullTrip?: () => void
  onStartNewTrip?: () => void
}

export function ActionButtons({ onWhatNow, onNextStop, onEmergency, activeButton, tripCompleted, onViewFullTrip, onStartNewTrip }: ActionButtonsProps) {
  if (tripCompleted) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={onViewFullTrip}
          className="flex flex-col items-center gap-1.5 h-auto py-4 bg-[oklch(0.55_0.15_260)] hover:bg-[oklch(0.50_0.15_260)] text-white border-0 rounded-xl"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-xs font-medium">View full trip</span>
        </Button>
        
        <Button 
          onClick={onStartNewTrip}
          className="flex flex-col items-center gap-1.5 h-auto py-4 bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.50_0.18_150)] text-white border-0 rounded-xl"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-xs font-medium">Start new trip</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button 
        onClick={onWhatNow}
        className={`flex flex-col items-center gap-1.5 h-auto py-4 bg-[oklch(0.55_0.15_260)] hover:bg-[oklch(0.50_0.15_260)] text-white border-0 rounded-xl ${activeButton === "what-now" ? "ring-2 ring-white/50" : ""}`}
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-xs font-medium">What now</span>
      </Button>
      
      <Button 
        onClick={onNextStop}
        className={`flex flex-col items-center gap-1.5 h-auto py-4 bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.50_0.18_150)] text-white border-0 rounded-xl ${activeButton === "next-stop" ? "ring-2 ring-white/50" : ""}`}
      >
        <Navigation className="w-5 h-5" />
        <span className="text-xs font-medium">Next stop</span>
      </Button>
      
      <Button 
        onClick={onEmergency}
        className={`flex flex-col items-center gap-1.5 h-auto py-4 bg-[oklch(0.60_0.18_40)] hover:bg-[oklch(0.55_0.18_40)] text-white border-0 rounded-xl ${activeButton === "emergency" ? "ring-2 ring-white/50" : ""}`}
      >
        <AlertCircle className="w-5 h-5" />
        <span className="text-xs font-medium">Emergency</span>
      </Button>
    </div>
  )
}
