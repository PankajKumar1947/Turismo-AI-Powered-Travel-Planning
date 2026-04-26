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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useAuth } from "@/hooks/use-auth";
import {
  useFindPlaces,
  useFindRoutes,
  useAggregate,
  useGeocodeForward,
  useGeocodeReverse,
} from "@/hooks/use-recommendations";
import { useSaveItinerary } from "@/hooks/use-itineraries";
import { useEffect } from "react";
import PlaceCard from "@/components/place-card";
import RouteInfo from "@/components/route-info";
import {
  type ExploreFormData,
  type RecommendRequest,
  type GroupType,
} from "@/schemas/explore.schema";
import {
  type RouteOption,
  type PlaceRecommendation,
  type AggregatedResponse,
} from "@/interfaces/recommend.interface";
import type { GeocodeResult } from "@/interfaces/geocode.interface";
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

import { exploreSchema } from "@/schemas/explore.schema";

export default function ExplorePage() {
  const navigate = useNavigate();
  const { location, loading: geoLoading, requestLocation } = useGeolocation();
  const { isAuthenticated } = useAuth();

  const [resolvedCity, setResolvedCity] = useState("");
  const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExploreFormData>({
    resolver: zodResolver(exploreSchema),
    defaultValues: {
      cityQuery: "",
      time: [180],
      budget: "",
      groupType: "solo",
      groupSize: "1",
      selectedCategories: [],
    },
  });

  const cityQuery = watch("cityQuery");
  const time = watch("time");
  const groupType = watch("groupType");
  const selectedCategories = watch("selectedCategories");

  const [step, setStep] = useState<WizardStep>("input");
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [selectedRoutes, setSelectedRoutes] = useState<Record<string, string>>({});
  const [savedRequest, setSavedRequest] = useState<RecommendRequest | null>(null);

  const placesOp = useFindPlaces();
  const routesOp = useFindRoutes();
  const aggregateOp = useAggregate();
  const geocodeOp = useGeocodeForward();
  const geocodeReverseOp = useGeocodeReverse();
  const saveItinOp = useSaveItinerary();

  const effectiveLocation = location || manualLocation;
  const stepIndex = step === "input" ? 0 : step === "places" ? 1 : 2;

  // Auto-resolve city name when current location is fetched
  useEffect(() => {
    if (location) {
      geocodeReverseOp.mutate(location, {
        onSuccess: (result: { data: { cityName: string } }) => {
          setResolvedCity(result.data.cityName);
        },
      });
    }
  }, [location, geocodeReverseOp.mutate]);

  const handleCitySearch = useCallback(() => {
    if (!cityQuery.trim()) return;
    geocodeOp.mutate(cityQuery, {
      onSuccess: (result: { data: GeocodeResult }) => {
        if (result.data) {
          setManualLocation({ lat: result.data.lat, lng: result.data.lng });
          setResolvedCity(result.data.displayName);
        }
      },
    });
  }, [cityQuery, geocodeOp]);

  const onSubmit = (data: ExploreFormData) => {
    if (!effectiveLocation) return;
    const request: RecommendRequest = {
      location: effectiveLocation,
      cityName: resolvedCity || undefined,
      availableTimeMinutes: data.time[0]!,
      budgetINR: parseFloat(data.budget),
      groupType: data.groupType,
      groupSize: parseInt(data.groupSize) || 1,
      preferences: data.selectedCategories.length > 0 ? data.selectedCategories : undefined,
    };
    setSavedRequest(request);
    placesOp.mutate(request, {
      onSuccess: (result: { data: PlaceRecommendation[] }) => {
        const recommended = new Set(result.data.slice(0, 5).map((p: PlaceRecommendation) => p.name));
        setSelectedPlaces(recommended);
        setStep("places");
      },
    });
  };

  const handleFindRoutes = useCallback(() => {
    if (!effectiveLocation || !placesOp.data) return;
    const places = placesOp.data.data.filter((p: PlaceRecommendation) => selectedPlaces.has(p.name));
    routesOp.mutate(
      { origin: effectiveLocation, selectedPlaces: places.map((p: PlaceRecommendation) => ({ name: p.name, location: p.location })) },
      {
        onSuccess: (result: { data: Record<string, RouteOption[]> }) => {
          const autoSelected: Record<string, string> = {};
          for (const [placeName, routes] of Object.entries(result.data)) {
            const recommended = routes.find((r: RouteOption) => r.recommended);
            autoSelected[placeName] = recommended?.mode || routes[0]?.mode || "";
          }
          setSelectedRoutes(autoSelected);
          setStep("routes");
        },
      }
    );
  }, [effectiveLocation, placesOp.data, selectedPlaces, routesOp]);

  const handleAggregate = useCallback(() => {
    if (!savedRequest || !placesOp.data || !routesOp.data) return;
    const places = placesOp.data.data.filter((p: PlaceRecommendation) => selectedPlaces.has(p.name));
    const filteredRoutes: Record<string, RouteOption[]> = {};
    for (const [placeName, routes] of Object.entries(routesOp.data.data)) {
      const mode = selectedRoutes[placeName];
      if (mode) {
        const selected = routes.find((r: RouteOption) => r.mode === mode);
        filteredRoutes[placeName] = selected ? [selected] : routes;
      } else {
        filteredRoutes[placeName] = routes;
      }
    }
    aggregateOp.mutate(
      { places, routes: filteredRoutes, request: savedRequest },
      {
        onSuccess: (result: { data: AggregatedResponse }) => {
          // Auto-save if authenticated
          if (isAuthenticated) {
            saveItinOp.mutate({
              city: savedRequest.cityName || "Unknown City",
              itinerary: result.data,
              request: savedRequest,
              places,
            });
          }
          navigate("/results", { state: { result: { places, itinerary: result.data }, request: savedRequest } });
        },
      }
    );
  }, [savedRequest, placesOp.data, routesOp.data, selectedPlaces, selectedRoutes, aggregateOp, navigate, isAuthenticated, saveItinOp]);

  const togglePlace = (name: string) => {
    setSelectedPlaces((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setValue("selectedCategories", next);
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
    reset();
    placesOp.reset();
    routesOp.reset();
    aggregateOp.reset();
  };

  const currentError =
    placesOp.error?.message || routesOp.error?.message ||
    aggregateOp.error?.message || geocodeOp.error?.message || "";

  const isLoading = placesOp.isPending || routesOp.isPending || aggregateOp.isPending;

  return (
    <div className="min-h-screen" style={{ background: "var(--t-bg)" }}>
      {/* Step indicator bar */}
      <div className="container mx-auto px-6 pt-4 pb-2">
        <div className="flex items-center justify-center gap-1">
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

      <div className="container mx-auto px-6 py-12 max-w-6xl">

        {/* ═══ STEP 1: Input ═══ */}
        {step === "input" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: "var(--t-stone-800)" }}>
                Plan Your <span className="t-gradient-text">Adventure</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--t-stone-500)" }}>
                Set your constraints, and our AI-powered multi-agent system will craft your perfect journey.
              </p>
            </div>
 
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Location & Preferences */}
              <div className="lg:col-span-7 space-y-6">
                {/* Location */}
                <Card className="t-card h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" style={{ color: "var(--t-forest-500)" }} /> Location
                    </CardTitle>
                    <CardDescription>Where do you want to explore?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search a city (e.g., Kolkata, Paris, Tokyo)"
                        {...register("cityQuery")}
                        onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleCitySearch()}
                        className="flex-1"
                      />
                      <Button variant="secondary" onClick={handleCitySearch} disabled={geocodeOp.isPending}>
                        {geocodeOp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
                      <div className="p-3 rounded-xl bg-forest-50/50 border border-forest-100 space-y-1" style={{ color: "var(--t-forest-700)" }}>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <MapPin className="w-4 h-4 text-forest-500" />
                          {geocodeReverseOp.isPending ? (
                            <span className="flex items-center gap-2 italic font-normal opacity-60">
                              <Loader2 className="w-3 h-3 animate-spin" /> Resolving location...
                            </span>
                          ) : (
                            resolvedCity || "Location Selected"
                          )}
                        </div>
                        <div className="text-xs ml-6 flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5" />
                          {effectiveLocation.lat.toFixed(6)}, {effectiveLocation.lng.toFixed(6)}
                        </div>
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
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="px-4 py-2 rounded-xl text-sm capitalize transition-all font-semibold"
                          style={{
                            background: selectedCategories.includes(cat) ? "var(--t-forest-600)" : "var(--t-sand-50)",
                            color: selectedCategories.includes(cat) ? "white" : "var(--t-stone-600)",
                            border: `1px solid ${selectedCategories.includes(cat) ? "var(--t-forest-600)" : "var(--t-sand-200)"}`,
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Time, Budget, Group */}
              <div className="lg:col-span-5 space-y-6">
                {/* Time */}
                <Card className="t-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" style={{ color: "var(--t-sky-600)" }} /> Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: "var(--t-stone-500)" }}>Available duration?</span>
                      <Badge className="t-badge-nature text-base px-3 py-1 font-mono">{formatTime(time[0]!)}</Badge>
                    </div>
                    <Controller
                      name="time"
                      control={control}
                      render={({ field }) => (
                        <Slider value={field.value} onValueChange={field.onChange} min={30} max={4320} step={30} />
                      )}
                    />
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
                      <Input
                        type="number"
                        placeholder="e.g., 2000"
                        {...register("budget")}
                        className={`flex-1 ${errors.budget ? "border-terra-500" : ""}`}
                      />
                    </div>
                    {errors.budget && <p className="text-xs text-terra-600 mt-1">{errors.budget.message}</p>}
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
                          type="button"
                          onClick={() => {
                            setValue("groupType", gt.value);
                            if (gt.value === "solo") setValue("groupSize", "1");
                            if (gt.value === "couple") setValue("groupSize", "2");
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
                        <Input
                          type="number"
                          min="2"
                          max="50"
                          {...register("groupSize")}
                          className="w-24"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
 
            {currentError && (
              <div className="text-sm text-center rounded-xl p-3 mt-8" style={{ background: "var(--t-terra-50)", color: "var(--t-terra-700)", border: "1px solid var(--t-terra-200)" }}>
                {currentError}
              </div>
            )}
 
            <div className="mt-10 max-w-2xl mx-auto">
              <Button
                type="submit"
                size="lg"
                className="w-full text-xl py-8 rounded-2xl t-btn-primary shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                disabled={placesOp.isPending || !effectiveLocation}
              >
                {placesOp.isPending ? (
                  <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Discovery Specialist Agent is finding places...</>
                ) : (
                  <><Leaf className="w-6 h-6 mr-3" /> Start Discovery <ArrowRight className="w-6 h-6 ml-3" /></>
                )}
              </Button>
            </div>
          </form>
        )}


        {/* ═══ STEP 2: Select Places ═══ */}
        {step === "places" && placesOp.data && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-4">
              <div className="t-badge-nature inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                <Leaf className="w-3.5 h-3.5" /> Discovery Specialist Agent
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--t-stone-800)" }}>
                {placesOp.data.data.length} Places Found
              </h2>
              <p style={{ color: "var(--t-stone-500)" }}>
                Top 5 are pre-selected (agent's pick). Select the ones you'd like to visit.
              </p>
            </div>

            <div className="space-y-3">
              {placesOp.data.data.map((place: PlaceRecommendation, idx: number) => {
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
                disabled={routesOp.isPending || selectedPlaces.size === 0}
              >
                {routesOp.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finding routes...</>
                ) : (
                  <>Find Routes ({selectedPlaces.size}) <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Select Routes ═══ */}
        {step === "routes" && routesOp.data && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-4">
              <div className="t-badge-info inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3">
                <Navigation className="w-3.5 h-3.5" /> Logistics Expert Agent
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--t-stone-800)" }}>
                Route Options
              </h2>
              <p style={{ color: "var(--t-stone-500)" }}>
                Best routes are pre-selected. Pick your preferred transport for each place.
              </p>
            </div>

            {(Object.entries(routesOp.data.data) as [string, RouteOption[]][]).map(([placeName, routes]) => (
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
                className="flex-2 t-btn-primary"
                onClick={handleAggregate}
                disabled={aggregateOp.isPending}
              >
                {aggregateOp.isPending ? (
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
              {placesOp.isPending && "Discovery Specialist Agent is finding the best spots..."}
              {routesOp.isPending && "Logistics Expert Agent is mapping optimal routes..."}
              {aggregateOp.isPending && "Itinerary Curator Agent is finalizing your plan..."}
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
