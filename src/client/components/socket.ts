// src/client/socket.ts

import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';
const socket = io(ENDPOINT);

export default socket;
