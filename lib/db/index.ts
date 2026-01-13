import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  // Local dev fallback (creates/uses ./database.sqlite)
  "file:./database.sqlite";

const authToken =
  process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || undefined;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
