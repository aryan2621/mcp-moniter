import type { Config } from "drizzle-kit";

export default {
     schema: "./src/db/postgres/schema.ts",
     out: "./src/db/postgres/migrations",
     driver: "pg",
     dbCredentials: {
          connectionString: process.env.POSTGRES_URL || "",
     },
} satisfies Config;
