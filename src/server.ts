import http from "http";
import app from "./app";
import { initializeSocket } from "./sockets/socketServer";
import dotenv from "dotenv";

dotenv.config();

const server = http.createServer(app);
initializeSocket(server); // initialize socket.io

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
