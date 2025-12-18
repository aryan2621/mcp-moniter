import { z } from "zod";

const EnvSchema = z.object({
  METRICS_SERVER_URL: z
    .string()
    .url()
    .default("http://localhost:8000/v1/metrics"),
  MCP_API_KEY: z.string().min(64).optional(),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "silent"])
    .default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessage = `Environment validation failed:\n${result.error.issues
      .map((e: any) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n")}`;
    throw new Error(errorMessage);
  }

  cachedEnv = result.data;
  return result.data;
}
