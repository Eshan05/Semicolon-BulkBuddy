export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly expose: boolean;
  readonly details?: unknown;

  constructor(opts: {
    code: ErrorCode;
    message: string;
    status: number;
    expose?: boolean;
    details?: unknown;
  }) {
    super(opts.message);
    this.code = opts.code;
    this.status = opts.status;
    this.expose = opts.expose ?? true;
    this.details = opts.details;
  }
}

export const errors = {
  unauthorized(message = "Unauthorized") {
    return new AppError({ code: "UNAUTHORIZED", status: 401, message });
  },
  forbidden(message = "Forbidden") {
    return new AppError({ code: "FORBIDDEN", status: 403, message });
  },
  notFound(message = "Not found") {
    return new AppError({ code: "NOT_FOUND", status: 404, message });
  },
  conflict(message = "Conflict", details?: unknown) {
    return new AppError({ code: "CONFLICT", status: 409, message, details });
  },
  validation(message = "Validation error", details?: unknown) {
    return new AppError({
      code: "VALIDATION_ERROR",
      status: 422,
      message,
      details,
    });
  },
  internal(message = "Internal error", details?: unknown) {
    return new AppError({
      code: "INTERNAL",
      status: 500,
      message,
      expose: false,
      details,
    });
  },
};
