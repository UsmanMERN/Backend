import { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import type { Permissions } from "../models/ApiKeyModel.js";
import { ForbiddenError } from "../core/CustomError.js";


function permission(permission: Permissions): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.apiKey?.permissions) {
                return next(new ForbiddenError("Permission denied"))
            }

            const exists = req.apiKey.permissions.includes(permission as Permissions)
            if (!exists) {
                return next(new ForbiddenError("Permission Denied"))
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

export default permission