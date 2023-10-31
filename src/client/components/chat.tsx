import React, { useCallback, useState } from "react";
import socket from "./socket";
import { debounce } from "lodash";
import { Message, PrivateMessage, User } from "./chat-room";
import {DateTime} from 'luxon';

interface ChatProps {
  room: string;
  onlineUsers: User[];
  messages: Message[];
  username: string;
  handleLeaveRoom: () => void;
  privateMessages: PrivateMessage[];
  userId: string;
}

interface CombinedMessageProps {
  message: Message | PrivateMessage;
}

const Chat: React.FC<ChatProps> = ({
  room,
  onlineUsers,
  messages,
  username,
  handleLeaveRoom,
  privateMessages,
  userId,
}) => {
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");

  const sendMessage = useCallback(() => {
    if (currentMessage.trim()) {
      socket.emit("message", {
        room,
        message: currentMessage,
        username,
        userId,
      });
      setCurrentMessage("");
    }
  }, [currentMessage, room, username]);

  const handleKeyDown = useCallback(
    debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    }),
    [sendMessage]
  );

  const sendPrivateMessage = useCallback(
    (content: string) => {
      if (content.trim() && recipientId.trim()) {
        socket.emit("private message", { content, recipientId });
        setCurrentMessage("");
      }
    },
    [recipientId]
  );

  const handleKeyDownPrivateMessage = useCallback(
    debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        sendPrivateMessage(currentMessage);
      }
    }),
    [currentMessage, sendPrivateMessage]
  );

  // const messageBubbleClassNames = useCallback(
  //   (message: Message) => {
  //     if (message.username === "Admin") {
  //       return "admin-user message-bubble";
  //     }
  //     if (username === message.username && message.socketId === userId) {
  //       return `current-user message-bubble`;
  //     } else {
  //       return `other-user message-bubble`;
  //     }
  //   },
  //   [username, userId]
  // );

  const combinedMessages: CombinedMessageProps[] = [
    ...messages.map((message) => ({ message })),
    ...privateMessages.map((message) => ({ message })),
  ].sort((a, b) => {
    if ("timestamp" in a.message && "timestamp" in b.message) {
      return new Date(a.message.timestamp).getTime() - new Date(b.message.timestamp).getTime();
    }
    return 0;
  })
  
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
            {onlineUsers.map((user) => (
              <li
                className={recipientId === user.userId ? "selected-private-message" : ""}
                onClick={() =>
                  recipientId
                    ? setRecipientId("")
                    : user.userId !== userId && setRecipientId(user.userId)
                }
                key={user.userId} // Use a unique identifier as the key
              >
                {recipientId === user.userId ? 'Messaging Private : ' : '' }{user.username}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-messages">
          {
            combinedMessages.map((combined, index) => {
              if ("username" in combined.message && combined.message.username === "Admin") {
                return (
                  <div className="admin-user message-bubble" key={index}>
                    <strong>{combined.message.username} </strong>
                    <span>{combined.message.message}</span>
                    <span className="small">{DateTime.fromISO(combined.message.timestamp).toFormat("HH:mm")}</span>
                  </div>
                );
              }
              if ("username" in combined.message && username === combined.message.username && combined.message.userId === userId) {
                return (
                  <div className={`current-user message-bubble`} key={index}>
                    <strong>{combined.message.username} </strong>
                    <span>{combined.message.message}</span>
                    <span className="small">{DateTime.fromISO(combined.message.timestamp).toFormat("HH:mm")}</span>
                  </div>
                );
              }
              if ("username" in combined.message && username !== combined.message.username && combined.message.userId !== userId) {
                return (
                  <div className={`other-user message-bubble`} key={index}>
                    <strong>{combined.message.username} </strong>
                    <span>{combined.message.message}</span>
                    <span className="small">{DateTime.fromISO(combined.message.timestamp).toFormat("HH:mm")}</span>
                  </div>
                );
              }
              if ("fromUsername" in combined.message) {
                return (
                  <div className="private message-bubble" key={index}>
                    <strong>Private Message from: {combined.message.fromUsername} </strong>
                    <span>{combined.message.content}</span>
                    <span className="small">{DateTime.fromISO(combined.message.timestamp).toFormat("HH:mm")}</span>
                  </div>
                );
              }
            }
          )}
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
