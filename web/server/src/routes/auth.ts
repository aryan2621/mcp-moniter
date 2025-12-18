import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { setCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
import { db } from "../db/postgres/client";
import { users } from "../db/postgres/schema";
import { jwtAuth } from "../middleware/auth-jwt";
import {
    hashPassword,
    verifyPassword,
    generateJWT,
} from "../services/auth.service";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types/index";

const authRouter = new Hono<AppEnv>();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

authRouter.post("/register", zValidator("json", registerSchema), async (c) => {
    const { email, password, name } = c.req.valid("json");

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return c.json({ error: "Email already registered" }, 400);
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
        .insert(users)
        .values({
            email,
            passwordHash,
            name: name || null,
        })
        .returning();

    const token = await generateJWT({
        userId: newUser.id,
        email: newUser.email,
    });

    await setCookie(c, "auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return c.json({
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            createdAt: newUser.createdAt,
        },
    });
});

authRouter.post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        return c.json({ error: "Invalid credentials" }, 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
        return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = await generateJWT({
        userId: user.id,
        email: user.email,
    });

    await setCookie(c, "auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return c.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        },
    });
});

authRouter.get("/me", jwtAuth, async (c) => {
    const user = c.get("user");
    return c.json(user);
});

authRouter.post("/logout", async (c) => {
    deleteCookie(c, "auth-token");
    return c.json({ success: true });
});

export default authRouter;
