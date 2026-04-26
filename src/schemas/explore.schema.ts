import { z } from "zod";
import type { 
  PlaceLocation, 
  PlaceRecommendation, 
  RouteOption 
} from "@/interfaces/recommend.interface";

export const exploreSchema = z.object({
  cityQuery: z.string(),
  time: z.array(z.number()),
  budget: z.string().min(1, "Budget is required"),
  groupType: z.enum(["solo", "couple", "family", "friends"]),
  groupSize: z.string(),
  selectedCategories: z.array(z.string()),
});

export type ExploreFormData = z.infer<typeof exploreSchema>;

// API Request Types
export type GroupType = "solo" | "couple" | "family" | "friends";

export interface RecommendRequest {
  location: PlaceLocation;
  cityName?: string;
  availableTimeMinutes: number;
  budgetINR: number;
  groupType: GroupType;
  groupSize: number;
  preferences?: string[];
}

export interface FetchRoutesRequest {
  origin: PlaceLocation;
  selectedPlaces: { name: string; location: PlaceLocation }[];
}

export interface AggregateRequest {
  places: PlaceRecommendation[];
  routes: Record<string, RouteOption[]>;
  request: RecommendRequest;
}
