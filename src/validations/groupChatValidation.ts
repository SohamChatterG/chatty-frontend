import { z } from "zod"

export const createChatSchema = z.
    object({
        title: z.string()
            .min(1, { message: "chat title must be 1 character long." })
            .max(191, { message: "message title must be less that 191 characters" }),
        passcode: z.string()
            .min(4, { message: "passcode must be 4 character long" })
            .max(25, { message: "message passcode must be less that 25 characters" })
    })

export type createChatSchemaType = z.infer<typeof createChatSchema>