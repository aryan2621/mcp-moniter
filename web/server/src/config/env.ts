import { z } from "zod";

const EnvSchema = z.object({
    POSTGRES_URL: z.string().url(),
    MONGO_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRY: z.string().default("7d"),
    PORT: z.coerce.number().int().positive().default(8000),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
    if (cachedEnv) {
        return cachedEnv;
    }

    const result = EnvSchema.safeParse(process.env);

    if (!result.success) {
        const errorMessage = `Environment validation failed:\n${result.error.errors
            .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
            .join("\n")}`;
        throw new Error(errorMessage);
    }

    cachedEnv = result.data;
    return result.data;
}

export function getEnv(): Env {
    if (!cachedEnv) {
        throw new Error("Environment not validated. Call validateEnv() first");
    }
    return cachedEnv;
}
