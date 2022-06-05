import { io, Socket } from "socket.io-client";
import { SessionID, SocketID } from "../types";
import { Deferred } from "../game/Deferred";

export class ClientSocket {
    private readonly socket: Socket;
    public readonly deferred: Deferred<void>;

    public constructor(
        public readonly session: SessionID,
        callback: (session: SessionID, message: any) => void
    ) {
        this.socket = io();
        this.deferred = new Deferred();
        this.socket.on("connect", () => {
            console.log("connected!");
            this.deferred.resolve();
        });

        this.socket.on("disconnect", () => {
            this.socket.connect(); // try reconnecting
        });

        this.socket.on("action", (message) => callback(session, message));
    }

    public sendMessage(message: any) {
        this.socket.emit("action", message);
    }

    public get id(): SocketID {
        return this.socket.id;
    }
}

export async function makeConnectedSocket(
    session: SessionID,
    callback: (sessionID: SessionID, message: any) => void
): Promise<ClientSocket> {
    const clientSocket = new ClientSocket(session, callback);
    await clientSocket.deferred.promise;
    return clientSocket;
}
