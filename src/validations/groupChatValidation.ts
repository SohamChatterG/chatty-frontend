import { z } from "zod";

export const createChatSchema = z.object({
    title: z.string()
        .min(1, { message: "Chat title must be at least 1 character long." })
        .max(191, { message: "Chat title must be less than 191 characters." }),
    passcode: z.string()
        .min(4, { message: "Passcode must be at least 4 characters long." })
        .max(25, { message: "Passcode must be less than 25 characters." })
        .optional(), // `.optional()` should be at the end
});

export type CreateChatSchemaType = z.infer<typeof createChatSchema>;
