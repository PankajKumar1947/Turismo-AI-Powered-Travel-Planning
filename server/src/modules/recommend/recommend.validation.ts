import { z } from "zod";

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const recommendSchema = z.object({
  location: locationSchema,
  cityName: z.string().optional(),
  availableTimeMinutes: z.number().min(30).max(10080),
  budgetINR: z.number().min(0),
  groupType: z.enum(["solo", "couple", "family", "friends"]),
  groupSize: z.number().int().min(1).max(50),
  preferences: z.array(z.string()).optional(),
});

export const aggregateSchema = z.object({
  places: z.array(z.any()),
  routes: z.record(z.string(), z.array(z.any())),
  request: recommendSchema,
});

export const findRoutesSchema = z.object({
  origin: locationSchema,
  selectedPlaces: z.array(
    z.object({
      name: z.string(),
      location: locationSchema,
    })
  ),
});

export type RecommendDTO = z.infer<typeof recommendSchema>;
export type AggregateDTO = z.infer<typeof aggregateSchema>;
