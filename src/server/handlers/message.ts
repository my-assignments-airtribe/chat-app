import { Server, Socket } from "socket.io";
import { ChatMessage } from "../types";

export const handleMessage = (socket: Socket, io: Server) => {
  socket.on("message", ({ room, message, username, userId }: ChatMessage) => {
    const timestamp = new Date().toISOString();
    io.to(room).emit("message", { username, message, userId, timestamp });
    console.log(`Message from ${username} in room ${room}: ${message}`);
  });
};
