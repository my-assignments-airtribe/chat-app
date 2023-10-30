import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket: Socket) => {
  console.log('New user connected');

  socket.on('join', (room: string) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
    socket.to(room).emit('message', `A new user has joined the room ${room}`);
  });

  socket.on('message', (message: { room: string; text: string }) => {
    io.to(message.room).emit('message', message.text);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
