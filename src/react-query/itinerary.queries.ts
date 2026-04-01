import { apiClient } from "../services/api";

export const itineraryQueries = {
  list: {
    key: ["itineraries"],
    endpoint: "/api/itineraries",
  },
  save: {
    key: ["itineraries", "save"],
    endpoint: "/api/itineraries",
  },
  delete: {
    key: ["itineraries", "delete"],
    endpoint: "/api/itineraries",
  },
};

// ── Fetcher functions ──

export function fetchItineraries(userId: string) {
  return apiClient.get<{ success: boolean; data: unknown[] }>(
    `${itineraryQueries.list.endpoint}/${userId}`
  );
}

export function saveItinerary(data: {
  userId: string;
  city: string;
  itinerary: unknown;
}) {
  return apiClient.post<{ success: boolean; data: unknown }>(
    itineraryQueries.save.endpoint,
    data
  );
}

export function deleteItinerary(id: string) {
  return apiClient.delete<{ success: boolean }>(
    `${itineraryQueries.delete.endpoint}/${id}`
  );
}
