import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedTextTypes = ['text/plain'];

  if (allowedImageTypes.includes(file.mimetype) || allowedTextTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024, // 100 KB
  },
  fileFilter,
});
