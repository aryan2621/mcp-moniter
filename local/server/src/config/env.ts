import { z } from "zod";

const EnvSchema = z.object({
    POSTGRES_URL: z.string().min(1),
    INSTANCE_SECRET: z.string().min(16),
    PORT: z.coerce.number().int().positive().default(8000),
    HOST: z.string().default("0.0.0.0"),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    CORS_ORIGINS: z.string().optional().default(""),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(inputEnv?: Record<string, unknown>): Env {
    if (cachedEnv) {
        return cachedEnv;
    }

    const envSource =
        inputEnv ??
        (typeof process !== "undefined" ? process.env : undefined);
    const result = EnvSchema.safeParse(envSource);

    if (!result.success) {
        const errorMessage = `Environment validation failed:\n${result.error.errors
            .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
            .join("\n")}`;
        throw new Error(errorMessage);
    }

    cachedEnv = result.data;
    return result.data;
}

export function getEnv(env?: Record<string, unknown>): Env {
    if (env) {
        return validateEnv(env);
    }
    if (cachedEnv) {
        return cachedEnv;
    }
    return validateEnv();
}
