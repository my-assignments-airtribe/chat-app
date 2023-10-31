import React, { useState } from "react";
import socket from "./socket";
import { debounce } from "lodash";
import { Message, User } from "./chat-room";

interface ChatProps {
  room: string;
  onlineUsers: User[];
  messages: Message[];
  username: string;
}

const Chat: React.FC<ChatProps> = ({
  room,
  onlineUsers,
  messages,
  username,
}) => {
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const sendMessage = () => {
    if (currentMessage.trim()) {
      socket.emit("message", { room, message: currentMessage, username });
      setCurrentMessage("");
    }
  };
  const handleKeyDown = debounce(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    }
  );
  return (
    <div>
      <h1>Chat Room: {room}</h1>
      <div>
        Online Users:
        <ul>
          {onlineUsers.map((user, index) => (
            <li key={index}>{user.username}</li>
          ))}
        </ul>
      </div>
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
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
