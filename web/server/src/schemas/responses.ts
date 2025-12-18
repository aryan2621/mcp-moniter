import { z } from "zod";

export const ErrorResponseSchema = z.object({
    error: z.string(),
    code: z.string().optional(),
    requestId: z.string().optional(),
    timestamp: z.string(),
});

export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        data: dataSchema,
        requestId: z.string().optional(),
        timestamp: z.string(),
    });

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
