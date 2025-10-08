import express, {} from 'express';
import authMiddleware from '../middlewares/auth-middleware.js';
import uploadmiddleware from '../middlewares/upload-middleware.js';
import { uplaodImage } from '../controllers/image-controller.js';
const router = express.Router();
// upload image route
router.post('/upload', authMiddleware, uploadmiddleware.single('image'), uplaodImage);
export default router;
//# sourceMappingURL=image-routes.js.map