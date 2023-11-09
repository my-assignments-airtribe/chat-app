export interface JoinRoomData {
  room: string;
  username: string;
  userId: string;
}

export interface ChatMessage {
  room: string;
  message: string;
  username: string;
  userId: string;
  timestamp: string;
}
