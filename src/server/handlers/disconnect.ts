import { Server, Socket } from "socket.io";
import { users, getUsersInRoom } from "../utils";

export const handleDisconnect = (socket: Socket, io: Server) => {
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      const { username, room } = user;
      delete users[socket.id];
      const timestamp = new Date().toISOString();
      socket.to(room).emit("message", {
        username: "Admin",
        message: `${username} has left the chat.`,
        timestamp,
      });
      io.in(room).emit("roomData", { room, users: getUsersInRoom(room) });
    }
  });
};
