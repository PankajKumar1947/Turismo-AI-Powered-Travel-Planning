import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { SavedItinerary } from "../models/itinerary.model";

const router = Router();

const saveSchema = z.object({
  userId: z.string(),
  city: z.string(),
  itinerary: z.any(),
});

// ── POST /api/itineraries ──
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    const saved = await SavedItinerary.create(parsed.data);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("Save itinerary error:", error);
    res.status(500).json({ error: "Failed to save itinerary" });
  }
});

// ── GET /api/itineraries/:userId ──
router.get("/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const itineraries = await SavedItinerary.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: itineraries });
  } catch (error) {
    console.error("Get itineraries error:", error);
    res.status(500).json({ error: "Failed to get itineraries" });
  }
});

// ── DELETE /api/itineraries/:id ──
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await SavedItinerary.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete itinerary error:", error);
    res.status(500).json({ error: "Failed to delete itinerary" });
  }
});

export default router;
