import React, { useState, useEffect } from "react";
import socket from "./socket";
import JoinRoom from "./join-room";
import Chat from "./chat";

export interface Message {
  username: string;
  message: string;
  userId: string;
  timestamp: string;
  messageType: string;
}

export interface PrivateMessage {
  content: string;
  fromUserId: string;
  fromUsername: string;
  timestamp: string;
  messageType: string;
}

export interface User {
  username: string;
  userId: string;
  room: string;
}

export function isFileUrl(url: string) {
  const fileUrlPattern = /\.(jpeg|jpg|gif|png|svg|pdf|doc|docx)$/i;
  return fileUrlPattern.test(url);
}

const ChatRoom: React.FC = () => {
  const [room, setRoom] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [fileMessages, setFileMessages] = useState<Message[]>([]);

  const [userId, setUserId] = useState<string>("");

  const rooms = ["Engineering", "Product", "Testing", "Support"];

  useEffect(() => {
    if (room && username) {
      socket.on("message", (message: Message) => {
        if (isFileUrl(message.message)) {
          setFileMessages((prevMessages: Message[]) => [
            ...prevMessages,
            {
              ...message,
              messageType: "file"
            }
          ]);
        } else {
          setMessages((prevMessages: Message[]) => [...prevMessages, {
            ...message,
            messageType: message.username.toLocaleLowerCase() === "admin" ? "admin" : "public"
          }]);
        }
      });
      socket.on("roomData", ({ users }: { users: User[] }) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      socket.off("message");
    };
  }, [room, username]);

  useEffect(() => {
    if (room && username) {
      socket.on("private message", (message: PrivateMessage) => {
        console.log("private message", message);
        setPrivateMessages((prevMessages) => [...prevMessages, {
          ...message,
          messageType: "private"
        }]);
      });
    }
    return () => {
      socket.off("private message");
    };
  }, [room, username]);

  useEffect(() => {
    if (room && username) {
      socket.on("currentUser", ({ userId }: { userId: string }) => {
        setUserId(userId);
      });
    }
    return () => {
      socket.off("currentUser");
    };
  }, [room, username]);

  const handleJoinRoom = () => {
    if (room && username) {
      socket.emit("join", { room, username });
      setJoined(true);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leave", { room, username });
    setJoined(false);
    setRoom("");
    setUsername("");
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
      fileMessages={fileMessages}
      privateMessages={privateMessages}
      onlineUsers={onlineUsers}
      room={room}
      username={username}
      handleLeaveRoom={handleLeaveRoom}
      userId={userId}
    />
  );
};

export default ChatRoom;
