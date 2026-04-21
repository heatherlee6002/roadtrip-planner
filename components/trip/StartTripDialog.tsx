"use client";

import { useMemo, useState } from "react";
import { getNowPrefill } from "@/lib/trip-progress";
import { TripConfig } from "@/types/trip-progress";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    startDate: string;
    departureTime: string;
    timezone: string;
    maxDriveHoursPerDay?: number;
    avoidNightArrival: boolean;
  }) => void;
  initialConfig?: Partial<TripConfig>;
};

export default function StartTripDialog({
  open,
  onClose,
  onConfirm,
  initialConfig,
}: Props) {
  const prefill = useMemo(() => getNowPrefill(), []);
  const [startDate, setStartDate] = useState(initialConfig?.plannedStartDate ?? prefill.date);
  const [departureTime, setDepartureTime] = useState(
    initialConfig?.plannedDepartureTime ?? prefill.time
  );
  const [timezone, setTimezone] = useState(initialConfig?.timezone ?? "America/New_York");
  const [maxDriveHoursPerDay, setMaxDriveHoursPerDay] = useState(
    initialConfig?.maxDriveHoursPerDay?.toString() ?? "6"
  );
  const [avoidNightArrival, setAvoidNightArrival] = useState(
    initialConfig?.avoidNightArrival ?? true
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Start Trip</h2>
          <p className="mt-1 text-sm text-gray-600">
            Begin tracking with today’s date and time, then log actual arrivals as you go.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Departure Time</span>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="rounded-xl border px-3 py-2"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium">Time Zone</span>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="rounded-xl border px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Max Driving Hours / Day</span>
            <input
              type="number"
              min={1}
              max={14}
              value={maxDriveHoursPerDay}
              onChange={(e) => setMaxDriveHoursPerDay(e.target.value)}
              className="rounded-xl border px-3 py-2"
            />
          </label>

          <label className="flex items-center gap-3 self-end rounded-xl border px-3 py-3">
            <input
              type="checkbox"
              checked={avoidNightArrival}
              onChange={(e) => setAvoidNightArrival(e.target.checked)}
            />
            <span className="text-sm font-medium">Avoid Night Arrival</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm({
                startDate,
                departureTime,
                timezone,
                maxDriveHoursPerDay: Number(maxDriveHoursPerDay) || undefined,
                avoidNightArrival,
              })
            }
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Begin Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
