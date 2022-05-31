import { io, Socket } from "socket.io-client";
import { SessionID } from "../types";
import { Deferred } from "../game/Deferred";

export class ClientSocket {
  private readonly socket: Socket;
  public readonly deferred: Deferred<void>;

  public constructor(
    public readonly session: SessionID,
    callback: (message: any) => void
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

    this.socket.on(session, callback);
  }

  public sendMessage(message: any) {
    this.socket.emit(this.session, message);
  }
}

async function makeConnectedSocket(
  session: SessionID,
  callback: (message: any) => void
): Promise<ClientSocket> {
  const clientSocket = new ClientSocket(session, callback);
  await clientSocket.deferred.promise;
  return clientSocket;
}
