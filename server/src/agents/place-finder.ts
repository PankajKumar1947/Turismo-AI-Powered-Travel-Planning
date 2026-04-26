import { chatCompletion } from "../services/mistral.service";
import { reverseGeocode } from "../services/osrm.service";
import type { PlaceRecommendation, RecommendRequest } from "../types";

function getCurrentSeason(date: Date): string {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer/Monsoon";
  if (month >= 9 && month <= 11) return "Autumn/Fall";
  return "Winter";
}

function getMonthName(date: Date): string {
  return date.toLocaleString("en-US", { month: "long" });
}

export async function findPlaces(
  request: RecommendRequest
): Promise<PlaceRecommendation[]> {
  const now = new Date();
  const season = getCurrentSeason(now);
  const month = getMonthName(now);

  // Determine city name
  const cityName =
    request.cityName ||
    (await reverseGeocode(request.location.lat, request.location.lng));

  const systemPrompt = `You are a world-class travel expert and local guide. Your job is to recommend the best tourist places for visitors.

You MUST respond with a valid JSON object in this exact format:
{
  "places": [
    {
      "name": "Place Name",
      "description": "Brief compelling description (2-3 sentences)",
      "category": "heritage|temple|park|museum|market|food|waterfront|art|entertainment|nature|landmark",
      "location": { "lat": 0.0, "lng": 0.0 },
      "estimatedCostPerPerson": 0,
      "estimatedTimeToSpend": 60,
      "rating": 4.5,
      "reasonToVisit": "Why this place is worth visiting right now",
      "seasonalNote": "Any seasonal/festive relevance or null",
      "festiveRelevance": "Any ongoing festival or event relevance or null",
      "tags": ["photography", "history", "family-friendly"],
      "score": 85,
      "imageSearchQuery": "search term for finding images of this place"
    }
  ]
}

Rules:
- Return 7-10 places, sorted by score (highest first)
- Score is 0-100 based on: rating, cost efficiency, time efficiency, seasonal relevance, popularity
- estimatedCostPerPerson should be in the local currency (INR for India, USD for USA, EUR for Europe, etc.)
- estimatedTimeToSpend is in minutes
- Consider ongoing festivals, seasonal events, weather, and local happenings for the current date
- Include a mix of categories (don't recommend only temples or only museums)
- Consider the group type when recommending (family-friendly, couple-friendly, etc.)
- Provide accurate GPS coordinates (latitude, longitude)
- If a place is especially famous during this season/festival, boost its score and mention it in seasonalNote`;

  const userPrompt = `Find the best tourist places in ${cityName} for a visitor with these constraints:
- Current date: ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
- Current season: ${season} (${month})
- Available time: ${request.availableTimeMinutes} minutes (${(request.availableTimeMinutes / 60).toFixed(1)} hours)
- Budget: ${request.budgetINR} (local currency)
- Group type: ${request.groupType}
- Group size: ${request.groupSize} people
- Location: lat ${request.location.lat}, lng ${request.location.lng}
${request.preferences?.length ? `- Preferences: ${request.preferences.join(", ")}` : ""}

Consider any festivals, events, or seasonal attractions happening RIGHT NOW in ${cityName} during ${month} ${now.getFullYear()}. If there are famous seasonal spots, boost their scores.`;

  try {
    const response = await chatCompletion(systemPrompt, userPrompt);
    const parsed = JSON.parse(response);
    return parsed.places as PlaceRecommendation[];
  } catch (error) {
    console.error("Place Finder agent error:", error);
    throw new Error("Failed to find places. Please try again.");
  }
}
