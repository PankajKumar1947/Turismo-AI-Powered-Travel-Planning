import type { 
  AggregatedResponse, 
  RecommendRequest, 
  PlaceRecommendation 
} from "./recommend.interface";

export interface SavedItinerary {
  _id: string;
  userId: string;
  city: string;
  itinerary: AggregatedResponse;
  request: RecommendRequest;
  places: PlaceRecommendation[];
  createdAt: string;
}

export interface SaveItineraryRequest {
  city: string;
  itinerary: unknown;
  request: unknown;
  places: unknown[];
}

export interface ItinerariesResponse {
  success: boolean;
  data: SavedItinerary[];
}

export interface SaveItineraryResponse {
  success: boolean;
  data: SavedItinerary;
}

export interface DeleteItineraryResponse {
  success: boolean;
}
