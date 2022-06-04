import { Hash, PlayerID, SessionID } from "../types";
import { url } from "./FuizClient";

export class Client {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;

    public constructor() { }

    public async registerGame(playerID: PlayerID, sessionID: SessionID) {
        const request = fetch(url + '/registerPlayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sessionID: sessionID, playerID: playerID})
        });
        const json = await (await request).json();
        this.sessionID = sessionID;
        this.token = json["token"];
    }
}