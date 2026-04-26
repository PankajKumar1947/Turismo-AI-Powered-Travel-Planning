import type { Response } from "express";
import { ItineraryService } from "./itinerary.service";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

export class ItineraryController {
  static save = asyncHandler(async (req: AuthRequest, res: Response) => {
    const saved = await ItineraryService.saveItinerary(req.userId!, req.body);
    return ApiResponse.created(res, saved, "Itinerary saved successfully");
  });

  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const itineraries = await ItineraryService.getUserItineraries(req.userId!);
    return ApiResponse.success(res, itineraries);
  });

  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const itinerary = await ItineraryService.getItineraryById(req.userId!, req.params.id as string);
    return ApiResponse.success(res, itinerary);
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    await ItineraryService.deleteItinerary(req.userId!, req.params.id as string);
    return ApiResponse.success(res, null, "Itinerary deleted successfully");
  });
}
