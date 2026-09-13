export function generateApiKey(): string {
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(keyBytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function hashApiKey(apiKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function validateApiKeyFormat(apiKey: string): boolean {
    return /^[a-f0-9]{64}$/.test(apiKey);
}
