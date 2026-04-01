import { apiClient } from "../services/api";
import type { AuthResponse, AuthUser, SavedItinerary } from "../types";

export const authQueries = {
  register: {
    key: ["auth", "register"],
    endpoint: "/api/auth/register",
  },
  login: {
    key: ["auth", "login"],
    endpoint: "/api/auth/login",
  },
  me: {
    key: ["auth", "me"],
    endpoint: "/api/auth/me",
  },
  updateMe: {
    key: ["auth", "updateMe"],
    endpoint: "/api/auth/me",
  },
};

export function fetchRegister(data: { name: string; email: string; password: string }) {
  return apiClient.post<AuthResponse>(authQueries.register.endpoint, data);
}

export function fetchLogin(data: { email: string; password: string }) {
  return apiClient.post<AuthResponse>(authQueries.login.endpoint, data);
}

export function fetchMe() {
  return apiClient.get<{ success: boolean; data: AuthUser }>(authQueries.me.endpoint);
}

export function fetchUpdateMe(data: { name?: string; preferences?: { categories?: string[]; budgetRange?: string } }) {
  return apiClient.put<{ success: boolean; data: AuthUser }>(authQueries.updateMe.endpoint, data);
}

// Itinerary queries (moved from itinerary.queries.ts for auth context)

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

export function fetchMyItineraries() {
  return apiClient.get<{ success: boolean; data: SavedItinerary[] }>(itineraryQueries.list.endpoint);
}

export function saveItinerary(data: { city: string; itinerary: unknown; request: unknown; places: unknown[] }) {
  return apiClient.post<{ success: boolean; data: SavedItinerary }>(itineraryQueries.save.endpoint, data);
}

export function deleteItinerary(id: string) {
  return apiClient.delete<{ success: boolean }>(`${itineraryQueries.delete.endpoint}/${id}`);
}
