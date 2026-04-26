import { findPlaces } from "../../agents/place-finder";
import { findRoutes } from "../../agents/route-finder";
import { aggregateItinerary } from "../../agents/aggregator";
import type { RouteOption, RecommendRequest } from "../../types";

export class RecommendService {
  static async getPlaceRecommendations(request: RecommendRequest) {
    const places = await findPlaces(request);
    return places;
  }

  static async getRoutesForPlaces(origin: { lat: number; lng: number }, selectedPlaces: { name: string; location: { lat: number; lng: number } }[]) {
    const routesMap: Record<string, RouteOption[]> = {};

    for (const place of selectedPlaces) {
      const placeRoutes = await findRoutes(origin, place.location, place.name);
      routesMap[place.name] = placeRoutes;
    }

    return routesMap;
  }

  static async aggregateToItinerary(data: { places: any[]; routes: Record<string, any[]>; request: RecommendRequest }) {
    const routesMap = new Map<string, RouteOption[]>();
    for (const [key, value] of Object.entries(data.routes)) {
      routesMap.set(key, value as RouteOption[]);
    }

    const itinerary = await aggregateItinerary({
      places: data.places,
      routes: routesMap,
      request: data.request,
    });

    return itinerary;
  }
}
