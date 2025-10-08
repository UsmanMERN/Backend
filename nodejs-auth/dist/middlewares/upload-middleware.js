import multer from "multer";
import path from "path";
import fs from "fs";
// Ensure the /tmp/uploads directory exists
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const checkFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only images are allowed'));
    }
};
const uploadmiddleware = multer({ storage, fileFilter: checkFileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
export default uploadmiddleware;
//# sourceMappingURL=upload-middleware.js.map