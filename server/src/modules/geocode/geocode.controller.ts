import type { Request, Response } from "express";
import { GeocodeService } from "./geocode.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

export class GeocodeController {
  static forward = asyncHandler(async (req: Request, res: Response) => {
    const result = await GeocodeService.forward(req.body.query);
    return ApiResponse.success(res, result);
  });

  static reverse = asyncHandler(async (req: Request, res: Response) => {
    const { lat, lng } = req.body;
    const cityName = await GeocodeService.reverse(lat, lng);
    return ApiResponse.success(res, { cityName });
  });
}
