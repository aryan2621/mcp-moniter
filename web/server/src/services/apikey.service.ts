import { randomBytes, createHash } from "crypto";

export function generateApiKey(): string {
    const keyBytes = randomBytes(32);
    return keyBytes.toString("hex");
}

export function hashApiKey(apiKey: string): string {
    return createHash("sha256").update(apiKey).digest("hex");
}

export function validateApiKeyFormat(apiKey: string): boolean {
    return /^[a-f0-9]{64}$/.test(apiKey);
}
