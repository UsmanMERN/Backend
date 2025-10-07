import express from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
const router = express.Router();
router.use(authMiddleware);
router.get("/home", (req, res) => {
    console.log('req.user :>> ', req.user);
    res.json({ success: true, message: "Welcome to the Home Route" });
});
export default router;
//# sourceMappingURL=home-routes.js.map