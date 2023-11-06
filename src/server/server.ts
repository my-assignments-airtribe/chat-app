import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from "cors";
import uploadRoute from './routes/uploadRoute';

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(uploadRoute);

export { app, server, io };
