import { app, server, io } from './server';

import { registerSocketHandlers } from './handlers/socket';

registerSocketHandlers(io);

export const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
