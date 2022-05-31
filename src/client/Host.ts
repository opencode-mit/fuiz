import { GameConfig, SessionID, Hash } from "../types";
import { url } from "./FuizClient";

class Host {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;

    public constructor() { }

    public async startGame(config: GameConfig): Promise<void> {
        const request = fetch(url + '/register', {method: 'POST', body: JSON.stringify({jsonConfig: config})});
        const json = await (await request).json();
        this.sessionID = json["sessionID"];
        this.token = json["token"];
    }

    public async resolveAction(actionID: number): Promise<Response> {
        //TODO: USE WEBSOCKETS
        return fetch(url + `/resolve/${this.sessionID}/${this.token}/${actionID}`);
    }
}