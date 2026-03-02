import type { GeocodeResult } from "@/types";
import { apiClient } from "@/services/api";

export const geocodeQueries = {
  forward: {
    key: ["geocode", "forward"],
    endpoint: "/api/geocode/forward",
  },
  reverse: {
    key: ["geocode", "reverse"],
    endpoint: "/api/geocode/reverse",
  },
};

// ── Fetcher functions ──

export function fetchGeocodeForward(query: string) {
  return apiClient.post<{ success: boolean; data: GeocodeResult }>(
    geocodeQueries.forward.endpoint,
    { query }
  );
}

export function fetchGeocodeReverse(lat: number, lng: number) {
  return apiClient.post<{ success: boolean; data: { cityName: string } }>(
    geocodeQueries.reverse.endpoint,
    { lat, lng }
  );
}
