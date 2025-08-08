import express, { type NextFunction, type Request, type Response } from 'express';
import validateRequest, { ValidationSource } from "../helpers/validators.js";
import { ApiKeySchema } from './schema.js';
import { Header } from './utils.js';
import { ForbiddenError } from '../core/CustomError.js';
import findByKey from '../controllers/ApiKeyController.js';

const router = express.Router();

router.use(
    validateRequest(ApiKeySchema, ValidationSource.HEADER),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = req.headers[Header.API_KEY.toLowerCase()]?.toString();
            if (!key) throw new ForbiddenError();

            const apiKey = await findByKey(key);
            if (!apiKey) next(new ForbiddenError());

            req.apiKey = apiKey;
            return next();
        } catch (err) {
            next(err);
        }
    }
);

export default router;
