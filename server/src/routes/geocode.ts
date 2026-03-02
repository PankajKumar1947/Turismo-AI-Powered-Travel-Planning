import { Router, type Request, type Response } from "express";
import { forwardGeocode, reverseGeocode } from "../services/osrm.service";
import { z } from "zod";

const router = Router();

// ── POST /api/geocode/forward ──
// Convert city name → coordinates
router.post("/forward", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = z.object({ query: z.string().min(1) }).parse(req.body);
    const result = await forwardGeocode(query);

    if (!result) {
      res.status(404).json({ error: "Location not found" });
      return;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ error: "Invalid request" });
  }
});

// ── POST /api/geocode/reverse ──
// Convert coordinates → city name
router.post("/reverse", async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng } = z
      .object({ lat: z.number(), lng: z.number() })
      .parse(req.body);
    const cityName = await reverseGeocode(lat, lng);

    res.json({ success: true, data: { cityName } });
  } catch (error) {
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
