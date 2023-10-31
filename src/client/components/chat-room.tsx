// src/client/components/ChatRoom.tsx

import React, { useState, useEffect } from "react";
import socket from "./socket";
import JoinRoom from "./join-room";

interface Message {
  username: string;
  message: string;
}

const ChatRoom: React.FC = () => {
  const [room, setRoom] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState<boolean>(false);

  const rooms = ["Engineering", "Product", "Testing", "Support"];

  useEffect(() => {
    if (room && username) {

      socket.on("message", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      socket.off("message");
    };
  }, [room, username]);

  const sendMessage = () => {
    if (currentMessage.trim()) {
      socket.emit("message", { room, message: currentMessage, username });
      setCurrentMessage("");
    }
  };

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
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Write a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
