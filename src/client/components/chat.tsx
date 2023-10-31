import React, { useCallback, useState } from "react";
import socket from "./socket";
import { debounce } from "lodash";
import { Message, PrivateMessage, User } from "./chat-room";

interface ChatProps {
  room: string;
  onlineUsers: User[];
  messages: Message[];
  username: string;
  handleLeaveRoom: () => void;
  privateMessages: PrivateMessage[];
  userId: string;
}

const Chat: React.FC<ChatProps> = ({
  room,
  onlineUsers,
  messages,
  username,
  handleLeaveRoom,
  privateMessages,
  userId
}) => {
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");

  const sendMessage = useCallback(() => {
    if (currentMessage.trim()) {
      socket.emit("message", { room, message: currentMessage, username, userId });
      setCurrentMessage("");
    }
  }, [currentMessage, room, username]);

  const handleKeyDown = useCallback(
    debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    }), [sendMessage]
  );

  const sendPrivateMessage = useCallback((content: string) => {
    if (content.trim() && recipientId.trim()) {
      socket.emit("private message", { content, recipientId });
      setCurrentMessage("");
    }
  }, [recipientId]);

  const handleKeyDownPrivateMessage = useCallback(
    debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        sendPrivateMessage(currentMessage);
      }
    }), [currentMessage, sendPrivateMessage]
  );

  

  const messageBubbleClassNames = (message: Message) => {
    if (message.username === "Admin") {
      return "admin-user message-bubble";
    }
    if (username === message.username && message.socketId === socket.id) {
      return `current-user message-bubble`;
    } else {
      return `other-user message-bubble`;
    }
  };
  return (
    <div className="chat-container">
      <div className="heading">
        <h1>Chat Room: {room}</h1>
        <button onClick={handleLeaveRoom}>Leave Room</button>
      </div>
      <div className="body">
        <div className="left">
          <h3>Online Users</h3>
          <ul>
            {onlineUsers.map((user, index) => (
              <li
                onClick={() => user.userId !== userId && setRecipientId(user.userId)}
                key={index}
              >
                {user.username}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div className={messageBubbleClassNames(message)} key={index}>
              {message.socketId !== socket.id ? (
                <strong>{message.username} </strong>
              ) : (
                <></>
              )}
              <span>{message.message}</span>
            </div>
          ))}
          {
            privateMessages.map((message, index) => (
              <div className="private message-bubble" key={index}>
                <strong>Private Message from: {message.fromUsername}  </strong>
                <span>{message.content}</span>
              </div>
            ))
          }
        </div>
      </div>
      {recipientId ? (
        <div className="footer">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDownPrivateMessage}
            placeholder={`Sending Private Message to ${
              onlineUsers.find((user) => user.userId === recipientId)?.username
            }`}
          />
          <button onClick={() => sendPrivateMessage(currentMessage)}>
            Send
          </button>
        </div>
      ) : (
        <div className="footer">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Break the ice..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default Chat;
