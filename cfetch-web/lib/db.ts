import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var cfetchPgPool: Pool | undefined;
}

export const dbPool =
  globalThis.cfetchPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.cfetchPgPool = dbPool;
}
