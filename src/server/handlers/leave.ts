import { Server, Socket } from "socket.io";
import { JoinRoomData } from "../types";
import { users, getUsersInRoom } from "../utils";

export const handleLeave = (socket: Socket, io: Server) => {
  socket.on("leave", ({ room, username }: JoinRoomData) => {
    socket.leave(room);
    delete users[socket.id];
    const timestamp = new Date().toISOString();
    socket.to(room).emit("message", {
      username: "Admin",
      message: `${username} has left the room.`,
      timestamp,
    });
    io.in(room).emit("roomData", { room, users: getUsersInRoom(room) });
  });
};
