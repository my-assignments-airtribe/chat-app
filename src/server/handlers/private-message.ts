import { Server, Socket } from "socket.io";
import { users } from "../utils";

export const handlePrivateMessage = (socket: Socket, io: Server) => {
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
};
