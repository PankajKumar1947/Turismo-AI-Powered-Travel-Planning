import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { findPlaces } from "../agents/place-finder";
import { findRoutes } from "../agents/route-finder";
import { aggregateItinerary } from "../agents/aggregator";
import type { RouteOption, RecommendRequest } from "../types";

const router = Router();

// ── Validation schemas ──

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const recommendSchema = z.object({
  location: locationSchema,
  cityName: z.string().optional(),
  availableTimeMinutes: z.number().min(30).max(10080),
  budgetINR: z.number().min(0),
  groupType: z.enum(["solo", "couple", "family", "friends"]),
  groupSize: z.number().int().min(1).max(50),
  preferences: z.array(z.string()).optional(),
});

const routeSchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
  placeName: z.string().optional(),
});

const aggregateSchema = z.object({
  places: z.array(z.any()),
  routes: z.record(z.string(), z.array(z.any())),
  request: recommendSchema,
});

// ════════════════════════════════════════
// STEP 1: Get place recommendations
// ════════════════════════════════════════
router.post("/places", async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const parsed = recommendSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log("❌ Invalid request body:", JSON.stringify(parsed.error.flatten()));
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    const request: RecommendRequest = parsed.data;
    console.log("\n════════════════════════════════════════");
    console.log("🔍 [STEP 1] Agent-1: Place Finder");
    console.log("════════════════════════════════════════");
    console.log(`📍 Location: ${request.cityName || `${request.location.lat}, ${request.location.lng}`}`);
    console.log(`⏱️  Time: ${request.availableTimeMinutes} min | 💰 Budget: ${request.budgetINR}`);
    console.log(`👥 Group: ${request.groupType} (${request.groupSize}) | 🏷️ Prefs: ${request.preferences?.join(", ") || "none"}`);

    const places = await findPlaces(request);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Place Finder done in ${elapsed}s — found ${places.length} places`);
    places.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (score: ${p.score})`));

    res.json({ success: true, data: places });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ Place Finder failed after ${elapsed}s:`, error);
    res.status(500).json({
      error: "Failed to find places",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ════════════════════════════════════════
// STEP 2: Get routes for selected places
// ════════════════════════════════════════
router.post("/routes", async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const schema = z.object({
      origin: locationSchema,
      selectedPlaces: z.array(
        z.object({
          name: z.string(),
          location: locationSchema,
        })
      ),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    const { origin, selectedPlaces } = parsed.data;
    console.log("\n════════════════════════════════════════");
    console.log("🗺️  [STEP 2] Agent-2: Route Finder");
    console.log("════════════════════════════════════════");
    console.log(`📍 Origin: ${origin.lat}, ${origin.lng}`);
    console.log(`🎯 Selected places: ${selectedPlaces.map((p) => p.name).join(", ")}`);

    const routesMap: Record<string, RouteOption[]> = {};

    for (const place of selectedPlaces) {
      console.log(`   📍 Finding routes to: ${place.name}...`);
      const routeStart = Date.now();
      const placeRoutes = await findRoutes(origin, place.location, place.name);
      const routeTime = ((Date.now() - routeStart) / 1000).toFixed(1);
      routesMap[place.name] = placeRoutes;
      console.log(`   ✅ ${place.name}: ${placeRoutes.length} route options (${routeTime}s)`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Route Finder done in ${elapsed}s`);

    res.json({ success: true, data: routesMap });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ Route Finder failed after ${elapsed}s:`, error);
    res.status(500).json({
      error: "Failed to find routes",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ════════════════════════════════════════
// STEP 3: Aggregate into final itinerary
// ════════════════════════════════════════
router.post("/aggregate", async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const parsed = aggregateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    console.log("\n════════════════════════════════════════");
    console.log("📋 [STEP 3] Agent-3: Aggregator");
    console.log("════════════════════════════════════════");
    console.log(`🎯 Places: ${parsed.data.places.length} | Routes: ${Object.keys(parsed.data.routes).length}`);

    const routesMap = new Map<string, RouteOption[]>();
    for (const [key, value] of Object.entries(parsed.data.routes)) {
      routesMap.set(key, value as RouteOption[]);
    }

    const itinerary = await aggregateItinerary({
      places: parsed.data.places,
      routes: routesMap,
      request: parsed.data.request,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Aggregator done in ${elapsed}s — ${itinerary.itinerary.length} stops`);
    console.log(`   💰 Total cost: ${itinerary.totalEstimatedCost} | ⏱️ Total time: ${itinerary.totalEstimatedTime} min`);

    res.json({ success: true, data: itinerary });
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ Aggregator failed after ${elapsed}s:`, error);
    res.status(500).json({
      error: "Failed to build itinerary",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
