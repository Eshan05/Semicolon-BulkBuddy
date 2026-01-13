import { z } from "zod";
import { errors } from "./errors";

export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw errors.validation("Invalid request", parsed.error.flatten());
  }
  return parsed.data as z.infer<T>;
}
