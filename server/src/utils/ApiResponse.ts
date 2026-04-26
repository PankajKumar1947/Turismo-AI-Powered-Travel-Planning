import type { Response } from "express";

export class ApiResponse<T = unknown> {
  constructor(
    public statusCode: number,
    public data: T,
    public message: string = "Success",
    public success: boolean = statusCode < 400
  ) {}

  static success<T>(res: Response, data: T, message: string = "Success", statusCode: number = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  static created<T>(res: Response, data: T, message: string = "Created successfully") {
    return this.success(res, data, message, 201);
  }
}
