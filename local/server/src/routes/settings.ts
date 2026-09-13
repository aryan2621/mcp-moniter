import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { instanceSecret } from "../middleware/instance-secret";
import { rateLimit } from "../middleware/rate-limit";
import { instanceSettings } from "../db/postgres/schema";
import type { AppEnv } from "../types/index";

const SETTINGS_ID = "default";
export const DEFAULT_NAME = "MCP Monitor";
export const DEFAULT_DESCRIPTION =
    "Self-hosted observability for MCP servers. Track tool calls, latency, and errors on your own infrastructure.";
const LOGO_SIZES = ["sm", "md", "lg", "xl"] as const;
const DEFAULT_LOGO_SIZE = "md";

function normalizeLogoSize(value?: string | null): (typeof LOGO_SIZES)[number] {
    return LOGO_SIZES.includes(value as (typeof LOGO_SIZES)[number])
        ? (value as (typeof LOGO_SIZES)[number])
        : DEFAULT_LOGO_SIZE;
}
const MAX_LOGO_BYTES = 512 * 1024;
const LOGO_PATTERN =
    /^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/]+={0,2})$/;

const settingsRouter = new Hono<AppEnv>();
settingsRouter.use("*", instanceSecret);
settingsRouter.use("*", rateLimit);

export async function getBranding(db: AppEnv["Variables"]["db"]) {
    const [row] = await db
        .select()
        .from(instanceSettings)
        .where(eq(instanceSettings.id, SETTINGS_ID))
        .limit(1);

    return {
        companyName: row?.companyName || DEFAULT_NAME,
        companyDescription: row?.companyDescription || DEFAULT_DESCRIPTION,
        logoDataUrl: row?.logoDataUrl ?? null,
        logoSize: normalizeLogoSize(row?.logoSize),
    };
}

function parseLogo(dataUrl: string): string {
    const match = LOGO_PATTERN.exec(dataUrl);
    if (!match) {
        throw new Error("Logo must be a PNG, JPEG, WEBP, GIF, or SVG data URL");
    }
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > MAX_LOGO_BYTES) {
        throw new Error("Logo must be 512KB or smaller");
    }
    return dataUrl;
}

settingsRouter.get("/", async (c) => {
    return c.json(await getBranding(c.get("db")));
});

const updateSchema = z.object({
    companyName: z.string().trim().min(1).max(80),
    companyDescription: z.string().trim().max(400).optional().nullable(),
    logoDataUrl: z.string().nullable().optional(),
    logoSize: z.enum(LOGO_SIZES).optional(),
});

settingsRouter.put("/", zValidator("json", updateSchema), async (c) => {
    const db = c.get("db");
    const { companyName, companyDescription, logoDataUrl, logoSize } = c.req.valid("json");
    const nextDescription =
        companyDescription && companyDescription.length > 0 ? companyDescription : null;
    const nextSize = normalizeLogoSize(logoSize);

    let nextLogo: string | null | undefined = logoDataUrl;
    if (typeof logoDataUrl === "string") {
        try {
            nextLogo = parseLogo(logoDataUrl);
        } catch (error) {
            return c.json({ error: (error as Error).message }, 400);
        }
    }

    const [existing] = await db
        .select()
        .from(instanceSettings)
        .where(eq(instanceSettings.id, SETTINGS_ID))
        .limit(1);

    const now = new Date();
    if (!existing) {
        const [created] = await db
            .insert(instanceSettings)
            .values({
                id: SETTINGS_ID,
                companyName,
                companyDescription: nextDescription,
                logoDataUrl: nextLogo === undefined ? null : nextLogo,
                logoSize: nextSize,
                updatedAt: now,
            })
            .returning();
        return c.json({
            companyName: created.companyName,
            companyDescription: created.companyDescription || DEFAULT_DESCRIPTION,
            logoDataUrl: created.logoDataUrl,
            logoSize: normalizeLogoSize(created.logoSize),
        });
    }

    const [updated] = await db
        .update(instanceSettings)
        .set({
            companyName,
            companyDescription: nextDescription,
            ...(nextLogo !== undefined ? { logoDataUrl: nextLogo } : {}),
            logoSize: nextSize,
            updatedAt: now,
        })
        .where(eq(instanceSettings.id, SETTINGS_ID))
        .returning();

    return c.json({
        companyName: updated.companyName,
        companyDescription: updated.companyDescription || DEFAULT_DESCRIPTION,
        logoDataUrl: updated.logoDataUrl,
        logoSize: normalizeLogoSize(updated.logoSize),
    });
});

export default settingsRouter;
