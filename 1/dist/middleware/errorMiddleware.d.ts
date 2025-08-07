import type { NextFunction, Request, Response, ErrorRequestHandler } from "express";
declare const errorHandler: ErrorRequestHandler;
declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export { errorHandler, notFound };
//# sourceMappingURL=errorMiddleware.d.ts.map