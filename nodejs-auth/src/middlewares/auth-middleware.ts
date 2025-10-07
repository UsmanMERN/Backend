import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('hey their');
    const authHeaders = req.headers['authorization'];

    const token = authHeaders && authHeaders.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).user = decoded;
        next();
    } catch (error: any) {
        console.error("JWT Verification Error: ", error.message);
        return res.status(403).json({ success: false, message: "Forbidden: Invalid token" });
    }

}

export default authMiddleware;