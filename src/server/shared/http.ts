import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { logger } from "../observability/logger";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true as const, data }, init);
}

export function jsonError(err: unknown) {
  if (err instanceof AppError) {
    const body = {
      ok: false as const,
      error: {
        code: err.code,
        message: err.expose ? err.message : "Internal error",
        details: err.expose ? err.details : undefined,
      },
    };
    return NextResponse.json(body, { status: err.status });
  }

  logger.error({ err }, "Unhandled error");
  return NextResponse.json(
    { ok: false as const, error: { code: "INTERNAL", message: "Internal error" } },
    { status: 500 }
  );
}
