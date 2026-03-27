import { useMutation } from "@tanstack/react-query";
import {
  fetchPlaces,
  fetchRoutes,
  fetchAggregate,
  recommendQueries,
  type FetchRoutesInput,
  type AggregateInput,
} from "@/react-query/recommend.queries";
import { fetchGeocodeForward, fetchGeocodeReverse, geocodeQueries } from "@/react-query/geocode.queries";
import type { PlaceRecommendation, RecommendRequest, RouteOption, AggregatedResponse, GeocodeResult } from "@/types";

/**
 * Step 1: Find places via Agent-1
 */
export function useFindPlaces() {
  return useMutation<
    { success: boolean; data: PlaceRecommendation[] },
    Error,
    RecommendRequest
  >({
    mutationKey: recommendQueries.getPlaces.key,
    mutationFn: fetchPlaces,
  });
}

/**
 * Step 2: Find routes via Agent-2
 */
export function useFindRoutes() {
  return useMutation<
    { success: boolean; data: Record<string, RouteOption[]> },
    Error,
    FetchRoutesInput
  >({
    mutationKey: recommendQueries.getRoutes.key,
    mutationFn: fetchRoutes,
  });
}

/**
 * Step 3: Aggregate itinerary via Agent-3
 */
export function useAggregate() {
  return useMutation<
    { success: boolean; data: AggregatedResponse },
    Error,
    AggregateInput
  >({
    mutationKey: recommendQueries.aggregate.key,
    mutationFn: fetchAggregate,
  });
}

/**
 * Geocode city name → coordinates
 */
export function useGeocodeForward() {
  return useMutation<
    { success: boolean; data: GeocodeResult },
    Error,
    string
  >({
    mutationKey: geocodeQueries.forward.key,
    mutationFn: fetchGeocodeForward,
  });
}
/**
 * Reverse geocode coordinates → city name
 */
export function useGeocodeReverse() {
  return useMutation<
    { success: boolean; data: { cityName: string } },
    Error,
    { lat: number; lng: number }
  >({
    mutationKey: geocodeQueries.reverse.key,
    mutationFn: ({ lat, lng }) => fetchGeocodeReverse(lat, lng),
  });
}
