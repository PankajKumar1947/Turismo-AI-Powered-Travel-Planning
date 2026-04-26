import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAggregate } from "@/hooks/use-recommendations";
import { useSaveItinerary } from "@/hooks/use-itineraries";
import { useAuth } from "@/hooks/use-auth";
import RouteInfo from "@/components/route-info";
import type {
  RouteOption,
  AggregatedResponse,
} from "@/interfaces/recommend.interface";
import {
  MapPin, Navigation, ArrowLeft, ArrowRight, Sparkles, Check,
} from "lucide-react";
import { useExplore } from "@/context/explore.context";
import { AgentLoadingDialog } from "@/components/agent-loading-dialog";

export default function RoutesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    places, selectedPlaces,
    routes,
    selectedRoutes, setSelectedRoutes,
    savedRequest,
    setItinerary,
    setIsSaved,
  } = useExplore();

  const aggregateOp = useAggregate();
  const saveItinOp = useSaveItinerary();

  const handleAggregate = useCallback(() => {
    if (!savedRequest || !places || !routes) return;
    const selected = places.filter((p) => selectedPlaces.includes(p.name));

    const filteredRoutes: Record<string, RouteOption[]> = {};
    for (const [placeName, rts] of Object.entries(routes)) {
      const mode = selectedRoutes[placeName];
      if (mode) {
        const sel = rts.find((r: RouteOption) => r.mode === mode);
        filteredRoutes[placeName] = sel ? [sel] : rts;
      } else {
        filteredRoutes[placeName] = rts;
      }
    }

    aggregateOp.mutate(
      { places: selected, routes: filteredRoutes, request: savedRequest },
      {
        onSuccess: (result: { data: AggregatedResponse }) => {
          setItinerary(result.data);
          if (isAuthenticated) {
            saveItinOp.mutate({
              city: savedRequest.cityName || "Unknown City",
              itinerary: result.data,
              request: savedRequest,
              places: selected,
            }, {
              onSuccess: () => {
                setIsSaved(true);
              }
            });
          }
          navigate("/results", { state: { result: { places: selected, itinerary: result.data }, request: savedRequest } });
        },
      }
    );
  }, [savedRequest, places, routes, selectedPlaces, selectedRoutes, aggregateOp, navigate, isAuthenticated, saveItinOp]);

  if (!routes) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">No routes found.</h2>
        <Button onClick={() => navigate("/explore/places")}>Go Back</Button>
      </div>
    );
  }

  const currentError = aggregateOp.error?.message || "";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <AgentLoadingDialog isOpen={aggregateOp.isPending} agentName="Aggregator Agent" />
      <div className="text-center mb-4">
        <div className="t-badge-info inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
          <Navigation className="w-3.5 h-3.5" /> Route Finder Agent
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--t-stone-800)" }}>
          Route Options
        </h2>
        <p style={{ color: "var(--t-stone-500)" }}>
          Best routes are pre-selected. Pick your preferred transport for each place.
        </p>
      </div>

      {(Object.entries(routes) as [string, RouteOption[]][]).map(([placeName, rts]) => (
        <div key={placeName} className="t-card p-5">
          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--t-stone-800)" }}>
            <MapPin className="w-4 h-4" style={{ color: "var(--t-forest-500)" }} /> {placeName}
          </h4>
          <div className="space-y-2">
            {rts.map((route) => {
              const isSelected = selectedRoutes[placeName] === route.mode;
              return (
                <div
                  key={route.mode}
                  onClick={() => setSelectedRoutes({ ...selectedRoutes, [placeName]: route.mode })}
                  className="cursor-pointer rounded-xl p-3 transition-all"
                  style={{
                    border: `2px solid ${isSelected ? "var(--t-sky-400)" : "transparent"}`,
                    background: isSelected ? "var(--t-sky-50)" : "var(--t-sand-50)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{
                        borderColor: isSelected ? "var(--t-sky-500)" : "var(--t-sand-300)",
                        background: isSelected ? "var(--t-sky-500)" : "transparent",
                        color: isSelected ? "white" : "transparent",
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <RouteInfo route={route} />
                    </div>
                    {route.recommended && (
                      <span className="t-badge-warm inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Sparkles className="w-3 h-3" /> Best
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {currentError && (
        <div className="text-sm text-center rounded-xl p-3" style={{ background: "var(--t-terra-50)", color: "var(--t-terra-700)", border: "1px solid var(--t-terra-200)" }}>
          {currentError}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/explore/places")} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          className="flex-2 t-btn-primary"
          onClick={handleAggregate}
          disabled={aggregateOp.isPending}
        >
          {aggregateOp.isPending ? (
            "Aggregator Agent is building itinerary..."
          ) : (
            <>Build My Itinerary <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
