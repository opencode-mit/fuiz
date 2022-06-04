import assert from "assert";
import { Server as HTTPServer } from 'http';
import { Server, Socket } from "socket.io";
import { Hash, SessionID, SocketID } from "../types";

export class ServerSocket {
    private readonly io: Server;
    private readonly socketMapping: Map<
        SocketID,
        { session: SessionID | undefined; socket: Socket }
    >;

    public constructor(
        server: HTTPServer,
        private readonly callback: (session: SessionID, message: any) => void
    ) {
        this.io = new Server(server);
        this.socketMapping = new Map();
        this.start();
    }

    private start() {
        this.io.on("connection", (socket) => {
            // new user has connected, but not assigned to any session
            console.log(socket.id, "connected");
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
        socket.on("action", (message) => this.callback(session, message));
    }

    public broadcast(session: SessionID, message: any) {
        this.io.to(session).emit("action", message);
    }
}
