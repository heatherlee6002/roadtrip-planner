"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { stopsData } from "@/lib/stops-data"

interface TripMapProps {
  currentStopId: string
  selectedStop?: string | null
  onStopClick?: (stopId: string) => void
}

export function TripMap({ currentStopId, selectedStop, onStopClick }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [isClient, setIsClient] = useState(false)
  const currentStopIndex = stopsData.findIndex(s => s.id === currentStopId)
  const currentStop = stopsData.find(s => s.id === currentStopId)

  // Stable callback ref
  const onStopClickRef = useRef(onStopClick)
  onStopClickRef.current = onStopClick

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    // Only initialize once
    if (mapInstanceRef.current) return

    // Dynamically import Leaflet
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Create map
      const center: [number, number] = currentStop 
        ? [currentStop.lat, currentStop.lng] 
        : [39.8283, -98.5795]

      const map = L.map(mapRef.current!, {
        center,
        zoom: 5,
        zoomControl: false,
      })

      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Generate route coordinates
      const outboundStops = stopsData.filter(s => s.phase === "outbound" || s.phase === "turning-point")
      const returnStops = stopsData.filter(s => s.phase === "return")
      
      const outboundCoords: [number, number][] = outboundStops.map(s => [s.lat, s.lng])
      const returnCoords: [number, number][] = returnStops.map(s => [s.lat, s.lng])
      
      // Add connection from turning point to first return stop and back to start
      const turningPoint = outboundStops[outboundStops.length - 1]
      if (returnCoords.length > 0) {
        returnCoords.unshift([turningPoint.lat, turningPoint.lng])
        returnCoords.push([stopsData[0].lat, stopsData[0].lng])
      }

      // Draw outbound route
      L.polyline(outboundCoords, {
        color: "#4a90d9",
        weight: 4,
        opacity: 0.8,
      }).addTo(map)

      // Draw return route
      if (returnCoords.length > 1) {
        L.polyline(returnCoords, {
          color: "#3d8b8b",
          weight: 3,
          opacity: 0.6,
          dashArray: "10, 10",
        }).addTo(map)
      }

      // Add markers for each stop
      stopsData.forEach((stop) => {
        const isCurrent = stop.id === currentStopId
        const isPast = parseInt(stop.id) < currentStopIndex
        const isNext = parseInt(stop.id) === currentStopIndex + 1
        const isTurningPoint = stop.phase === "turning-point"

        let markerHtml: string
        let iconSize: [number, number]
        let iconAnchor: [number, number]

        if (isCurrent) {
          markerHtml = `
            <div style="
              width: 32px;
              height: 32px;
              background: #2dd4bf;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 0 8px rgba(45, 212, 191, 0.3), 0 4px 12px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" stroke-width="2.5">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
            </div>
          `
          iconSize = [32, 32]
          iconAnchor = [16, 16]
        } else {
          let bgColor = "#252538"
          let borderColor = "#666"
          let textColor = "#999"
          let scale = 1

          if (isNext) {
            borderColor = "#2dd4bf"
            textColor = "#2dd4bf"
            scale = 1.1
          } else if (isPast) {
            bgColor = "#1a1a28"
            borderColor = "#444"
            textColor = "#555"
          }
          if (isTurningPoint) {
            borderColor = "#2dd4bf"
            bgColor = "rgba(45, 212, 191, 0.2)"
          }

          markerHtml = `
            <div style="
              width: ${24 * scale}px;
              height: ${24 * scale}px;
              background: ${bgColor};
              border: 2px solid ${borderColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 600;
              color: ${textColor};
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              font-family: system-ui, sans-serif;
            ">
              ${stop.stepNumber || ""}
            </div>
          `
          iconSize = [24 * scale, 24 * scale]
          iconAnchor = [12 * scale, 12 * scale]
        }

        const icon = L.divIcon({
          className: "",
          html: markerHtml,
          iconSize,
          iconAnchor,
        })

        const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(map)
        
        marker.on("click", (e) => {
          console.log("[v0] Marker clicked:", stop.id, stop.shortName)
          L.DomEvent.stopPropagation(e)
          onStopClickRef.current?.(stop.id)
        })

        // Add popup
        marker.bindPopup(`
          <div style="text-align: center; padding: 4px;">
            <p style="font-weight: 600; font-size: 13px; margin: 0; color: #fff;">${stop.shortName}</p>
            <p style="font-size: 11px; color: #999; margin: 4px 0 0 0;">${stop.distance}</p>
          </div>
        `, {
          className: "dark-popup"
        })
      })

      // Fit bounds to show all stops
      const allCoords = stopsData.map(s => [s.lat, s.lng] as [number, number])
      map.fitBounds(allCoords, { padding: [30, 30] })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient, currentStopId, currentStopIndex, currentStop])

  if (!isClient) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-secondary/20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ zIndex: 0 }}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(45, 212, 191, 0.3), 0 4px 12px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 16px rgba(45, 212, 191, 0.1), 0 4px 12px rgba(0,0,0,0.3); }
        }
        .leaflet-popup-content-wrapper {
          background: #252538 !important;
          color: #fff !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .leaflet-popup-content {
          margin: 8px 12px !important;
        }
        .leaflet-popup-tip {
          background: #252538 !important;
        }
        .leaflet-container {
          background: #1a1a2e !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
