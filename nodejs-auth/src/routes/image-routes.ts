
import express, { type Request, type Response } from 'express';
import authMiddleware from '../middlewares/auth-middleware.js';
import uploadmiddleware from '../middlewares/upload-middleware.js';
import { getAllImages, uplaodImage } from '../controllers/image-controller.js';


const router = express.Router();


// upload image route
router.post('/upload', authMiddleware, uploadmiddleware.single('image'), uplaodImage);
router.get('/', authMiddleware, getAllImages);


export default router;