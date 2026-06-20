"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Ensure upload directory exists
const uploadDir = path_1.default.join(__dirname, '../../public/uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        const uniqueName = `${baseName}_${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
// POST /api/upload - Handle file upload
router.post('/', auth_1.authenticate, auth_1.requireAuth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const publicUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
            success: true,
            url: publicUrl,
            fileName: req.file.originalname,
        });
    }
    catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
