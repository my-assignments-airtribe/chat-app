import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

interface JoinRoomData {
  room: string;
  username: string;
  userId: string;
}

interface ChatMessage {
  room: string;
  message: string;
  username: string;
  userId: string;
  timestamp: string;
}

const users: Record<string, JoinRoomData> = {};

const getUsersInRoom = (room: string): JoinRoomData[] => {
  const usersInRoom: JoinRoomData[] = [];
  Object.keys(users).forEach((id) => {
    if (users[id].room === room) {
      usersInRoom.push(users[id]);
    }
  });
  return usersInRoom;
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
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

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join", ({ room, username }: JoinRoomData) => {
    const userId = uuidv4();
    users[socket.id] = { username, room, userId };
    socket.join(room);

    socket.emit("currentUser", { username, userId });
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit("message", {
      username: "Admin",
      message: `${username} has joined the room.`,
      timestamp: new Date().toISOString(),
    });
    io.in(room).emit("roomData", { room, users: getUsersInRoom(room) });
  });

  socket.on("message", ({ room, message, username, userId }: ChatMessage) => {
    const timestamp = new Date().toISOString();
    io.to(room).emit("message", { username, message, userId, timestamp });
    console.log(`Message from ${username} in room ${room}: ${message}`);
  });

  socket.on("private message", ({ content, recipientId }) => {
    console.log("private message", content, recipientId, users);
    const timestamp = new Date().toISOString();

    // Find the socket ID of the recipient based on their unique user ID
    const recipientSocketId = Object.keys(users).find(
      (socketId) => users[socketId].userId === recipientId
    );

    console.log("recipientSocketId", recipientSocketId);

    // If a socket ID is found, emit a private message to that socket
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("private message", {
        content,
        fromUserId: users[socket.id].userId, // Sender's user ID
        fromUsername: users[socket.id].username, // Sender's username for display purposes
        timestamp,
      });
      io.to(socket.id).emit("private message", {
        content,
        fromUserId: users[socket.id].userId, // Sender's user ID
        fromUsername: users[socket.id].username, // Sender's username for display purposes
        timestamp,
      });
    }
  });

  socket.on("leave", ({ room, username }: JoinRoomData) => {
    socket.leave(room);
    console.log(`${username} left room: ${room}`);
    const timestamp = new Date().toISOString();
    socket.to(room).emit("message", {
      username: "Admin",
      message: `${username} has left the room.`,
      timestamp,
    });
    delete users[socket.id];
    io.in(room).emit("roomData", { room, users: getUsersInRoom(room) });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      const { username, room } = user;
      const timestamp = new Date().toISOString();
      socket.to(room).emit("message", {
        username: "Admin",
        message: `${username} has left the chat.`,
        timestamp,
      });
      console.log(`${username} has disconnected`);
      delete users[socket.id];
      io.in(room).emit("roomData", { room, users: getUsersInRoom(room) });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
