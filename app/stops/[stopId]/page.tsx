"use client"

import { StopDetailScreen } from "@/components/stop-detail-screen"
import { resolveStopId } from "@/lib/stops-data"
import { useParams, useRouter } from "next/navigation"

export default function StopDetailsPage() {
  const router = useRouter()
  const params = useParams<{ stopId: string }>()
  const stopIdParam = params?.stopId ?? ""
  const resolvedStopId = resolveStopId(stopIdParam)

  return (
    <StopDetailScreen
      stopId={resolvedStopId ?? stopIdParam}
      showStopList={false}
      onBack={() => router.push("/")}
      onNavigateToStop={(stopId) => router.push(`/stops/${stopId}`)}
    />
  )
}
