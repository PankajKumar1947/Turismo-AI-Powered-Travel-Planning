import type { PlaceRecommendation, RecommendRequest, RouteOption, AggregatedResponse } from "@/types";
import { apiClient } from "@/services/api";

export const recommendQueries = {
  getPlaces: {
    key: ["recommend", "places"],
    endpoint: "/api/recommend/places",
  },
  getRoutes: {
    key: ["recommend", "routes"],
    endpoint: "/api/recommend/routes",
  },
  aggregate: {
    key: ["recommend", "aggregate"],
    endpoint: "/api/recommend/aggregate",
  },
};

// ── Step 1: Find places ──

export function fetchPlaces(data: RecommendRequest) {
  return apiClient.post<{ success: boolean; data: PlaceRecommendation[] }>(
    recommendQueries.getPlaces.endpoint,
    data
  );
}

// ── Step 2: Find routes for selected places ──

export interface FetchRoutesInput {
  origin: { lat: number; lng: number };
  selectedPlaces: { name: string; location: { lat: number; lng: number } }[];
}

export function fetchRoutes(data: FetchRoutesInput) {
  return apiClient.post<{ success: boolean; data: Record<string, RouteOption[]> }>(
    recommendQueries.getRoutes.endpoint,
    data
  );
}

// ── Step 3: Aggregate into itinerary ──

export interface AggregateInput {
  places: PlaceRecommendation[];
  routes: Record<string, RouteOption[]>;
  request: RecommendRequest;
}

export function fetchAggregate(data: AggregateInput) {
  return apiClient.post<{ success: boolean; data: AggregatedResponse }>(
    recommendQueries.aggregate.endpoint,
    data
  );
}
