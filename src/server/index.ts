import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

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
    });
    io.in(room).emit("roomData", { room, users: getUsersInRoom(room) });
  });

  socket.on("message", ({ room, message, username, userId }: ChatMessage) => {
    io.to(room).emit("message", { username, message, userId });
    console.log(`Message from ${username} in room ${room}: ${message}`);
  });

  socket.on("private message", ({ content, recipientId }) => {
    console.log("private message", content, recipientId, users);

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
      });
    }
  });

  socket.on("leave", ({ room, username }: JoinRoomData) => {
    socket.leave(room);
    console.log(`${username} left room: ${room}`);
    socket.to(room).emit("message", {
      username: "Admin",
      message: `${username} has left the room.`,
    });
    delete users[socket.id];
    io.in(room).emit("roomData", { room, users: getUsersInRoom(room) });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      const { username, room } = user;
      socket.to(room).emit("message", {
        username: "Admin",
        message: `${username} has left the chat.`,
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
