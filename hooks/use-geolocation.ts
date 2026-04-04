"use client"

import { useState, useEffect, useCallback } from "react"
import { stopsData, StopData } from "@/lib/stops-data"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

interface NearestStopResult {
  stop: StopData | null
  distanceMiles: number | null
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  })

  const [nearestStop, setNearestStop] = useState<NearestStopResult>({
    stop: null,
    distanceMiles: null,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setState({
          latitude,
          longitude,
          accuracy,
          error: null,
          loading: false,
        })

        // Find nearest stop
        let closestStop: StopData | null = null
        let minDistance = Infinity

        for (const stop of stopsData) {
          if (stop.lat && stop.lng) {
            const distance = calculateDistance(latitude, longitude, stop.lat, stop.lng)
            if (distance < minDistance) {
              minDistance = distance
              closestStop = stop
            }
          }
        }

        setNearestStop({
          stop: closestStop,
          distanceMiles: minDistance === Infinity ? null : Math.round(minDistance),
        })
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            break
        }
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  return {
    ...state,
    nearestStop,
    requestLocation,
  }
}
