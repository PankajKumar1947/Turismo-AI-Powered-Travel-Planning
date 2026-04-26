import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFindRoutes } from "@/hooks/use-recommendations";
import PlaceCard from "@/components/place-card";
import type {
  PlaceRecommendation,
  RouteOption,
} from "@/interfaces/recommend.interface";
import {
  ArrowLeft, ArrowRight, Sparkles, Check, Leaf,
} from "lucide-react";
import { useExplore } from "@/context/explore.context";
import { AgentLoadingDialog } from "@/components/agent-loading-dialog";

export default function PlacesPage() {
  const navigate = useNavigate();
  const { 
    places, 
    selectedPlaces, setSelectedPlaces,
    location,
    setRoutes, setSelectedRoutes
  } = useExplore();

  const routesOp = useFindRoutes();

  const togglePlace = (name: string) => {
    const next = selectedPlaces.includes(name)
      ? selectedPlaces.filter((n) => n !== name)
      : [...selectedPlaces, name];
    setSelectedPlaces(next);
  };

  const handleFindRoutes = useCallback(() => {
    if (!location || !places) return;
    const selected = places.filter((p) => selectedPlaces.includes(p.name));
    routesOp.mutate(
      { 
        origin: location, 
        selectedPlaces: selected.map((p) => ({ name: p.name, location: p.location })) 
      },
      {
        onSuccess: (result: { data: Record<string, RouteOption[]> }) => {
          const autoSelected: Record<string, string> = {};
          for (const [placeName, routes] of Object.entries(result.data)) {
            const recommended = routes.find((r: RouteOption) => r.recommended);
            autoSelected[placeName] = recommended?.mode || routes[0]?.mode || "";
          }
          setRoutes(result.data);
          setSelectedRoutes(autoSelected);
          navigate("/explore/routes");
        },
      }
    );
  }, [location, places, selectedPlaces, routesOp, navigate, setRoutes, setSelectedRoutes]);

  if (!places) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">No places found.</h2>
        <Button onClick={() => navigate("/explore/preferences")}>Go Back</Button>
      </div>
    );
  }

  const currentError = routesOp.error?.message || "";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <AgentLoadingDialog isOpen={routesOp.isPending} agentName="Logistics Expert" />
      <div className="text-center mb-4">
        <div className="t-badge-nature inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
          <Leaf className="w-3.5 h-3.5" /> Discovery Specialist Agent
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--t-stone-800)" }}>
          {places.length} Places Found
        </h2>
        <p style={{ color: "var(--t-stone-500)" }}>
          Top 2 are pre-selected (agent's pick). Select the ones you'd like to visit.
        </p>
      </div>

      <div className="space-y-3">
        {places.map((place: PlaceRecommendation, idx: number) => {
          const isSelected = selectedPlaces.includes(place.name);
          const isAgentPick = idx < 2;
          return (
            <div
              key={place.name}
              onClick={() => togglePlace(place.name)}
              className={`cursor-pointer rounded-2xl transition-all ${isSelected ? "t-card-selected" : "t-card"}`}
            >
              <div className="flex items-start gap-3 p-3">
                <div
                  className="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor: isSelected ? "var(--t-forest-500)" : "var(--t-sand-300)",
                    background: isSelected ? "var(--t-forest-500)" : "transparent",
                    color: isSelected ? "white" : "transparent",
                  }}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <PlaceCard place={place} index={idx + 1} />
                  {isAgentPick && isSelected && (
                    <div className="mt-2">
                      <span className="t-badge-warm inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium">
                        <Sparkles className="w-3 h-3" /> Agent recommended
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {currentError && (
        <div className="text-sm text-center rounded-xl p-3" style={{ background: "var(--t-terra-50)", color: "var(--t-terra-700)", border: "1px solid var(--t-terra-200)" }}>
          {currentError}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/explore/preferences")} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          className="flex-[2] t-btn-primary"
          onClick={handleFindRoutes}
          disabled={routesOp.isPending || selectedPlaces.length === 0}
        >
          {routesOp.isPending ? (
            "Agent is finding routes..."
          ) : (
            <>Find Routes ({selectedPlaces.length}) <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
