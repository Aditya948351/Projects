import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Required in new versions (was missing earlier)
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
