import { DateTime } from "luxon";
import React from "react";
import { Message } from "./chat-room";

const AdminMessage: React.FC<{
  message: Message;
}> = ({ message }) => {
  return (
    <div className="admin-user message-bubble">
      <strong>{message.username} </strong>
      <span>{message.message}</span>
      <span className="small">
        {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
      </span>
    </div>
  );
};

export default AdminMessage;
