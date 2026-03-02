import { chatCompletion } from "../services/mistral.service";
import { getRoute } from "../services/osrm.service";
import type { PlaceLocation, RouteOption } from "../types";

export async function findRoutes(
  origin: PlaceLocation,
  destination: PlaceLocation,
  placeName?: string
): Promise<RouteOption[]> {
  const routeOptions: RouteOption[] = [];

  // Get OSRM routes for different profiles (free)
  const profiles = [
    { profile: "car" as const, mode: "drive" },
    { profile: "foot" as const, mode: "walk" },
    { profile: "bike" as const, mode: "cycle" },
  ];

  for (const { profile, mode } of profiles) {
    const route = await getRoute(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng,
      profile
    );

    if (route) {
      const distanceKm = route.distance / 1000;
      const durationMin = Math.round(route.duration / 60);

      // Skip walking if > 5km
      if (mode === "walk" && distanceKm > 5) continue;
      // Skip cycling if > 20km
      if (mode === "cycle" && distanceKm > 20) continue;

      const steps = route.legs
        .flatMap((leg) => leg.steps)
        .map(
          (step) =>
            `${step.maneuver.type}${step.maneuver.modifier ? " " + step.maneuver.modifier : ""} on ${step.name || "unnamed road"} (${(step.distance / 1000).toFixed(1)} km)`
        )
        .slice(0, 8); // limit to 8 steps for readability

      routeOptions.push({
        mode,
        duration: durationMin,
        estimatedCost: mode === "walk" ? 0 : mode === "cycle" ? 0 : Math.round(distanceKm * 15), // rough cab fare
        distance: Math.round(distanceKm * 10) / 10,
        steps,
        recommended: false,
      });
    }
  }

  // Use Mistral to enrich with local transport tips and public transit info
  if (routeOptions.length > 0) {
    try {
      const enriched = await enrichWithLocalTips(
        origin,
        destination,
        routeOptions,
        placeName
      );
      return enriched;
    } catch (error) {
      console.error("Route enrichment error:", error);
      // Mark the fastest option as recommended
      if (routeOptions.length > 0) {
        const fastest = routeOptions.reduce((a, b) =>
          a.duration < b.duration ? a : b
        );
        fastest.recommended = true;
      }
      return routeOptions;
    }
  }

  return routeOptions;
}

async function enrichWithLocalTips(
  origin: PlaceLocation,
  destination: PlaceLocation,
  routes: RouteOption[],
  placeName?: string
): Promise<RouteOption[]> {
  const systemPrompt = `You are a local transport expert. Given route options between two points, you will:
1. Add helpful local transport tips (e.g., "Take metro line 2 to station X, then walk 5 minutes")
2. Add a public transport option if available (bus, metro, ferry, tram, etc.)
3. Mark the best option as recommended based on time/cost tradeoff
4. Adjust estimated costs to be realistic for the local area

Respond with JSON:
{
  "routes": [
    {
      "mode": "string",
      "duration": 0,
      "estimatedCost": 0,
      "distance": 0,
      "steps": ["step1", "step2"],
      "localTip": "helpful local tip",
      "recommended": false
    }
  ]
}

Include ALL provided routes plus any public transit option you can add.`;

  const userPrompt = `Origin: ${origin.lat}, ${origin.lng}
Destination: ${destination.lat}, ${destination.lng}${placeName ? ` (${placeName})` : ""}

Existing route options:
${JSON.stringify(routes, null, 2)}

Add local transport tips, a public transit option if possible, and mark the best option as recommended.`;

  const response = await chatCompletion(systemPrompt, userPrompt);
  const parsed = JSON.parse(response);
  return parsed.routes as RouteOption[];
}
