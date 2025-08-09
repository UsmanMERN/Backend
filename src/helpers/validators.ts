import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { BadRequestError } from "../core/CustomError.js";

export enum ValidationSource {
    BODY = "body",
    QUERY = "query",
    HEADER = "headers",
    PARAMS = "params"
}

const validateRequest = (schema: ZodType, source: ValidationSource) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = schema.parse(req[source])
            Object.assign(req[source], data)
            next()
        } catch (error) {

            if (error instanceof ZodError) {
                const message = (error as ZodError).issues.map(e => e.message).join(", ");
                return next(new BadRequestError(message))
            }
            next(error)
        }
    }
}

export default validateRequest