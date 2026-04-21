export type UserStopState = "upcoming" | "done" | "skipped";

export type TimingState = "ahead" | "on_track" | "due_today" | "delayed";

export type TripConfig = {
  plannedStartDate?: string;
  plannedDepartureTime?: string;
  timezone: string;
  maxDriveHoursPerDay?: number;
  avoidNightArrival?: boolean;
};

export type TripRuntime = {
  isStarted: boolean;
  actualDepartureAt?: string;
};

export type ActualArrival = {
  stopId: string;
  arrivedAt: string;
  actualStay?: string;
  notes?: string;
};

export type StopProgressRecord = {
  stopId: string;
  userState: UserStopState;
};

export type TripProgressState = {
  config: TripConfig;
  runtime: TripRuntime;
  stopProgress: Record<string, StopProgressRecord>;
  arrivals: Record<string, ActualArrival>;
};
