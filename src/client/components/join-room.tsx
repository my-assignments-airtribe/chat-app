import React from 'react';
import {debounce} from 'lodash';

interface JoinRoomProps {
  setRoom: (room: string) => void;
  room: string;
  username: string;
  setUsername: (username: string) => void;
  handleJoinRoom: () => void;
  rooms: string[];
}

const JoinRoom:React.FC<JoinRoomProps> = ({
  setRoom,
  room,
  rooms,
  username,
  setUsername,
  handleJoinRoom
}) => {

  const handleKeyDown = debounce((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJoinRoom();
    }
  });

  return (
    <div>
        <h1>Join a Chat Room</h1>
        <select onChange={(e) => setRoom(e.target.value)} value={room}>
          <option value="">Select a room</option>
          {rooms.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleJoinRoom} disabled={!room || !username}>Join</button>
      </div>
  )
}

export default JoinRoom;