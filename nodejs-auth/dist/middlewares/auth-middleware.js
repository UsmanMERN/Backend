import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next) => {
    console.log('hey their');
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error: ", error.message);
        return res.status(403).json({ success: false, message: "Forbidden: Invalid token" });
    }
};
export default authMiddleware;
//# sourceMappingURL=auth-middleware.js.map