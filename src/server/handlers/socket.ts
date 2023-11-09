// import { Server } from "socket.io";
// import { v4 as uuidv4 } from "uuid";
// import { users, getUsersInRoom } from "../utils";
// import { ChatMessage, JoinRoomData } from "../types";

import { Server } from "socket.io";
import { handleJoin } from "./join";
import { handleMessage } from "./message";
import { handlePrivateMessage } from "./private-message";
import { handleLeave } from "./leave";
import { handleDisconnect } from "./disconnect";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    handleJoin(socket, io);
    handleMessage(socket, io);
    handlePrivateMessage(socket, io);
    handleLeave(socket, io);
    handleDisconnect(socket, io);
  });
};