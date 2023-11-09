import multer from 'multer';
import path from 'path';

const uploadsDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination to 'uploads' folder
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Set the filename within the 'uploads' folder
    // You can include a timestamp or random string in the filename to prevent overwrites
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });
