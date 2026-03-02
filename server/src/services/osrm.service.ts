import { config } from "../config/env";

interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  legs: {
    steps: {
      distance: number;
      duration: number;
      name: string;
      maneuver: { type: string; modifier?: string };
    }[];
  }[];
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
}

export type OSRMProfile = "car" | "foot" | "bike";

/**
 * Get route between two points using OSRM (free, no API key needed).
 * Profiles: car, foot, bike
 */
export async function getRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  profile: OSRMProfile = "car"
): Promise<OSRMRoute | null> {
  const url = `${config.osrmBaseUrl}/route/v1/${profile}/${originLng},${originLat};${destLng},${destLat}?overview=false&steps=true`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Turismo/1.0" },
    });
    const data: OSRMResponse = await response.json();

    if (data.code !== "Ok" || !data.routes.length) {
      return null;
    }
    return data.routes[0]!;
  } catch (error) {
    console.error(`OSRM route error (${profile}):`, error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to city name using Nominatim (free).
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  const url = `${config.nominatimBaseUrl}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Turismo/1.0" },
    });
    const data = await response.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.display_name ||
      "Unknown location"
    );
  } catch (error) {
    console.error("Nominatim reverse geocode error:", error);
    return "Unknown location";
  }
}

/**
 * Forward geocode a city name to coordinates using Nominatim.
 */
export async function forwardGeocode(
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const url = `${config.nominatimBaseUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Turismo/1.0" },
    });
    const data = await response.json();

    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.error("Nominatim forward geocode error:", error);
    return null;
  }
}
