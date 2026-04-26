export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public errors: unknown;
  public data: null;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Helper for 400 Bad Request
  static badRequest(message: string, errors: unknown = []) {
    return new ApiError(400, message, errors);
  }

  // Helper for 401 Unauthorized
  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(401, message);
  }

  // Helper for 403 Forbidden
  static forbidden(message: string = "Forbidden") {
    return new ApiError(403, message);
  }

  // Helper for 404 Not Found
  static notFound(message: string = "Not Found") {
    return new ApiError(404, message);
  }

  // Helper for 409 Conflict
  static conflict(message: string) {
    return new ApiError(409, message);
  }

  // Helper for 500 Internal Server Error
  static internal(message: string = "Internal Server Error") {
    return new ApiError(500, message);
  }
}

// Add data property to ApiError for compatibility with some logging libraries if needed
(ApiError.prototype as any).data = null;
