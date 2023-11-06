import React, { useCallback, useEffect, useState } from "react";
import socket from "./socket";
import { debounce, set } from "lodash";
import { Message, PrivateMessage, User } from "./chat-room";
import { DateTime } from "luxon";
import FileDisplay from "./file-display";

interface ChatProps {
  room: string;
  onlineUsers: User[];
  messages: Message[];
  username: string;
  handleLeaveRoom: () => void;
  privateMessages: PrivateMessage[];
  userId: string;
  fileMessages: Message[];
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
  fileMessages
}) => {
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

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

  // const handleKeyDown = useCallback(
  //   debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
  //     if (event.key === "Enter") {
  //       sendMessage();
  //     }
  //   }),
  //   [sendMessage]
  // );

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

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sendFile = async ({
    file,
    room,
    username,
    userId,
  }: {
    file: File;
    room: string;
    username: string;
    userId: string;
  }) => {
    console.log("file", file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("room", room);
    formData.append("username", username);
    formData.append("userId", userId);

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      console.log("File uploaded successfully.");
      const { fileUrl } = await response.json();
      socket.emit("message", {
        room,
        message: fileUrl, // Send the file URL as the message content
        username,
        userId,
        timestamp: new Date().toISOString(), // Send the current timestamp
      });
      setFile(null);
    } else {
      console.log("File upload failed.");
    }
  };

  const combinedMessages: CombinedMessageProps[] = [
    ...messages.map((message) => ({ message })),
    ...privateMessages.map((message) => ({ message })),
  ].sort((a, b) => {
    if ("timestamp" in a.message && "timestamp" in b.message) {
      return (
        new Date(a.message.timestamp).getTime() -
        new Date(b.message.timestamp).getTime()
      );
    }
    return 0;
  });

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
                className={
                  recipientId === user.userId ? "selected-private-message" : ""
                }
                onClick={() =>
                  recipientId
                    ? setRecipientId("")
                    : user.userId !== userId && setRecipientId(user.userId)
                }
                key={user.userId} // Use a unique identifier as the key
              >
                {recipientId === user.userId ? "Messaging Private : " : ""}
                {user.username}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-messages">
          {combinedMessages.map((combined, index) => {
            if (
              "username" in combined.message &&
              combined.message.username === "Admin"
            ) {
              return (
                <div className="admin-user message-bubble" key={index}>
                  <strong>{combined.message.username} </strong>
                  <span>{combined.message.message}</span>
                  <span className="small">
                    {DateTime.fromISO(combined.message.timestamp).toFormat(
                      "HH:mm"
                    )}
                  </span>
                </div>
              );
            }
            if (
              "username" in combined.message &&
              username === combined.message.username &&
              combined.message.userId === userId
            ) {
              return (
                <div className={`current-user message-bubble`} key={index}>
                  {/* <strong>{combined.message.username} </strong> */}
                  <span>{combined.message.message}</span>
                  <span className="small">
                    {DateTime.fromISO(combined.message.timestamp).toFormat(
                      "HH:mm"
                    )}
                  </span>
                </div>
              );
            }
            if (
              "username" in combined.message &&
              username !== combined.message.username &&
              combined.message.userId !== userId
            ) {
              return (
                <div className={`other-user message-bubble`} key={index}>
                  <strong>{combined.message.username} </strong>
                  <span>{combined.message.message}</span>
                  <span className="small">
                    {DateTime.fromISO(combined.message.timestamp).toFormat(
                      "HH:mm"
                    )}
                  </span>
                </div>
              );
            }
            if ("fromUsername" in combined.message && combined.message.fromUserId === userId) {
              return (
                <div className="current-user private message-bubble" key={index}>
                  {/* <span>{combined.message.content}</span> */}
                  <span className="small">
                    {DateTime.fromISO(combined.message.timestamp).toFormat(
                      "HH:mm"
                    )}
                  </span>
                </div>
              );
            }
            if ("fromUsername" in combined.message && combined.message.fromUserId !== userId) {
              return (
                <div className="other-user private message-bubble" key={index}>
                  <strong>
                    Private Message from: {combined.message.fromUsername}{" "}
                  </strong>
                  <span>{combined.message.content}</span>
                  <span className="small">
                    {DateTime.fromISO(combined.message.timestamp).toFormat(
                      "HH:mm"
                    )}
                  </span>
                </div>
              );
            }
          })}
          <FileDisplay userId={userId} />
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
        <form
          className="footer"
          onSubmit={(e) => {
            // limit file size to 5MB
            // if (file && file.size > 5242880) {
            //   alert("File size too large. Maximum file size is 5MB.");
            //   // Clear the file input
            //   if (fileInputRef.current) {
            //     fileInputRef.current.value = "";
            //   }
            //   return true;
            // }
            e.preventDefault();
            sendMessage();
            if (file) {
              sendFile({ file, room, username, userId });
            }
            // Clear the file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            // onKeyDown={handleKeyDown}
            placeholder="Break the ice..."
          />
          <input
            type="file"
            onChange={(e) => {
              e.target.files && setFile(e.target.files[0]);
            }}
            ref={fileInputRef} // Reference to the file input element
          />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
};

export default Chat;
