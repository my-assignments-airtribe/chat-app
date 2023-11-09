import { JoinRoomData } from "../types";

export const users: Record<string, JoinRoomData> = {};

export const getUsersInRoom = (room: string): JoinRoomData[] => {
  return Object.values(users).filter(user => user.room === room);
};
