import React from 'react';
import PrivateMessage from './private-message';
import PublicMessage from './public-message';
import AdminMessage from './admin-message';
import FileDisplay from './file-display';
import { CombinedMessageProps } from './chat';

const DisplayMessage: React.FC<{
  message: CombinedMessageProps;
  userId: string;
  username: string;
}> = ({ message, userId, username }) => {
  const { messageType } = message.message;

  // Private message
  if (messageType === 'private' && "content" in message.message) {
    return <PrivateMessage message={message.message} userId={userId} />;
  }

  // Public message
  if (messageType === 'public' && "message" in message.message) {
    return <PublicMessage message={message.message} username={username} userId={userId} />;
  }

  // Admin message
  if (messageType === 'admin' && "username" in message.message ) {
    return <AdminMessage message={message.message} />;
  }

  // File message
  if (messageType === 'file' && "message" in message.message) {
    return (
      <FileDisplay
        userId={userId}
        message={message.message}
      />
    );
  }

  return <></>;
}

export default DisplayMessage;
