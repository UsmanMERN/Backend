import { z } from "zod"
import { Header } from "./utils.js"


export const ApiKeySchema = z.object({
    apiKey: z.object({
        [Header.API_KEY]: z.string().nonempty("Api key is required")
    })
})