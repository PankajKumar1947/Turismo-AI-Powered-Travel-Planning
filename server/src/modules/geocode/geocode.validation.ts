import { z } from "zod";

export const forwardGeocodeSchema = z.object({
  query: z.string().min(1),
});

export const reverseGeocodeSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type ForwardGeocodeDTO = z.infer<typeof forwardGeocodeSchema>;
export type ReverseGeocodeDTO = z.infer<typeof reverseGeocodeSchema>;
