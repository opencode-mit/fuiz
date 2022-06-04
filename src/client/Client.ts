import { Hash, PlayerID, SessionID } from "../types";
import { makeConnectedSocket, ClientSocket } from "./ClientSocket";
import { url } from "./FuizClient";

export class Client {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;
    private socket: ClientSocket | undefined;

    public constructor() { }

    public async registerGame(playerID: PlayerID, sessionID: SessionID) {
        this.socket = await makeConnectedSocket(sessionID, (m) => console.log(m));
        console.log({socketID: this.socket.id, sessionID: sessionID, playerID: playerID});
        const request = fetch(url + '/registerPlayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({socketID: this.socket.id, sessionID: sessionID, playerID: playerID})
        });
        const json = await (await request).json();
        this.sessionID = sessionID;
        this.token = json["token"];
    }
}