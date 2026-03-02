import { chatCompletion } from "../services/mistral.service";
import type {
  PlaceRecommendation,
  RouteOption,
  AggregatedResponse,
  RecommendRequest,
} from "../types";

interface AgentData {
  places: PlaceRecommendation[];
  routes: Map<string, RouteOption[]>; // placeName -> routes
  request: RecommendRequest;
}

export async function aggregateItinerary(
  data: AgentData
): Promise<AggregatedResponse> {
  const { places, routes, request } = data;

  // Convert routes Map to a plain object for JSON serialization
  const routesObj: Record<string, RouteOption[]> = {};
  routes.forEach((value, key) => {
    routesObj[key] = value;
  });

  const systemPrompt = `You are a master travel itinerary planner. Given a list of recommended places and available routes, create an optimized day itinerary.

You MUST respond with a valid JSON object in this exact format:
{
  "summary": "A friendly, engaging 2-3 sentence summary of the itinerary",
  "itinerary": [
    {
      "order": 1,
      "place": {
        "name": "Place Name",
        "description": "Brief description",
        "category": "category",
        "location": { "lat": 0, "lng": 0 },
        "estimatedCostPerPerson": 0,
        "estimatedTimeToSpend": 60,
        "rating": 4.5,
        "reasonToVisit": "Why visit",
        "seasonalNote": null,
        "festiveRelevance": null,
        "tags": [],
        "score": 85,
        "imageSearchQuery": "search query"
      },
      "route": {
        "mode": "walk",
        "duration": 10,
        "estimatedCost": 0,
        "distance": 0.5,
        "steps": ["Walk along Main Street"],
        "localTip": "Nice shaded path",
        "recommended": true
      },
      "estimatedArrival": "10:00 AM",
      "estimatedDeparture": "11:30 AM"
    }
  ],
  "totalEstimatedCost": 0,
  "totalEstimatedTime": 0,
  "budgetBreakdown": [
    { "category": "Attractions", "amount": 0 },
    { "category": "Transport", "amount": 0 },
    { "category": "Food & Drinks", "amount": 0 }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"]
}

Rules:
- Select the BEST places that fit within the time and budget constraints
- Order places geographically to minimize travel time between stops
- Use the recommended route option for each leg
- Include realistic arrival/departure times (assume starting at current time or 9 AM)
- totalEstimatedCost should account for the group size
- Include 3-5 practical tips for the visitor
- Keep the summary warm, human, and engaging
- Budget breakdown should cover: Attractions, Transport, Food & Drinks (allocate ~20% of remaining budget to food)`;

  const userPrompt = `Create an optimized itinerary with these constraints:

AVAILABLE TIME: ${request.availableTimeMinutes} minutes (${(request.availableTimeMinutes / 60).toFixed(1)} hours)
BUDGET: ${request.budgetINR} (local currency, for ${request.groupSize} people total)
GROUP: ${request.groupType}, ${request.groupSize} people

RECOMMENDED PLACES:
${JSON.stringify(places.slice(0, 10), null, 2)}

AVAILABLE ROUTES:
${JSON.stringify(routesObj, null, 2)}

Select the best combination of places that fits within the time and budget. Order them efficiently to minimize travel.`;

  try {
    const response = await chatCompletion(systemPrompt, userPrompt);
    const parsed = JSON.parse(response);
    return parsed as AggregatedResponse;
  } catch (error) {
    console.error("Aggregator agent error:", error);
    throw new Error("Failed to create itinerary. Please try again.");
  }
}
