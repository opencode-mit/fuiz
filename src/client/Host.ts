import assert from "assert";
import { GameConfig, SessionID, Hash, Action } from "../types";
import { ClientSocket, makeConnectedSocket } from "./ClientSocket";
import { url } from "./FuizClient";

export class Host {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;
    private socket: ClientSocket | undefined;

    public constructor() { }

    public async startGame(config: GameConfig): Promise<void> {
        const request = fetch(url + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jsonConfig: config })
        });
        const json = await (await request).json();
        this.sessionID = json["sessionID"];
        this.token = json["token"];
        this.socket = await makeConnectedSocket(json["sessionID"], (sessionID, message) => this.onReciveAction(sessionID, message));
        const watchRequest = fetch(url + '/watchSocket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID: json["sessionID"], socketID: this.socket.id })
        });
    }

    public async resolveAction(actionID: number): Promise<Response> {
        //TODO: USE WEBSOCKETS
        assert(this.token !== undefined && this.sessionID !== undefined);
        return fetch(url + '/resolve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID: this.sessionID, token: this.token, actionID: actionID })
        });
    }

    private onReciveAction(sessionID: SessionID, action: Action): void {
        if (sessionID != this.sessionID) return;
        console.log(action);
    }
}