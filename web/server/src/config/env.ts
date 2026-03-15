import { z } from "zod";

const EnvSchema = z.object({
    POSTGRES_URL: z.string().url(),
    INFLUX_URL: z.string().url(),
    INFLUX_TOKEN: z.string().min(1),
    INFLUX_ORG: z.string().min(1),
    INFLUX_BUCKET: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_PUBLISHABLE_KEY: z.string().optional(),
    PORT: z.coerce.number().int().positive().default(8000),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(inputEnv?: Record<string, any>): Env {
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

export function getEnv(env?: Record<string, any>): Env {
    if (env) {
        return validateEnv(env);
    }
    if (cachedEnv) {
        return cachedEnv;
    }
    return validateEnv();
}
