import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF resumes are supported!'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
