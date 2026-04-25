import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMyItineraries, useDeleteItinerary } from "@/hooks/use-itineraries";
import type { SavedItinerary } from "@/interfaces/itinerary.interface";
import {
  Mail, Calendar, MapPin, Clock, Wallet,
  Trash2, ChevronRight, Loader2, Leaf, History,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if not auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const {
    data: itinerariesRes,
    isLoading: itinLoading,
  } = useMyItineraries(user?.id);

  const deleteItin = useDeleteItinerary();

  const itineraries = itinerariesRes?.data || [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--t-bg)" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--t-forest-500)" }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--t-bg)" }}>
      <div className="container mx-auto px-6 py-8 max-w-3xl">

        {/* Profile Card */}
        <Card className="t-card mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: "var(--t-gradient-primary)", boxShadow: "var(--t-shadow-glow)" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--t-stone-800)" }}>{user.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--t-stone-500)" }}>
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--t-stone-500)" }}>
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {user.preferences?.categories?.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--t-border)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--t-stone-400)" }}>Interests</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.preferences.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-full text-xs capitalize font-medium t-badge-nature"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="t-card p-4 text-center">
            <div className="text-2xl font-bold t-gradient-text">{itineraries.length}</div>
            <div className="text-xs mt-1" style={{ color: "var(--t-stone-500)" }}>Trips Planned</div>
          </div>
          <div className="t-card p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--t-amber-600)" }}>
              {itineraries.reduce((sum, it) => sum + (it.itinerary?.itinerary?.length || 0), 0)}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--t-stone-500)" }}>Places Visited</div>
          </div>
          <div className="t-card p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--t-sky-600)" }}>
              {new Set(itineraries.map((it) => it.city)).size}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--t-stone-500)" }}>Cities Explored</div>
          </div>
        </div>

        {/* History */}
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5" style={{ color: "var(--t-forest-600)" }} />
          <h3 className="text-xl font-bold" style={{ color: "var(--t-stone-800)" }}>Trip History</h3>
        </div>

        {itinLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "var(--t-forest-500)" }} />
            <p className="text-sm mt-2" style={{ color: "var(--t-stone-500)" }}>Loading your trips...</p>
          </div>
        ) : itineraries.length === 0 ? (
          <Card className="t-card">
            <CardContent className="py-12 text-center">
              <Leaf className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--t-sand-300)" }} />
              <p style={{ color: "var(--t-stone-500)" }}>No trips yet. Start exploring!</p>
              <Button
                className="mt-4 t-btn-primary"
                onClick={() => navigate("/explore")}
              >
                <MapPin className="w-4 h-4 mr-2" /> Explore Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {itineraries.map((it) => (
              <ItineraryHistoryCard
                key={it._id}
                itinerary={it}
                onView={() =>
                  navigate("/results", {
                    state: {
                      result: { places: it.places, itinerary: it.itinerary },
                      request: it.request,
                    },
                  })
                }
                onDelete={() => deleteItin.mutate(it._id)}
                isDeleting={deleteItin.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Itinerary History Card ──

function ItineraryHistoryCard({
  itinerary,
  onView,
  onDelete,
  isDeleting,
}: {
  itinerary: SavedItinerary;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="t-card p-4 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--t-forest-500)" }} />
            <h4 className="font-semibold truncate" style={{ color: "var(--t-stone-800)" }}>{itinerary.city}</h4>
          </div>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--t-stone-500)" }}>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(itinerary.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {itinerary.itinerary?.itinerary?.length || 0} stops
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              ~{itinerary.itinerary?.totalEstimatedCost?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {itinerary.itinerary?.totalEstimatedTime
                ? `${Math.floor(itinerary.itinerary.totalEstimatedTime / 60)}h ${itinerary.itinerary.totalEstimatedTime % 60}m`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-3">
          {confirmDelete ? (
            <>
              <Button size="sm" variant="destructive" onClick={onDelete} disabled={isDeleting} className="text-xs">
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} className="text-xs">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(true)} title="Delete" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" style={{ color: "var(--t-terra-500)" }} />
              </Button>
              <Button size="icon" variant="ghost" onClick={onView} title="View">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
