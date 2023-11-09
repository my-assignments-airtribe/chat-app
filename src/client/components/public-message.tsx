import React from "react";
import { Message } from "./chat-room";
import { DateTime } from "luxon";

const PublicMessage: React.FC<{
  message: Message;
  userId: string;
  username: string;
}> = ({ message, userId, username }) => {
  if (username === message.username && message.userId === userId) {
    return (
      <div className={`current-user public message-bubble`}>
        {/* <strong>{combined.message.username} </strong> */}
        <span>{message.message}</span>
        <span className="small">
          {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
        </span>
      </div>
    );
  }
  if (
    "username" in message &&
    username !== message.username &&
    message.userId !== userId
  ) {
    return (
      <div className={`other-user message-bubble`}>
        <strong>{message.username} </strong>
        <span>{message.message}</span>
        <span className="small">
          {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
        </span>
      </div>
    );
  }
};

export default PublicMessage
