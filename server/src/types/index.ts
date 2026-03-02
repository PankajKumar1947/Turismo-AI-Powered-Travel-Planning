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
  estimatedTimeToSpend: number; // minutes
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
  duration: number; // minutes
  estimatedCost: number;
  distance: number; // km
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

export interface RouteRequest {
  origin: PlaceLocation;
  destination: PlaceLocation;
  placeName?: string;
}
