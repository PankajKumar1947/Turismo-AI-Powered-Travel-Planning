import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useGeolocation } from "@/hooks/use-geolocation";
import {
  useFindPlaces,
  useFindRoutes,
  useAggregate,
  useGeocodeForward,
} from "@/hooks/use-recommendations";
import PlaceCard from "@/components/place-card";
import RouteInfo from "@/components/route-info";
import type {
  GroupType,
  RecommendRequest,
  RouteOption,
} from "@/types";
import {
  MapPin, Clock, Wallet, Users, Search, Loader2,
  Navigation, ArrowLeft, ArrowRight, Sparkles,
  Check, RotateCcw, User, Heart, TreePine, Leaf,
} from "lucide-react";

const categories = [
  "heritage", "temple", "park", "museum", "market",
  "food", "waterfront", "art", "entertainment", "nature", "landmark",
];

const groupTypes: { value: GroupType; label: string; icon: React.ReactNode }[] = [
  { value: "solo", label: "Solo", icon: <User className="w-5 h-5" /> },
  { value: "couple", label: "Couple", icon: <Heart className="w-5 h-5" /> },
  { value: "family", label: "Family", icon: <Users className="w-5 h-5" /> },
  { value: "friends", label: "Friends", icon: <TreePine className="w-5 h-5" /> },
];

type WizardStep = "input" | "places" | "routes";

const stepLabels = ["Preferences", "Pick Places", "Pick Routes"];

