import type { ApiKeyDoc } from "../../models/ApiKeyModel";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUserType;
            apiKey?: ApiKeyDoc;
        }
    }
}
