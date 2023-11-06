import { Router } from 'express';
import { upload } from '../middlewares/upload';
import { io } from '../server';

const router = Router();

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).send("No file uploaded.");
  } else {
    if (!req.body.room) {
      res.status(400).send("No room provided.");
    }
    if (!req.body.username) {
      res.status(400).send("No username provided.");
    }
    const timestamp = new Date().toISOString();
    io.in(req.body.room).emit("file", {
      filename: req.file.originalname,
      data: req.file.buffer,
      username: req.body.username,
      userId: req.body.userId,
      timestamp,
    });

    console.log(req.file);
    res.status(201).send("File uploaded successfully.");
  }
});


export default router;
