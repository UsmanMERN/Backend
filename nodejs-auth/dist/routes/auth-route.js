import express from "express";
import { registerUser, loginUser } from "../controllers/auth-controller.js";
const router = express.Router();
// all end points will be defined here
router.post("/register", registerUser);
router.post("/login", loginUser);
export default router;
//# sourceMappingURL=auth-route.js.map