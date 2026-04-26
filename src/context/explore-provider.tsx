import type { ReactNode } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { ExploreFormData, RecommendRequest } from "@/schemas/explore.schema";
import type { AggregatedResponse, PlaceRecommendation, RouteOption } from "@/interfaces/recommend.interface";
import { ExploreContext, initialState, SESSION_KEY } from "./explore.context";
import type { ExploreState } from "./explore.context";

export function ExploreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExploreState>(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...initialState, ...parsed };
      } catch (e) {
        console.error("Failed to parse explore state from sessionStorage", e);
      }
    }
    return initialState;
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  const setFormData = useCallback((formData: ExploreFormData) =>
    setState(s => ({ ...s, formData })), []);

  const setLocation = useCallback((location: { lat: number; lng: number } | null) =>
    setState(s => ({ ...s, location })), []);

  const setResolvedCity = useCallback((resolvedCity: string) =>
    setState(s => ({ ...s, resolvedCity })), []);

  const setPlaces = useCallback((places: PlaceRecommendation[]) =>
    setState(s => ({ ...s, places })), []);

  const setSelectedPlaces = useCallback((selectedPlaces: string[]) =>
    setState(s => ({ ...s, selectedPlaces })), []);

  const setRoutes = useCallback((routes: Record<string, RouteOption[]>) =>
    setState(s => ({ ...s, routes })), []);

  const setSelectedRoutes = useCallback((selectedRoutes: Record<string, string>) =>
    setState(s => ({ ...s, selectedRoutes })), []);

  const setSavedRequest = useCallback((savedRequest: RecommendRequest) =>
    setState(s => ({ ...s, savedRequest })), []);

  const setItinerary = useCallback((itinerary: AggregatedResponse) =>
    setState(s => ({ ...s, itinerary })), []);

  const setIsSaved = useCallback((isSaved: boolean) => 
    setState(s => ({ ...s, isSaved })), []);

  const resetWizard = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(() => ({
    ...state,
    setFormData,
    setLocation,
    setResolvedCity,
    setPlaces,
    setSelectedPlaces,
    setRoutes,
    setSelectedRoutes,
    setSavedRequest,
    setItinerary,
    setIsSaved,
    resetWizard,
  }), [
    state,
    setFormData,
    setLocation,
    setResolvedCity,
    setPlaces,
    setSelectedPlaces,
    setRoutes,
    setSelectedRoutes,
    setSavedRequest,
    setItinerary,
    setIsSaved,
    resetWizard
  ]);

  return (
    <ExploreContext.Provider value={value}>
      {children}
    </ExploreContext.Provider>
  );
}
