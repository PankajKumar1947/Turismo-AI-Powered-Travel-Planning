import { Router, type Response } from "express";
import { z } from "zod";
import { SavedItinerary } from "../models/itinerary.model";
import { authMiddleware, type AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// All itinerary routes require authentication
router.use(authMiddleware);

const saveSchema = z.object({
  city: z.string(),
  itinerary: z.any(),
  request: z.any(),
  places: z.array(z.any()).optional(),
});

// ── POST /api/itineraries ──
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    const saved = await SavedItinerary.create({
      userId: req.userId,
      city: parsed.data.city,
      itinerary: parsed.data.itinerary,
      request: parsed.data.request,
      places: parsed.data.places || [],
    });

    console.log(`💾 Itinerary saved for user ${req.userId} — city: ${parsed.data.city}`);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("Save itinerary error:", error);
    res.status(500).json({ error: "Failed to save itinerary" });
  }
});

// ── GET /api/itineraries ── (current user's itineraries)
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const itineraries = await SavedItinerary.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: itineraries });
  } catch (error) {
    console.error("Get itineraries error:", error);
    res.status(500).json({ error: "Failed to get itineraries" });
  }
});

// ── GET /api/itineraries/:id ── (single itinerary detail)
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const itinerary = await SavedItinerary.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!itinerary) {
      res.status(404).json({ error: "Itinerary not found" });
      return;
    }

    res.json({ success: true, data: itinerary });
  } catch (error) {
    console.error("Get itinerary error:", error);
    res.status(500).json({ error: "Failed to get itinerary" });
  }
});

// ── DELETE /api/itineraries/:id ──
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await SavedItinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!result) {
      res.status(404).json({ error: "Itinerary not found" });
      return;
    }

    console.log(`🗑️ Itinerary deleted: ${req.params.id}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete itinerary error:", error);
    res.status(500).json({ error: "Failed to delete itinerary" });
  }
});

export default router;
