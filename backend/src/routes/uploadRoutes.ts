import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest, authenticate, requireAuth } from '../middleware/auth';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueName = `${baseName}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/upload - Handle file upload
router.post('/', authenticate, requireAuth, upload.single('file'), (req: AuthenticatedRequest, res) => {
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
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
