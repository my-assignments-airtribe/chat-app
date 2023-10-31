// src/client/components/ChatRoom.tsx

import React, { useState, useEffect } from "react";
import socket from "./socket";
import JoinRoom from "./join-room";
import Chat from "./chat";

export interface Message {
  username: string;
  message: string;
}

export interface User {
  username: string;
  id: string;
}

const ChatRoom: React.FC = () => {
  const [room, setRoom] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  const rooms = ["Engineering", "Product", "Testing", "Support"];

  useEffect(() => {
    if (room && username) {
      socket.on("message", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      socket.on("roomData", ({ users }: { users: User[] }) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      socket.off("message");
    };
  }, [room, username]);

  

  const handleJoinRoom = () => {
    if (room && username) {
      socket.emit("join", { room, username });
      setJoined(true);
    }
  };
  

  if (!joined) {
    return (
      <JoinRoom
        username={username}
        setUsername={setUsername}
        handleJoinRoom={handleJoinRoom}
        room={room}
        rooms={rooms}
        setRoom={setRoom}
      />
    );
  }

  return (
    <Chat
      messages={messages}
      onlineUsers={onlineUsers}
      room={room}
      username={username}
    />
  );
};

export default ChatRoom;
