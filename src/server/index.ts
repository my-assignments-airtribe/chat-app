import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

interface JoinRoomData {
  room: string;
  username: string;
}

interface ChatMessage {
  room: string;
  message: string;
  username: string;
}

const users: Record<string, JoinRoomData> = {};

const getUsersInRoom = (room: string): JoinRoomData[] => {
  return Object.values(users).filter(user => user.room === room);
};

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('join', ({ room, username }: JoinRoomData) => {
    users[socket.id] = { username, room };
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit('message', { username: 'Admin', message: `${username} has joined the room.` });
    io.in(room).emit('roomData', { room, users: getUsersInRoom(room) });
  });

  socket.on('message', ({ room, message, username }: ChatMessage) => {
    io.to(room).emit('message', { username, message });
    console.log(`Message from ${username} in room ${room}: ${message}`);
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const { username, room } = user;
      socket.to(room).emit('message', { username: 'System', message: `${username} has left the chat.` });
      console.log(`${username} has disconnected`);
      delete users[socket.id];
      const usersInRoom = getUsersInRoom(room);
      io.in(room).emit('roomData', { room, users: getUsersInRoom(room) });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
