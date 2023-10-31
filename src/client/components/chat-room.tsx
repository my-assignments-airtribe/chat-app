// src/client/components/ChatRoom.tsx

import React, { useState, useEffect } from 'react';
import socket from './socket';

interface Message {
  username: string;
  message: string;
}

const ChatRoom: React.FC = () => {
  const [room, setRoom] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState<boolean>(false);

  const rooms = ['Engineering', 'Product', 'Testing', 'Support'];

  useEffect(() => {
    if (room && username) {
      socket.emit('join', { room, username });

      socket.on('message', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      socket.off('message');
    };
  }, [room, username]);

  const sendMessage = () => {
    if (currentMessage.trim()) {
      socket.emit('message', { room, message: currentMessage, username });
      setCurrentMessage('');
    }
  };

  const handleJoinRoom = () => {
    if (room && username) {
      setJoined(true);
    }
  };

  if (!joined) {
    return (
      <div>
        <h1>Join a Chat Room</h1>
        <select onChange={(e) => setRoom(e.target.value)} value={room}>
          <option value="">Select a room</option>
          {rooms.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleJoinRoom} disabled={!room || !username}>Join</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Chat Room: {room}</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Write a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