export default function ExplorePage() {
  const navigate = useNavigate();
  const { location, loading: geoLoading, requestLocation } = useGeolocation();

  const [cityQuery, setCityQuery] = useState("");
  const [resolvedCity, setResolvedCity] = useState("");
  const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [time, setTime] = useState([180]);
  const [budget, setBudget] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("solo");
  const [groupSize, setGroupSize] = useState("1");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [step, setStep] = useState<WizardStep>("input");
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState<Record<string, string>>({});
  const [savedRequest, setSavedRequest] = useState<RecommendRequest | null>(null);

  const placesMutation = useFindPlaces();
  const routesMutation = useFindRoutes();
  const aggregateMutation = useAggregate();
  const geocodeMutation = useGeocodeForward();

  const effectiveLocation = location || manualLocation;
  const stepIndex = step === "input" ? 0 : step === "places" ? 1 : 2;

  const handleCitySearch = useCallback(() => {
    if (!cityQuery.trim()) return;
    geocodeMutation.mutate(cityQuery, {
      onSuccess: (result) => {
        if (result.data) {
          setManualLocation({ lat: result.data.lat, lng: result.data.lng });
          setResolvedCity(result.data.displayName);
        }
      },
    });
  }, [cityQuery, geocodeMutation]);

  const handleFindPlaces = useCallback(() => {
    if (!effectiveLocation || !budget) return;
    const request: RecommendRequest = {
      location: effectiveLocation,
      cityName: resolvedCity || undefined,
      availableTimeMinutes: time[0]!,
      budgetINR: parseFloat(budget),
      groupType,
      groupSize: parseInt(groupSize) || 1,
      preferences: selectedCategories.length > 0 ? selectedCategories : undefined,
    };
    setSavedRequest(request);
    placesMutation.mutate(request, {
      onSuccess: (result) => {
        const recommended = new Set(result.data.slice(0, 5).map((p) => p.name));
        setSelectedPlaces(recommended);
        setStep("places");
      },
    });
  }, [effectiveLocation, budget, resolvedCity, time, groupType, groupSize, selectedCategories, placesMutation]);

  const handleFindRoutes = useCallback(() => {
    if (!effectiveLocation || !placesMutation.data) return;
    const places = placesMutation.data.data.filter((p) => selectedPlaces.has(p.name));
    routesMutation.mutate(
      { origin: effectiveLocation, selectedPlaces: places.map((p) => ({ name: p.name, location: p.location })) },
      {
        onSuccess: (result) => {
          const autoSelected: Record<string, string> = {};
          for (const [placeName, routes] of Object.entries(result.data)) {
            const recommended = routes.find((r) => r.recommended);
            autoSelected[placeName] = recommended?.mode || routes[0]?.mode || "";
          }
          setSelectedRoutes(autoSelected);
          setStep("routes");
        },
      }
    );
  }, [effectiveLocation, placesMutation.data, selectedPlaces, routesMutation]);

  const handleAggregate = useCallback(() => {
    if (!savedRequest || !placesMutation.data || !routesMutation.data) return;
    const places = placesMutation.data.data.filter((p) => selectedPlaces.has(p.name));
    const filteredRoutes: Record<string, RouteOption[]> = {};
    for (const [placeName, routes] of Object.entries(routesMutation.data.data)) {
      const mode = selectedRoutes[placeName];
      if (mode) {
        const selected = routes.find((r) => r.mode === mode);
        filteredRoutes[placeName] = selected ? [selected] : routes;
      } else {
        filteredRoutes[placeName] = routes;
      }
    }
    aggregateMutation.mutate(
      { places, routes: filteredRoutes, request: savedRequest },
      { onSuccess: (result) => navigate("/results", { state: { result: { places, itinerary: result.data }, request: savedRequest } }) }
    );
  }, [savedRequest, placesMutation.data, routesMutation.data, selectedPlaces, selectedRoutes, aggregateMutation, navigate]);

  const togglePlace = (name: string) => {
    setSelectedPlaces((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes >= 1440) return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const resetWizard = () => {
    setStep("input");
    setSelectedPlaces(new Set());
    setSelectedRoutes({});
    placesMutation.reset();
    routesMutation.reset();
    aggregateMutation.reset();
  };

  const currentError =
    placesMutation.error?.message || routesMutation.error?.message ||
    aggregateMutation.error?.message || geocodeMutation.error?.message || "";

  const isLoading = placesMutation.isPending || routesMutation.isPending || aggregateMutation.isPending;

  return (
    <div className="min-h-screen" style={{ background: "var(--t-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-lg"
        style={{ background: "rgba(250, 248, 245, 0.85)", borderBottom: "1px solid var(--t-border)" }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5" style={{ color: "var(--t-forest-500)" }} />
              <span className="text-xl font-bold t-gradient-text">Turismo</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                {i > 0 && <div className="w-8 h-px mx-1" style={{ background: i <= stepIndex ? "var(--t-forest-300)" : "var(--t-sand-300)" }} />}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: i === stepIndex ? "var(--t-forest-600)" : i < stepIndex ? "var(--t-forest-50)" : "var(--t-sand-100)",
                    color: i === stepIndex ? "white" : i < stepIndex ? "var(--t-forest-700)" : "var(--t-stone-400)",
                  }}
                >
                  {i < stepIndex ? <Check className="w-3 h-3" /> : null}
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl">

        {/* ═══ STEP 1: Input ═══ */}
        {step === "input" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--t-stone-800)" }}>
                Plan Your Adventure
              </h2>
              <p style={{ color: "var(--t-stone-500)" }}>
                Set your constraints, our AI agents will guide you step by step.
              </p>
            </div>

            {/* Location */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: "var(--t-forest-500)" }} /> Location
                </CardTitle>
                <CardDescription>Where do you want to explore?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search a city (e.g., Kolkata, Paris, Tokyo)"
                    value={cityQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCityQuery(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleCitySearch()}
                    className="flex-1"
                  />
                  <Button variant="secondary" onClick={handleCitySearch} disabled={geocodeMutation.isPending}>
                    {geocodeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: "var(--t-border)" }} />
                  <span className="text-xs" style={{ color: "var(--t-stone-400)" }}>or</span>
                  <div className="h-px flex-1" style={{ background: "var(--t-border)" }} />
                </div>
                <Button variant="outline" className="w-full" onClick={requestLocation} disabled={geoLoading}>
                  {geoLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                  Use My Current Location
                </Button>
                {effectiveLocation && (
                  <div className="text-sm flex items-center gap-1" style={{ color: "var(--t-forest-600)" }}>
                    <MapPin className="w-3 h-3" />
                    {resolvedCity || `${effectiveLocation.lat.toFixed(4)}, ${effectiveLocation.lng.toFixed(4)}`}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: "var(--t-sky-600)" }} /> Available Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--t-stone-500)" }}>How much time do you have?</span>
                  <Badge className="t-badge-nature text-base px-3 py-1 font-mono">{formatTime(time[0]!)}</Badge>
                </div>
                <Slider value={time} onValueChange={setTime} min={30} max={4320} step={30} />
                <div className="flex justify-between text-xs" style={{ color: "var(--t-stone-400)" }}>
                  <span>30 min</span><span>3 days</span>
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5" style={{ color: "var(--t-amber-600)" }} /> Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 items-center">
                  <Label style={{ color: "var(--t-stone-500)" }} className="whitespace-nowrap">Total budget</Label>
                  <Input type="number" placeholder="e.g., 2000" value={budget} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudget(e.target.value)} className="flex-1" />
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--t-stone-400)" }}>Enter in local currency (INR, USD, EUR, etc.)</p>
              </CardContent>
            </Card>

            {/* Group */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: "var(--t-terra-500)" }} /> Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {groupTypes.map((gt) => (
                    <button
                      key={gt.value}
                      onClick={() => {
                        setGroupType(gt.value);
                        if (gt.value === "solo") setGroupSize("1");
                        if (gt.value === "couple") setGroupSize("2");
                      }}
                      className="p-3 rounded-xl border text-center transition-all"
                      style={{
                        borderColor: groupType === gt.value ? "var(--t-forest-400)" : "var(--t-border)",
                        background: groupType === gt.value ? "var(--t-forest-50)" : "transparent",
                        color: groupType === gt.value ? "var(--t-forest-700)" : "var(--t-stone-600)",
                      }}
                    >
                      <div className="flex justify-center mb-1">{gt.icon}</div>
                      <div className="text-xs font-medium">{gt.label}</div>
                    </button>
                  ))}
                </div>
                {(groupType === "family" || groupType === "friends") && (
                  <div className="flex gap-3 items-center">
                    <Label style={{ color: "var(--t-stone-500)" }} className="whitespace-nowrap">Group size</Label>
                    <Input type="number" min="2" max="50" value={groupSize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupSize(e.target.value)} className="w-24" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: "var(--t-amber-500)" }} /> Preferences
                  <span className="text-xs font-normal" style={{ color: "var(--t-stone-400)" }}>(optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="px-3 py-1.5 rounded-full text-sm capitalize transition-all font-medium"
                      style={{
                        background: selectedCategories.includes(cat) ? "var(--t-forest-600)" : "var(--t-sand-100)",
                        color: selectedCategories.includes(cat) ? "white" : "var(--t-stone-600)",
                        border: `1px solid ${selectedCategories.includes(cat) ? "var(--t-forest-600)" : "var(--t-sand-300)"}`,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {currentError && (
              <div className="text-sm text-center rounded-xl p-3" style={{ background: "var(--t-terra-50)", color: "var(--t-terra-700)", border: "1px solid var(--t-terra-200)" }}>
                {currentError}
              </div>
            )}

            <Button
              size="lg"
              className="w-full text-lg py-6 rounded-xl t-btn-primary disabled:opacity-50"
              onClick={handleFindPlaces}
              disabled={placesMutation.isPending || !effectiveLocation || !budget}
            >
              {placesMutation.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Agent-1 is discovering places...</>
              ) : (
                <><Leaf className="w-5 h-5 mr-2" /> Discover Places <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </div>
        )}

        {/* ═══ STEP 2: Select Places ═══ */}
        {step === "places" && placesMutation.data && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-4">
              <div className="t-badge-nature inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                <Leaf className="w-3.5 h-3.5" /> Agent-1 Response
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--t-stone-800)" }}>
                {placesMutation.data.data.length} Places Found
              </h2>
              <p style={{ color: "var(--t-stone-500)" }}>
                Top 5 are pre-selected (agent's pick). Select the ones you'd like to visit.
              </p>
            </div>

            <div className="space-y-3">
              {placesMutation.data.data.map((place, idx) => {
                const isSelected = selectedPlaces.has(place.name);
                const isAgentPick = idx < 5;
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
              <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                className="flex-[2] t-btn-primary"
                onClick={handleFindRoutes}
                disabled={routesMutation.isPending || selectedPlaces.size === 0}
              >
                {routesMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finding routes...</>
                ) : (
                  <>Find Routes ({selectedPlaces.size}) <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Select Routes ═══ */}
        {step === "routes" && routesMutation.data && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-4">
              <div className="t-badge-info inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                <Navigation className="w-3.5 h-3.5" /> Agent-2 Response
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--t-stone-800)" }}>
                Route Options
              </h2>
              <p style={{ color: "var(--t-stone-500)" }}>
                Best routes are pre-selected. Pick your preferred transport for each place.
              </p>
            </div>

            {Object.entries(routesMutation.data.data).map(([placeName, routes]) => (
              <div key={placeName} className="t-card p-5">
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--t-stone-800)" }}>
                  <MapPin className="w-4 h-4" style={{ color: "var(--t-forest-500)" }} /> {placeName}
                </h4>
                <div className="space-y-2">
                  {(routes as RouteOption[]).map((route) => {
                    const isSelected = selectedRoutes[placeName] === route.mode;
                    return (
                      <div
                        key={route.mode}
                        onClick={() => setSelectedRoutes((prev) => ({ ...prev, [placeName]: route.mode }))}
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
              <Button variant="outline" onClick={() => setStep("places")} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                className="flex-[2] t-btn-primary"
                onClick={handleAggregate}
                disabled={aggregateMutation.isPending}
              >
                {aggregateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building itinerary...</>
                ) : (
                  <>Build My Itinerary <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: "var(--t-forest-500)" }} />
              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: "var(--t-amber-500)", animationDelay: "0.15s" }} />
              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: "var(--t-sky-500)", animationDelay: "0.3s" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--t-stone-500)" }}>
              {placesMutation.isPending && "Agent-1 is discovering the best places..."}
              {routesMutation.isPending && "Agent-2 is calculating optimal routes..."}
              {aggregateMutation.isPending && "Agent-3 is crafting your perfect itinerary..."}
            </p>
          </div>
        )}

        {step !== "input" && (
          <div className="text-center mt-6">
            <Button variant="ghost" size="sm" onClick={resetWizard} style={{ color: "var(--t-stone-400)" }}>
              <RotateCcw className="w-4 h-4 mr-2" /> Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
