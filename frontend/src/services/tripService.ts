import type {
  Trip,
  CreateTripPayload,
  GenerateTripPayload,
  GetTripsParams,
  PaginatedTripsResponse,
} from "@/types/trip";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Creates a new trip record. */
export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/v1/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to create trip.");
  }

  return res.json();
}

/** Fetches paginated trips with optional destination filter. */
export async function getTrips(params: GetTripsParams = {}): Promise<PaginatedTripsResponse> {
  const query = new URLSearchParams();
  if (params.destination) query.set("destination", params.destination);
  if (params.page)        query.set("page",        String(params.page));
  if (params.limit)       query.set("limit",       String(params.limit));

  const res = await fetch(`${API_URL}/api/v1/trips?${query.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch trips.");
  }

  return res.json();
}

/** Fetches a single trip by ID. */
export async function getTripById(tripId: number): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/v1/trips/${tripId}`);

  if (!res.ok) {
    throw new Error(`Trip with id ${tripId} not found.`);
  }

  return res.json();
}

/** Triggers AI itinerary generation for an existing trip. */
export async function generateRecommendation(
  tripId: number,
  payload: GenerateTripPayload
): Promise<Trip> {
  const res = await fetch(`${API_URL}/api/v1/trips/${tripId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to generate recommendation.");
  }

  return res.json();
}
