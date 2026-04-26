import { createContext, useContext } from "react";
import type { ExploreFormData, RecommendRequest } from "@/schemas/explore.schema";
import type { AggregatedResponse, PlaceRecommendation, RouteOption } from "@/interfaces/recommend.interface";

export interface ExploreState {
  formData: ExploreFormData;
  location: { lat: number; lng: number } | null;
  resolvedCity: string;
  places: PlaceRecommendation[] | null;
  selectedPlaces: string[];
  routes: Record<string, RouteOption[]> | null;
  selectedRoutes: Record<string, string>;
  savedRequest: RecommendRequest | null;
  itinerary: AggregatedResponse | null;
  isSaved: boolean;
}

export interface ExploreContextType extends ExploreState {
  setFormData: (data: ExploreFormData) => void;
  setLocation: (loc: { lat: number; lng: number } | null) => void;
  setResolvedCity: (city: string) => void;
  setPlaces: (places: PlaceRecommendation[]) => void;
  setSelectedPlaces: (places: string[]) => void;
  setRoutes: (routes: Record<string, RouteOption[]>) => void;
  setSelectedRoutes: (routes: Record<string, string>) => void;
  setSavedRequest: (request: RecommendRequest) => void;
  setItinerary: (itinerary: AggregatedResponse) => void;
  setIsSaved: (val: boolean) => void;
  resetWizard: () => void;
}

export const ExploreContext = createContext<ExploreContextType | null>(null);

export const SESSION_KEY = "turismo_explore_state";

export const useExplore = () => {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error("useExplore must be used within an ExploreProvider");
  }
  return context;
};

export const initialFormData: ExploreFormData = {
  cityQuery: "",
  time: [180],
  budget: "",
  groupType: "solo",
  groupSize: "1",
  selectedCategories: [],
};

export const initialState: ExploreState = {
  formData: initialFormData,
  location: null,
  resolvedCity: "",
  places: null,
  selectedPlaces: [],
  routes: null,
  selectedRoutes: {},
  savedRequest: null,
  itinerary: null,
  isSaved: false,
};
