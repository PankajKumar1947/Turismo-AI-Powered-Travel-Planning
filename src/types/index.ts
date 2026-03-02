// ── Place types ──

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlaceRecommendation {
  name: string;
  description: string;
  category: string;
  location: PlaceLocation;
  estimatedCostPerPerson: number;
  estimatedTimeToSpend: number;
  rating: number;
  reasonToVisit: string;
  seasonalNote?: string;
  festiveRelevance?: string;
  tags: string[];
  score: number;
  imageSearchQuery?: string;
}

// ── Route types ──

export interface RouteOption {
  mode: string;
  duration: number;
  estimatedCost: number;
  distance: number;
  steps: string[];
  localTip?: string;
  recommended: boolean;
}

// ── Itinerary types ──

export interface ItineraryItem {
  order: number;
  place: PlaceRecommendation;
  route?: RouteOption;
  estimatedArrival?: string;
  estimatedDeparture?: string;
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
}

export interface AggregatedResponse {
  summary: string;
  itinerary: ItineraryItem[];
  totalEstimatedCost: number;
  totalEstimatedTime: number;
  budgetBreakdown: BudgetBreakdown[];
  tips: string[];
}

// ── Request types ──

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

// ── API Response ──

export interface RecommendResponse {
  success: boolean;
  data: {
    places: PlaceRecommendation[];
    itinerary: AggregatedResponse;
  };
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

// ── Auth types ──

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  preferences: {
    categories: string[];
    budgetRange: string;
  };
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
}

// ── Saved Itinerary types ──

export interface SavedItinerary {
  _id: string;
  userId: string;
  city: string;
  itinerary: AggregatedResponse;
  request: RecommendRequest;
  places: PlaceRecommendation[];
  createdAt: string;
}
