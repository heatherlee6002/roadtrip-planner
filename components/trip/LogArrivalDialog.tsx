"use client";

import { useMemo, useState } from "react";
import { getNowPrefill } from "@/lib/trip-progress";

type Props = {
  open: boolean;
  stopName: string;
  onClose: () => void;
  onConfirm: (payload: {
    arrivalDate: string;
    arrivalTime: string;
    actualStay?: string;
    notes?: string;
  }) => void;
};

export default function LogArrivalDialog({
  open,
  stopName,
  onClose,
  onConfirm,
}: Props) {
  const prefill = useMemo(() => getNowPrefill(), []);
  const [arrivalDate, setArrivalDate] = useState(prefill.date);
  const [arrivalTime, setArrivalTime] = useState(prefill.time);
  const [actualStay, setActualStay] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Log Actual Arrival</h2>
          <p className="mt-1 text-sm text-gray-600">{stopName}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Arrival Date</span>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="rounded-xl border px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Arrival Time</span>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="rounded-xl border px-3 py-2"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium">Actual Stay (optional)</span>
            <input
              type="text"
              value={actualStay}
              onChange={(e) => setActualStay(e.target.value)}
              placeholder="Campground, motel, pull-off, etc."
              className="rounded-xl border px-3 py-2"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-xl border px-3 py-2"
            />
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
                arrivalDate,
                arrivalTime,
                actualStay: actualStay || undefined,
                notes: notes || undefined,
              })
            }
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Save Arrival
          </button>
        </div>
      </div>
    </div>
  );
}
