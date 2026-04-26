import { z } from "zod";

export const saveItinerarySchema = z.object({
  city: z.string(),
  itinerary: z.any(),
  request: z.any(),
  places: z.array(z.any()).optional(),
});

export type SaveItineraryDTO = z.infer<typeof saveItinerarySchema>;
