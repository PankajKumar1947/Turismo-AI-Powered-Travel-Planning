import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PlaceCard from "@/components/place-card";
import ItineraryTimeline from "@/components/itinerary-timeline";
import MapView from "@/components/map-view";
import type { PlaceRecommendation, AggregatedResponse, RecommendRequest } from "@/types";
import {
  Clock, Wallet, MapPin, Lightbulb,
  List, Map as MapIcon,
} from "lucide-react";
import { useState } from "react";

interface ResultsState {
  result: {
    places: PlaceRecommendation[];
    itinerary: AggregatedResponse;
  };
  request: RecommendRequest;
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;
  const [viewMode, setViewMode] = useState<"itinerary" | "all-places">("itinerary");

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--t-bg)" }}>
        <div className="text-center space-y-4">
          <p style={{ color: "var(--t-stone-500)" }}>No results to show.</p>
          <Button onClick={() => navigate("/explore")} className="t-btn-primary">
            <MapPin className="w-4 h-4 mr-2" /> Go to Explore
          </Button>
        </div>
      </div>
    );
  }

  const { result, request } = state;
  const { itinerary, places } = result;

  const mapMarkers = viewMode === "itinerary"
    ? itinerary.itinerary.map((item) => ({
      lat: item.place.location.lat,
      lng: item.place.location.lng,
      name: item.place.name,
      order: item.order,
    }))
    : places.map((p, i) => ({
      lat: p.location.lat,
      lng: p.location.lng,
      name: p.name,
      order: i + 1,
    }));

  return (
    <div className="min-h-screen" style={{ background: "var(--t-bg)" }}>
      {/* View mode toggle */}
      <div className="container mx-auto px-6 pt-4 pb-2 flex justify-center gap-2">
        <Button
          variant={viewMode === "itinerary" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("itinerary")}
          style={viewMode === "itinerary" ? { background: "var(--t-forest-600)" } : {}}
        >
          <List className="w-4 h-4 mr-1" /> Itinerary
        </Button>
        <Button
          variant={viewMode === "all-places" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("all-places")}
          style={viewMode === "all-places" ? { background: "var(--t-forest-600)" } : {}}
        >
          <MapIcon className="w-4 h-4 mr-1" /> All Places
        </Button>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Summary */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: "var(--t-gradient-hero)", border: "1px solid var(--t-forest-200)" }}
        >
          <p className="text-lg leading-relaxed" style={{ color: "var(--t-stone-700)" }}>
            {itinerary.summary}
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" style={{ color: "var(--t-sky-600)" }} />
              <span className="font-medium">
                {itinerary.totalEstimatedTime >= 60
                  ? `${Math.floor(itinerary.totalEstimatedTime / 60)}h ${itinerary.totalEstimatedTime % 60}m`
                  : `${itinerary.totalEstimatedTime}m`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4" style={{ color: "var(--t-amber-600)" }} />
              <span className="font-medium">~{itinerary.totalEstimatedCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" style={{ color: "var(--t-forest-600)" }} />
              <span className="font-medium">{itinerary.itinerary.length} stops</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ height: "350px", border: "1px solid var(--t-border)" }}>
          <MapView center={request.location} markers={mapMarkers} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            {viewMode === "itinerary" ? (
              <ItineraryTimeline items={itinerary.itinerary} />
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold" style={{ color: "var(--t-stone-800)" }}>All Recommended Places</h3>
                <div className="space-y-4">
                  {places.map((place) => (
                    <div key={place.name} className="t-card p-4">
                      <PlaceCard place={place} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {itinerary.budgetBreakdown && itinerary.budgetBreakdown.length > 0 && (
              <div className="t-card p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--t-stone-800)" }}>
                  <Wallet className="w-4 h-4" style={{ color: "var(--t-amber-500)" }} /> Budget Breakdown
                </h3>
                <div className="space-y-2">
                  {itinerary.budgetBreakdown.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: "var(--t-stone-500)" }}>{item.category}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--t-stone-700)" }}>{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-semibold" style={{ color: "var(--t-stone-800)" }}>
                    <span>Total</span>
                    <span>{itinerary.totalEstimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="t-card p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--t-stone-800)" }}>
                  <Lightbulb className="w-4 h-4" style={{ color: "var(--t-amber-500)" }} /> Local Tips
                </h3>
                <ul className="space-y-2">
                  {itinerary.tips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: "var(--t-stone-500)" }}>
                      <span style={{ color: "var(--t-forest-500)" }} className="font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
