import { z } from "zod";

const EnvSchema = z.object({
  METRICS_SERVER_URL: z
    .string()
    .url()
    .default("http://localhost:8000/v1/metrics"),
  MCP_MONITOR_SECRET: z.string().min(16),
  MCP_SERVER_NAME: z.string().min(1).default("todo-mcp"),
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
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`;
    throw new Error(errorMessage);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
