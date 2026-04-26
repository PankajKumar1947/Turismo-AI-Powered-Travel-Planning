import { useCallback, useEffect } from "react";
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
import {
  useFindPlaces,
  useGeocodeForward,
  useGeocodeReverse,
} from "@/hooks/use-recommendations";
import {
  type ExploreFormData,
  type RecommendRequest,
  type GroupType,
  exploreSchema,
} from "@/schemas/explore.schema";
import type {
  GeocodeResult,
} from "@/interfaces/geocode.interface";
import type {
  PlaceRecommendation,
} from "@/interfaces/recommend.interface";
import {
  MapPin, Clock, Wallet, Users, Search, Loader2,
  Navigation, ArrowRight, Sparkles, Leaf, Heart, TreePine, User,
} from "lucide-react";
import { useExplore } from "@/context/explore.context";
import { AgentLoadingDialog } from "@/components/agent-loading-dialog";

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

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { location: geoLoc, loading: geoLoading, requestLocation } = useGeolocation();
  const {
    formData, setFormData,
    location: storedLocation, setLocation,
    resolvedCity, setResolvedCity,
    setPlaces, setSelectedPlaces, setSavedRequest
  } = useExplore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExploreFormData>({
    resolver: zodResolver(exploreSchema),
    defaultValues: formData,
  });

  const cityQuery = watch("cityQuery");
  const time = watch("time");
  const groupType = watch("groupType");
  const selectedCategories = watch("selectedCategories");

  const placesOp = useFindPlaces();
  const geocodeOp = useGeocodeForward();
  const geocodeReverseOp = useGeocodeReverse();

  const effectiveLocation = geoLoc || storedLocation;

  // Auto-resolve city name when current location is fetched
  useEffect(() => {
    if (geoLoc && (!storedLocation || geoLoc.lat !== storedLocation.lat || geoLoc.lng !== storedLocation.lng)) {
      setLocation(geoLoc);
      geocodeReverseOp.mutate(geoLoc, {
        onSuccess: (result: { data: { cityName: string } }) => {
          setResolvedCity(result.data.cityName);
        },
      });
    }
  }, [geoLoc, storedLocation, geocodeReverseOp, setLocation, setResolvedCity]);

  const handleCitySearch = useCallback(() => {
    if (!cityQuery.trim()) return;
    geocodeOp.mutate(cityQuery, {
      onSuccess: (result: { data: GeocodeResult }) => {
        if (result.data) {
          const loc = { lat: result.data.lat, lng: result.data.lng };
          setLocation(loc);
          setResolvedCity(result.data.displayName);
        }
      },
    });
  }, [cityQuery, geocodeOp, setLocation, setResolvedCity]);

  const onSubmit = (data: ExploreFormData) => {
    if (!effectiveLocation) return;
    setFormData(data);

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
        setPlaces(result.data);
        const recommended = result.data.slice(0, 2).map((p: PlaceRecommendation) => p.name);
        setSelectedPlaces(recommended);
        navigate("/explore/places");
      },
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

  const currentError = placesOp.error?.message || geocodeOp.error?.message || "";

  return (
    <>
      <AgentLoadingDialog isOpen={placesOp.isPending} agentName="Discovery Specialist" />
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
                  <Button variant="secondary" onClick={handleCitySearch} disabled={geocodeOp.isPending} type="button">
                    {geocodeOp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: "var(--t-border)" }} />
                  <span className="text-xs" style={{ color: "var(--t-stone-400)" }}>or</span>
                  <div className="h-px flex-1" style={{ background: "var(--t-border)" }} />
                </div>
                <Button variant="outline" className="w-full" onClick={requestLocation} disabled={geoLoading} type="button">
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
              "Agent is finding places..."
            ) : (
              <><Leaf className="w-6 h-6 mr-3" /> Start Discovery <ArrowRight className="w-6 h-6 ml-3" /></>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
