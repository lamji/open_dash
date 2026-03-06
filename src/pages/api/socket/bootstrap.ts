import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import { Server as SocketIOServer } from "socket.io";
import { registerSocketServer } from "@/lib/socket-server";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  console.log(`Debug flow: socketBootstrap handler fired with`, {
    hasServer: !!res.socket.server.io,
  });

  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log(`Debug flow: socketBootstrap connection fired with`, {
        socketId: socket.id,
      });
    });

    res.socket.server.io = io;
    registerSocketServer(io);
  } else {
    registerSocketServer(res.socket.server.io);
  }

  res.status(200).json({ ok: true });
}
