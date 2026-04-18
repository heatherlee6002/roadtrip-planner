"use client"

import { X, HelpCircle, Navigation, AlertCircle, ChevronRight, Dog, ArrowRight, AlertTriangle, Tent, Trees, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStayOptions, getStopById } from "@/lib/stops-data"

interface PopupPreviewProps {
  type: "what-now" | "next-stop" | "emergency"
  currentStopId: string
  nextStopId: string
  onClose: () => void
  onExpand: () => void
}

export function PopupPreview({ type, currentStopId, nextStopId, onClose, onExpand }: PopupPreviewProps) {
  const currentStop = getStopById(currentStopId)
  const nextStop = getStopById(nextStopId)
  const nextRecommended = nextStop ? getStayOptions(nextStop).find((option) => option.label === "A") : null
  const emergencyStay = currentStop ? getStayOptions(currentStop).find((option) => option.label === "D") : null

  const config = {
    "what-now": {
      icon: HelpCircle,
      title: "What now?",
      subtitle: currentStop ? `Near ${currentStop.shortName}` : undefined,
      color: "bg-[oklch(0.55_0.15_260)]",
      items: [
        { icon: Dog, label: "Dog-first options" },
        { icon: Tent, label: "Compare A/B/C/D" },
        { icon: ArrowRight, label: nextStop ? `Move to ${nextStop.shortName}` : "Move forward" },
        { icon: AlertTriangle, label: "Emergency help" },
      ]
    },
    "next-stop": {
      icon: Navigation,
      title: nextStop?.name || "Next Stop",
      subtitle: nextStop ? `${nextStop.distance} from start` : undefined,
      color: "bg-[oklch(0.55_0.18_150)]",
      items: nextStop ? [
        { icon: Tent, label: nextRecommended?.name || "Recommended stay" },
        { icon: Trees, label: nextStop.type === "scenic-only" ? "Scenic stop" : "Stay decision stop" },
        { icon: Dog, label: nextStop.dogWalks[0]?.leashRequired ? "Leash required area" : "Off-leash possible" },
      ] : []
    },
    "emergency": {
      icon: AlertCircle,
      title: "Emergency",
      subtitle: currentStop ? `Near ${currentStop.shortName}` : undefined,
      color: "bg-[oklch(0.60_0.18_40)]",
      items: currentStop ? [
        { icon: Car, label: currentStop.groceryNearby || "Nearby services" },
        { icon: Tent, label: emergencyStay?.name || "Emergency overnight" },
        { icon: Trees, label: `Warning ${currentStop.areaWarnings.rating}/5` },
      ] : []
    }
  }

  const c = config[type]
  const Icon = c.icon

  return (
    <div className="absolute bottom-20 left-0 right-0 mx-4 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className={`${c.color} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3 min-w-0">
            <Icon className="w-5 h-5 text-white shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white truncate">{c.title}</h3>
              {c.subtitle && <p className="text-xs text-white/80">{c.subtitle}</p>}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 shrink-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-3 space-y-1">
          {c.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground truncate">{item.label}</span>
            </div>
          ))}
        </div>

        <button onClick={onExpand} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
          <span className="text-sm font-medium text-primary">View full details</span>
          <ChevronRight className="w-4 h-4 text-primary" />
        </button>
      </div>
    </div>
  )
}
