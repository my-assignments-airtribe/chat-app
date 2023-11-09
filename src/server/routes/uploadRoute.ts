import { Router } from 'express';
import { upload } from '../middlewares/upload';
import { io } from '../server';

const router = Router();

router.post('/upload', upload.single('file'), (req, res) => {
  // Check for the existence of the file, room, and username in the request
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  if (!req.body.room) {
    return res.status(400).send("No room provided.");
  }
  if (!req.body.username) {
    return res.status(400).send("No username provided.");
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`; 

  // Emit the file information to all clients in the room
  // Figure out a better way to do this
  io.in(req.body.room).emit("file", {
    filename: req.file.filename, 
    fileUrl, // Send file URL
    username: req.body.username,
    userId: req.body.userId,
    timestamp: new Date().toISOString(),
  });

  // Respond with the file URL
  res.status(201).json({ fileUrl }); // Combine the response here
});

export default router;