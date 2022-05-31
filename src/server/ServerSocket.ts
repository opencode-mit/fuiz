import assert from "assert";
import { Server, Socket } from "socket.io";
import { Hash, SessionID, SocketID } from "../types";

export class ServerSocket {
  private readonly io: Server;
  private readonly socketMapping: Map<
    SocketID,
    { session: SessionID | undefined; socket: Socket }
  >;

  public constructor(
    private readonly port: number,
    private readonly callback: (message: any) => void
  ) {
    this.io = new Server(this.port);
    this.socketMapping = new Map();
  }

  public start() {
    this.io.on("connection", (socket) => {
      // new user has connected, but not assigned to any session
      this.socketMapping.set(socket.id, { session: undefined, socket: socket });

      socket.on("disconnect", () => {
        // that user disconnected
        this.socketMapping.delete(socket.id);
      });
    });
  }

  public addToSession(socketID: SocketID, session: SessionID) {
    const socketDetails = this.socketMapping.get(socketID);
    assert(socketDetails !== undefined);
    const socket = socketDetails.socket;
    socket.join(session);
    socket.on(session, this.callback);
  }

  public broadcast(session: SessionID, message: any) {
    this.io.to(session).emit(message);
  }
}
