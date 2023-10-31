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

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', ({ room, username }: JoinRoomData) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit('message', { username: 'Admin', message: `${username} has joined the room.` });
  });

  socket.on('message', ({ room, message, username }: ChatMessage) => {
    io.to(room).emit('message', { username, message });
    console.log(`Message from ${username} in room ${room}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
