import assert from "assert";
import { GameConfig, SessionID, Hash } from "../types";
import { url } from "./FuizClient";

export class Host {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;

    public constructor() { }

    public async startGame(config: GameConfig): Promise<void> {
        const request = fetch(url + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({jsonConfig: config})
        });
        const json = await (await request).json();
        this.sessionID = json["sessionID"];
        this.token = json["token"];
    }

    public async resolveAction(actionID: number): Promise<Response> {
        //TODO: USE WEBSOCKETS
        assert(this.token !== undefined && this.sessionID !== undefined);
        console.log(JSON.stringify({sessionID: this.sessionID, token: this.token, actionID: actionID}));
        return fetch(url + '/resolve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sessionID: this.sessionID, token: this.token, actionID: actionID})
        });
    }
}