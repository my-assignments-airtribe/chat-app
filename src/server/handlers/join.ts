import { Server, Socket } from "socket.io";
import { JoinRoomData } from "../types";
import { users, getUsersInRoom } from "../utils";
import { v4 as uuidv4 } from "uuid";

export const handleJoin = (socket: Socket, io: Server) => {
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
};
