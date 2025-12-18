import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcrypt";
import { getEnv } from "../config/env";
import type { JwtPayload } from "../types/index";

function getSecret(): Uint8Array {
    const env = getEnv();
    return new TextEncoder().encode(env.JWT_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function generateJWT(payload: JwtPayload): Promise<string> {
    const env = getEnv();
    return await new SignJWT(payload as unknown as JWTPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(env.JWT_EXPIRY)
        .sign(getSecret());
}

export async function verifyJWT(token: string): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as JwtPayload;
    } catch {
        return null;
    }
}
