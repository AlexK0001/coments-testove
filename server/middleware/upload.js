import multer from 'multer';
// import path from 'path';
import fs from 'fs';

// Створити директорію, якщо не існує
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 100000 // 100 KB
  },
  fileFilter(req, file, cb) {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedTextTypes = ['text/plain'];

    if (file.fieldname === 'image') {
      if (!allowedImageTypes.includes(file.mimetype)) {
        return cb(new Error('❌ Only .jpg, .png, .gif allowed'));
      }
    }

    if (file.fieldname === 'textFile') {
      if (!allowedTextTypes.includes(file.mimetype)) {
        return cb(new Error('❌ Only .txt files are allowed'));
      }
    }

    cb(null, true);
  }
});

