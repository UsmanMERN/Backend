import { ApiKeyModel } from "../models/ApiKeyModel.js";
import type { ApiKeyDoc } from "../models/ApiKeyModel.js";


async function findByKey(key: string): Promise<ApiKeyDoc | null> {
    return ApiKeyModel.findOne({ key, status: true })
}
export default findByKey