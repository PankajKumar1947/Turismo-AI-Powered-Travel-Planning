import type { Request, Response } from "express";
import { RecommendService } from "./recommend.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

export class RecommendController {
  static getPlaces = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const places = await RecommendService.getPlaceRecommendations(req.body);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return ApiResponse.success(res, places);
  });

  static getRoutes = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { origin, selectedPlaces } = req.body;
    const routesMap = await RecommendService.getRoutesForPlaces(origin, selectedPlaces);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return ApiResponse.success(res, routesMap);
  });

  static aggregate = asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();
    const itinerary = await RecommendService.aggregateToItinerary(req.body);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return ApiResponse.success(res, itinerary);
  });
}
