import React from "react";
import { PrivateMessage } from "./chat-room";
import { DateTime } from "luxon";

const PrivateMessageComponent: React.FC<{
  message: PrivateMessage;
  userId: string;
}> = ({ message, userId }) => {
  if (message.fromUserId === userId) {
    return (
      <div className="current-user private message-bubble">
        <span className="small">
          {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
        </span>
      </div>
    );
  }
  return (
    <div className="other-user private message-bubble">
      <strong>Private Message from: {message.fromUsername} </strong>
      <span>{message.content}</span>
      <span className="small">
        {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
      </span>
    </div>
  );
};

export default PrivateMessageComponent;
